<?php
namespace App\Listener;

use DateTimeImmutable;
use App\Entity\User;

use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class UserListener
{
  private $token_storage;
  private $mailer;
  private $entityManager;

  public function __construct(TokenStorageInterface $token_storage,MailerInterface $mailer,EntityManagerInterface $entityManager) { 
  // TODO: mailer isn't being used her _yet_ but I can envision it so I've made it available
    $this->token_storage = $token_storage;
    $this->mailer = $mailer;
    $this->entityManager;
    return $this;
  }

  public function prePersist(User $user) { // copy/paste from the ProjectListener for the editedAt fields
    $user->setCreatedAt(new DateTimeImmutable());
    $user->setEditedAt(new DateTimeImmutable());
  }
  
  public function preUpdate(PreUpdateEventArgs $event) {
    $user = $event->getObject();
    $user->setEditedAt(new DateTimeImmutable());
  }
}
?>