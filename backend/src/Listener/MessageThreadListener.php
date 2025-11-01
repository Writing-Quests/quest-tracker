<?php

namespace App\Listener;

use DateTime;
use App\Entity\User;
use App\Entity\MessageThread;
use App\Service\NotificationService;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;

use Symfony\Component\Uid\Ulid;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class MessageThreadListener
{
  public function prePersist(MessageThread $thread) {
    $thread->setCode(new Ulid());
  }
}