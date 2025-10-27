<?php

namespace App\Listener;

use DateTime;
use App\Entity\User;
use App\Entity\Connection;
use App\Service\MailerService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ConnectionListener
{
  private $token_storage;
  private $mailer;
  private $entityManager;
  private $notify; 

  public function __construct(TokenStorageInterface $token_storage,MailerInterface $mailer,EntityManagerInterface $entityManager, NotificationService $notify) {
      $this->token_storage = $token_storage;
      $this->mailer = $mailer;
      $this->entityManager = $entityManager;
      $this->notify = $notify;
      return $this;
  }
  public function prePersist(Connection $connection) {
    $connection->setCreatedAt(new DateTime());
    $connection->setChangedAt(new DateTime());
  }

  public function preUpdate(Connection $connection) {
    //$connection->setCreatedAt(new DateTime());
    $connection->setChangedAt(new DateTime());
  }

  public function postPersist(Connection $connection): void
  {
    if ($connection->getStatus() == 'pending') {
      $initiatingUser =  $this->entityManager->getRepository(User::class)->findOneBy(['id'=>$connection->getInitiatingUserId()]);
      $iuUsername = $initiatingUser->getUsername();
      $connectedUser = $this->entityManager->getRepository(User::class)->findOneBy(['id'=>$connection->getConnectedUserId()]);
      $this->notify->sendSocialNotification($connectedUser, $initiatingUser, "$iuUsername has sent you a buddy request.", ['mailerTemplate'=>'connection', 'notificationLink'=> "/profile/$iuUsername", 'connectionId'=>$connection->getId()]);
    }
  }
}