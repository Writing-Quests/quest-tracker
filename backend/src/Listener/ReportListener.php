<?php

namespace App\Listener;
use DateTime;
use App\Entity\Report;
use App\Service\Mailer;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
class ReportListener
{
  private $token_storage;
  private $mailer;
  public function __construct(TokenStorageInterface $token_storage,Mailer $mailer) {
      $this->token_storage = $token_storage;
      $this->mailer = $mailer;
      return $this;
  }
  public function prePersist(Report $report) {
      $report->setCreatedAt(new DateTime());
  }

  public function postUpdate(Report $report, PostUpdateEventArgs $event): void {
    $this->mailer->reportSubmitted($report);
  }
}
