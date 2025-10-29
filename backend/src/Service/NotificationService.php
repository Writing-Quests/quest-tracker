<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Notification;
use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

use DateTime;
use DateTimeImmutable;

class NotificationService
{
  private $currentDateTime;

  public function __construct(
    private TokenStorageInterface $token_storage,
    private MailerService $sendEmail,
    private EntityManagerInterface $entityManager
  ) {
    $this->currentDateTime = (new DateTimeImmutable);
    return $this;
  }

  public function standardizeContext($contextArray)
  {
    // since we are likely to get a variable amount of context items for notifications, make it a straightforward named object
    // object so that I can do -> instead of []
    $standardContext = [];
    foreach ($contextArray[0] as $key => $value) {
      $standardContext[$key] = $value;
    }
    return (object)$standardContext;
  }

  public function sendSocialNotification($targetUser, $sourceUser, $content, ...$contextArray)
  {
    $context = $this->standardizeContext($contextArray);

    $notification = (new Notification())
      ->setUser($targetUser)
      ->setCreatedAt($this->currentDateTime)
      ->setContent($content);
    if (isset($context->notificationLink)) {
      $notification->setNotificationLink($context->notificationLink);
    }
    $this->entityManager->persist($notification);
    $this->entityManager->flush();

    if ($targetUser->getSendEmailNotifications()) {
      if (isset($context->mailerTemplate)) {
        switch ($context->mailerTemplate) {
          case "connection":
            ($this->sendEmail)->newConnectionRequest($targetUser, $sourceUser, $context->connectionId);
            break;

          case "message":
            ($this->sendEmail)->newDmReceived($context->message, $targetUser, $sourceUser,$context->notificationLink);
            break;
        }
      } else {
        // send a generic email notification
        if (!isset($context->subject)) {
          $context->subject = "Update from Questy";
        }
        ($this->sendEmail)->genericEmailNotification($targetUser->getEmail(), $context->subject, $content);
      }
    }
  }

  public function sendSystemNotification($content, ...$contextArray)
  {
    $context = $this->standardizeContext($contextArray);
    if ($context->user) {
      $user = $context->user;
    } else if ($this->token_storage->getToken()) { // this does not work without a user
      $user = $this->token_storage->getToken()->getUser();
    }
    $notification = (new Notification())
      ->setUser($user)
      ->setCreatedAt($this->currentDateTime)
      ->setContent($content);
    if (isset($context->notificationLink)) {
      $notification->setNotificationLink($context->notificationLink);
    }
    $this->entityManager->persist($notification);
    $this->entityManager->flush();

    if (isset($context->mailerTemplate)) {
      switch ($context->mailerTemplate) {
        case "passwordChanged":
          ($this->sendEmail)->notificationPasswordChange($user->getEmail(), $context->changedAt);
          break;

        case "emailChanged":
          ($this->sendEmail)->changedEmailVerification($context->user, $context->emailUrl, $context->expiresAt);
          break;
      }
    } else {
      if (!isset($context->subject)) {
        $context->subject = "Update from Questy";
      }
      ($this->sendEmail)->genericEmailNotification($user->getEmail(), $context->subject, $content);
    }
  }

  public function emailNotificationOnly($content, ...$contextArray)
  {
    $context = $this->standardizeContext($contextArray);
    if (isset($context->mailerTemplate)) {
      switch ($context->mailerTemplate) {
        case "startedResetPassword":
          ($this->sendEmail)->createPasswordReset($context->user, $context->emailUrl, $context->expiresAt);
          break;
      }
    } else {
      if (!isset($context->subject)) {
        $context->subject = "Update from Questy";
      }
      ($this->sendEmail)->genericEmailNotification($context->email, $context->subject, $content);
    }
  }
}
