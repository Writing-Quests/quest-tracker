<?php

namespace App\Listener;

use DateTime;
use App\Entity\User;
use App\Entity\Connection;
use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ConnectionListener
{
  private $token_storage;
  private $mailer;
  private $entityManager;
  public function __construct(TokenStorageInterface $token_storage,MailerInterface $mailer,EntityManagerInterface $entityManager) {
      $this->token_storage = $token_storage;
      $this->mailer = $mailer;
      $this->entityManager =$entityManager;
      return $this;
  }
  public function prePersist(Connection $connection) {
    $connection->setCreatedAt(new DateTime());
    $connection->setChangedAt(new DateTime());
  }

  public function preUpdate(Connection $connection) {
    $connection->setCreatedAt(new DateTime());
    $connection->setChangedAt(new DateTime());
  }

  public function postPersist(Connection $connection): void
  {
      //$connection_email = (new MailerService)->reportSubmitted($connection);
      //$this->mailer->send($connection_email);
      //$receipt_email = (new MailerService)->reportReceipt($connection);
      //$this->mailer->send($receipt_email);
  }
}
