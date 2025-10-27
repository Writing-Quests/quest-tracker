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

class MutualsOpenDms implements ProviderInterface
{
  public function __construct(
      private Security $security,
      private EntityManagerInterface $entityManager
  ) {
  }

  public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
  {
    $user = $this->security->getUser();
    if($user) {
      $user_id = $user->getId();
      $open_dms = [];
      $mutuals = $this->entityManager->getRepository(Connection::class)->getUserMutuals($user_id);
      foreach ($mutuals as $conn) {
        $other_user_id = $conn['initiating_user_id'] != $user_id ? $conn['initiating_user_id'] : $conn['connected_user_id'];
        $other_user = ($this->entityManager->getRepository(User::class)->findOneBy(['id' => $other_user_id]));
        $user_open_dms = $other_user->getAllowDms();
        if ($user_open_dms) {
          array_push($open_dms, ['username'=>$other_user->getUsername(), 'id'=>$other_user->getId()]);
        }
      }
      return $open_dms;
    } else {
      return [];
    }
  }
}
