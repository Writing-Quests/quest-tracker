<?php

namespace App\Listener;

use DateTimeImmutable;
use App\Entity\User;
use App\Entity\DirectMessage;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class DirectMessageListener
{
  private $token_storage;
  private $mailer;
  private $entityManager;
  private $notify; 

  public function __construct(TokenStorageInterface $token_storage,EntityManagerInterface $entityManager, NotificationService $notify) {
      $this->token_storage = $token_storage;
      $this->entityManager = $entityManager;
      $this->notify = $notify;
      return $this;
  }
  public function prePersist(DirectMessage $message) {
    if (!$message->getSentAt()) {
      $message->setSentAt(new DateTimeImmutable());
    }
  }

  public function postPersist(DirectMessage $message): void
  {
    $toUser = $this->entityManager->getRepository(User::class)->findOneBy(['id'=>$message->getToUserId()]);
    $fromUser = $this->entityManager->getRepository(User::class)->findOneBy(['id'=>$message->getFromUserId()]);
    $fromUsername = $fromUser->getUsername();
    $messageThreadCode = $message->getMessageCode();
    $this->notify->sendSocialNotification($toUser, $fromUser, "$fromUsername sent you a direct message.", ['mailerTemplate'=>'message', 'notificationLink'=> "/message/$messageThreadCode", 'message'=>$message]);
  }
}