<?php

namespace App\State;

use App\Entity\User;
use App\Entity\Connection;
use App\Entity\FeedEntry;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\Doctrine\Orm\Paginator;

class ConnectionFeedProvider implements ProviderInterface
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
    [$page, $limit] = $this->pagination->getPagination($operation, $context);
    if (!$user) {
      return null;
    } else {
      $user_id = $user->getId();
      $mutual = $this->entityManager->getRepository(Connection::class)->getUserMutuals($user_id);
      $following = $this->entityManager->getRepository(Connection::class)->getUserFollowing($user_id);
      $feed_connections = [...$mutual,...$following];
      $buddy_ids = [];
      foreach ($feed_connections as $conn) {
        if ($conn["initiating_user_id"] != $user_id) {
          array_push($buddy_ids,$conn["initiating_user_id"]);
         } else {
          array_push($buddy_ids, $conn["connected_user_id"]);
         }
      }
      return new Paginator($this->entityManager->getRepository(FeedEntry::class)->getFullUserFeed($buddy_ids,$page,$limit));
    }
  }
}