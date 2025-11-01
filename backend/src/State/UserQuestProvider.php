<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\Quest;
use App\Entity\User;
use App\Dto\QuestProgressDto;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class UserQuestProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
      $loggedInUser = $this->security->getUser();
      $username = $uriVariables['username'] ?? null;
      $questId = $uriVariables['id'] ?? null;
      if(!$username || !$questId) {
        throw new NotFoundHttpException('User or quest not provided.');
      }
      $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
      $quest = $this->entityManager->getRepository(Quest::class)->findOneBy(['id' => $questId]);
      if(!$user || !$quest) {
        throw new NotFoundHttpException('User or quest not valid.');
      }
      // TODO: Replace this with a voter
      if(!$user->isPublic()) {
          if(!$loggedInUser || $user->getUsername() != $username) {
              throw new AccessDeniedHttpException('Access denied');
          }
      }
      $questProgressDto = new QuestProgressDto($quest, $user);

      // Get all progress entries that are a part of this quest
      $res = $this->entityManager->createQueryBuilder()
                  ->select('pe')
                  ->from('App\\Entity\\ProgressEntry', 'pe')
                  ->innerJoin('pe.project', 'p')
                  ->where('p.user = :user')
                  ->setParameter('user', $user)
                  ->andWhere('pe.entry_date >= :start_date')
                  ->setParameter('start_date', $quest->getStartDate())
                  ->andWhere('pe.entry_date <= :end_date')
                  ->setParameter('end_date', $quest->getEndDate())
                  ->andWhere('pe.type = :goal_type')
                  ->setParameter('goal_type', $quest->getGoalType())
                  ->andWhere('pe.units = :goal_units')
                  ->setParameter('goal_units', $quest->getGoalUnits())
                  ->getQuery()
                  ->getResult();
      $questProgressDto->progressEntries = $res;
      $questProgressDto->quest = $quest;
      $total = '0.00';
      foreach($res as $row) {
        $total = bcadd($total, $row->getValue(), 2);
      }
      $questProgressDto->total = $total;
      $questProgressDto->percent = (float) $total / (float) $quest->getGoalAmount();
      $questProgressDto->completed = bccomp($total, $quest->getGoalAmount(), 2) >= 0 ? true : false;
      return $questProgressDto;
    }
}
