<?php

namespace App\State;

use App\Entity\User;
use App\Entity\Connection;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\Doctrine\Orm\Paginator;

class AvailableProfilesProvider implements ProviderInterface
{
  public function __construct(
      private Security $security,
      private EntityManagerInterface $entityManager,
      private readonly Pagination $pagination
  ) {
  }

  public function provide(Operation $operation, array $uriVariables = [], array $context = []): Paginator
  {
    $user = $this->security->getUser();
    [$page, , $limit] = $this->pagination->getPagination($operation, $context);
    if($user) {
      $user_id = $user->getId();
      return new Paginator($this->entityManager->getRepository(User::class)->getAllPublicUsersAndConnections($user_id));
    } else {
      return new Paginator($this->entityManager->getRepository(User::class)->getAllPublicUsers($page, $limit));
    }
  }
}
