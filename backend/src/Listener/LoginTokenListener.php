<?php

namespace App\Listener;

use DateTimeImmutable;
use App\Entity\LoginToken;
use App\Entity\User;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class LoginTokenListener
{

  public function __construct(
    private TokenStorageInterface $token_storage,
    private EntityManagerInterface $entityManager,
    private NotificationService $notify
  ) {}

  public function prePersist(LoginToken $token)
  {
    $token->setSecret(bin2hex(random_bytes(32)));
    $token->setCreatedAt(new DateTimeImmutable());
    $token->setExpiresAt(new \DateTimeImmutable('now +24 hours'));
  }

  public function postPersist(LoginToken $token)
  {
    $email = $token->getPayload();
    $this->entityManager->getRepository(LoginToken::class)->removeUserOldTokensOfType($email, $token->getType(), $token->getId());
    $changedAt = (new \DateTimeImmutable())->format('F jS, Y \a\t g:i a \(e\)');
    if ($token->getType() == 'verify-email') {
      $this->notify->sendSystemNotification("Email verification link sent to $email on $changedAt.", [
        'mailerTemplate' => "emailChanged",
        'user' => $token->getUser(),
        'emailUrl' => $token->getVerificationUrl(),
        'expiresAt' => $token->getExpiresAt()
      ]);
    } else {
      $this->notify->emailNotificationOnly("A password reset link was sent on $changedAt.", [
        'mailerTemplate' => "startedResetPassword",
        'user' => $token->getUser(),
        'emailUrl' => $token->getVerificationUrl(),
        'expiresAt' => $token->getExpiresAt()
      ]);
    }
  }
}
