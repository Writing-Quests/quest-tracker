<?php

namespace App\Listener;

use DateTime;
use App\Entity\User;
use App\Entity\Report;
use App\Entity\Project;
use App\Service\MailerService;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Symfony\Component\Uid\Ulid;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ReportListener
{
  public function __construct(
    private TokenStorageInterface $token_storage,
    private MailerService $sendEmail,
    private EntityManagerInterface $entityManager
  ) {}

  public function prePersist(Report $report) {
    $report->setCreatedAt(new DateTime());
    $report->setCode(new Ulid());
    switch ($report->getType()) {
      case 'Profile':
        $reportedData = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $report->getReportedIdentifier()]);
      break;

      case 'Project':
        $reportedData = $this->entityManager->getRepository(Project::class)->findOneBy(['code' => $report->getReportedIdentifier()]);
      break;
    }
    $report->setSnapshot($reportedData->makeSnapshot());
    $report->setReportedByUser($this->token_storage->getToken()->getUser());
  }

  public function preUpdate(Report $report) {
    $report->setCreatedAt(new DateTime());
    $report->setReviewedByUser($this->token_storage->getToken()->getUser());
  }

  public function postPersist(Report $report): void
  {
      ($this->sendEmail)->reportSubmitted($report);
      ($this->sendEmail)->reportReceipt($report);
  }
}
