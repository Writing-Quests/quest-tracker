<?php
namespace App\Controller;

use Exception;

use App\Entity\User;
use App\Entity\Connection;
use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

#[AsController]
class ConnectionController extends AbstractController
{
  public $entityManager;
  public $mailer;
  public function __construct(EntityManagerInterface $entityManager,MailerInterface $mailer)
  {
    $this->entityManager = $entityManager;
    $this->mailer = $mailer;
  }

  #[Route('/api/connection/all', name: 'all_user_connections', methods: ['GET'])]
  public function all_user_connections (#[CurrentUser] ?User $user): JsonResponse {
    if (!$user) {
      return null;
    } else {
      $user_id = $user->getId();
      $all_connections = $this->entityManager->getRepository(Connection::class)->getAllUserConnections($user_id);
      $blocked = $this->entityManager->getRepository(Connection::class)->getBlockedUsers($user_id);
      $sorted_connections = [
        'mutual'=>[],
        'following'=>[],
        'waiting'=>[],
        'pending'=>[],
        'blocked'=>$blocked
      ];
      foreach ($all_connections as $conn) {
        switch (true) {
          case $conn['status'] == 'mutual':
            array_push($sorted_connections['mutual'],$conn);
          break;
          
          case $conn['status'] == 'following':
            array_push($sorted_connections['following'],$conn);
          break;

          case $conn['initiating_user_id'] != $user_id && $conn['status'] == 'pending':
            array_push($sorted_connections['waiting'],$conn);
          break;

          case $conn['initiating_user_id'] == $user_id && $conn['status'] == 'pending':
            array_push($sorted_connections['pending'],$conn);
          break;
        }
      }
      return $this->json($sorted_connections);
    }
  }

  #[Route('/api/connection/feed', name: 'all_feed_connections', methods: ['GET'])]
  public function all_feed_connections (#[CurrentUser] ?User $user): JsonResponse {
    if (!$user) {
      return null;
    } else {
      $mutuals = $this->entityManager->getRepository(Connection::class)->getUserMutuals($user->getId());
      $following = $this->entityManager->getRepository(Connection::class)->getUserFollowing($user->getId());
      return $this->json(['mutuals'=>$mutuals,'following'=>$following]);
    }
  }

  #[Route('/api/connection/status/{user1}/{user2}',name: 'user_connection_status', methods: ['GET'])]
  public function user_connection_status (#[CurrentUser] ?User $user, Int $user1, Int $user2): JsonResponse {
    if (!$user) {
      return null;
    } else {
      $resp = [];
      $connection = $this->entityManager->getRepository(Connection::class)->getUserConnectionStatus($user1,$user2);
      if (!$connection) {
        $resp['connected'] = false;
        $resp['status'] = null;
      } else {
        $resp = $connection[0];
      }
      return $this->json($resp);
    }
  }
}