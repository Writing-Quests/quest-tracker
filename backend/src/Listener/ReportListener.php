<?php

namespace App\Listener;
use DateTime;
use App\Entity\Report;
use App\Service\MailerService;
use Symfony\Component\Mailer\MailerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Symfony\Component\Uid\Ulid;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
class ReportListener
{
  private $token_storage;
  private $mailer;
  public function __construct(TokenStorageInterface $token_storage,MailerInterface $mailer) {
      $this->token_storage = $token_storage;
      $this->mailer = $mailer;
      return $this;
  }
  public function prePersist(Report $report) {
    $report->setCreatedAt(new DateTime());
    $report->setCode(new Ulid());
    $report->setReportedByUser($this->token_storage->getToken()->getUser());
  }

  public function postPersist(Report $report): void
  {
      $report_email = (new MailerService)->reportSubmitted($report);
      $this->mailer->send($report_email);
      $receipt_email = (new MailerService)->reportReceipt($report);
      $this->mailer->send($receipt_email);
  }
}
