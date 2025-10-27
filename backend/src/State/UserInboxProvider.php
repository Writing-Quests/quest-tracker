<?php

namespace App\State;

use App\Entity\User;
use App\Entity\MessageThread;
use App\Entity\DirectMessage;
use App\Entity\Connection;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\Doctrine\Orm\Paginator;


/*
* ON THE TOPIC OF $thread[0] (and t[0] from Messages.jsx):
*   there's a goofy thing happening here; for pagination of the inbox, I want to sort by the last message sent in the thread
*   this is stored in direct message, so we have a subquery in ->getUserMessageThreads()
*   but then the object that comes back is:
*
*     {
*       0: {thread}
*       thread_last_updated: {datetime}
*     }
*
I'm not sure exactly *why* but it does successfully sort the messages, so pagination will work. i have decided to just roll with it, to my annoyance.
*/

class UserInboxProvider implements ProviderInterface
{
  public function __construct(
    private Security $security,
    private EntityManagerInterface $entityManager,
    private readonly Pagination $pagination
  ) {}

  public function provide(Operation $operation, array $uriVariables = [], array $context = []): Paginator|null
  {
    $user = $this->security->getUser();
    [$page,, $limit] = $this->pagination->getPagination($operation, $context);
    if ($user) {
      $user_id = $user->getId();
      $threads = new Paginator($this->entityManager->getRepository(MessageThread::class)->getUserMessageThreads($user_id, $page, $limit));
      foreach ($threads as $thread) {
        $thread[0]->setInMyInbox($user_id);
        $read_status = $this->entityManager->getRepository(DirectMessage::class)->threadHasUnreadForMe($thread[0]->getId(), $user_id);
        $thread[0]->setIsUnreadForMe($read_status);
        if ($thread[0]->getSenderUserId() == $user_id) { // the message was initiated by the logged in user
          $other_user_id = $thread[0]->getReceivingUserId();
        } else { // the message was initiating by the Other User in this one-on-one thread
          $other_user_id = $thread[0]->getSenderUserId();
        }
        $other_user_entity = $this->entityManager->getRepository(User::class)->findOneBy(['id' => $other_user_id]);
        if ($other_user_entity) {
          $connection = $this->entityManager->getRepository(Connection::class)->getUserConnectionStatus($other_user_id, $user_id);
          if ($connection) {
            // two users may have been connected but now are not. how we proceed depends on if the other user is public and if one user blocked the other
            if ($connection->getStatus() == 'mutual') { // still friends
              $thread[0]->setOtherUserDetails($other_user_entity);
              $thread[0]->setReplyAvailable(true);
            } elseif ($connection->getStatus() != 'blocked' && $other_user_entity->isPublic()) {
              $thread[0]->setOtherUserDetails($other_user_entity);
            }
          } elseif ($other_user_entity->isPublic()) {
            $thread[0]->setOtherUserDetails($other_user_entity);
          }
        }
      }
      return $threads;
    } else {
      return null;
    }
  }
}
