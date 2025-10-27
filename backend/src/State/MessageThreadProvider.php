<?php

namespace App\State;

use App\Entity\User;
use App\Entity\MessageThread;
use App\Entity\Connection;
use App\Entity\DirectMessage;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\Doctrine\Orm\Paginator;

class MessageThreadProvider implements ProviderInterface
{
  public function __construct(
    private Security $security,
    private EntityManagerInterface $entityManager,
    private readonly Pagination $pagination
  ) {}

  // TODO: can i paginate the messages? ideal, for long message threads
  public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
  {
    $user = $this->security->getUser();
    [$page,, $limit] = $this->pagination->getPagination($operation, $context);
    if ($user) {
      $user_id = $user->getId();
      $message_code = $uriVariables['code'];
      $thread = $this->entityManager->getRepository(MessageThread::class)->findOneBy(['code' => $message_code]);
      if ($thread->getSenderUserId() == $user_id) { // the message was initiated by the logged in user
        $other_user_id = $thread->getReceivingUserId();
      } else { // the message was initiating by the Other User in this one-on-one thread
        $other_user_id = $thread->getSenderUserId();
      }
      $other_user_entity = $this->entityManager->getRepository(User::class)->findOneBy(['id' => $other_user_id]);
      if ($other_user_entity) {
        $connection = $this->entityManager->getRepository(Connection::class)->getUserConnectionStatus($other_user_id, $user_id);
        if ($connection) {
          // two users may have been connected but now are not. how we proceed depends on if the other user is public and if one user blocked the other
          if ($connection[0]->getStatus() == 'mutual') { // still friends
            $thread->setOtherUserDetails($other_user_entity);
            $thread->setReplyAvailable(true);
          } elseif ($connection[0]->getStatus() != 'blocked' && $other_user_entity->isPublic()) {
            $thread->setOtherUserDetails($other_user_entity);
          }
        }
      }
      $messages = $thread->getAllMessages();
      /*
      foreach ($messages as $msg) {
        $msg->setSentByMe($user);
      }
        */
      return (object)[
        'connection' => $connection,
        'thread' => $thread,
        'messages' => $messages
      ];
    } else {
      return null;
    }
  }
}
