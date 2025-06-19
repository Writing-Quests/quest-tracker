<?php
namespace App\Controller;

use Exception;

use App\Entity\User;
use App\Entity\Connection;
use App\Entity\FeedEntry;
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
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[AsController]
class ConnectionController extends AbstractController
{
  public $entityManager;
  public $mailer;
  private $user;
  public function __construct(EntityManagerInterface $entityManager,MailerInterface $mailer,TokenStorageInterface $token_storage)
  {
    $this->entityManager = $entityManager;
    $this->mailer = $mailer;
    if ($token_storage->getToken()) {
      $this->user = $token_storage->getToken()->getUser();
    } else {
      $this->user = null;
    }
  }

  #[Route('/api/connection/all', name: 'all_user_connections', methods: ['GET'])]
  public function all_user_connections (): JsonResponse {
    if (!$this->user) {
      return $this->json(null);
    } else {
      $user_id = $this->user->getId();
      $all_connections = $this->entityManager->getRepository(Connection::class)->getAllUserConnections($user_id);
      $blocked = $this->entityManager->getRepository(Connection::class)->getBlockedUsers($user_id);
      $sorted_connections = [
        'mutual'=>[],
        'following'=>[],
        'waiting'=>[],
        'pending'=>[],
        'ignored'=>[]
      ];
      foreach ($all_connections as $conn) {
        switch (true) {
          case $conn['initiating_user_id'] != $user_id && $conn['status'] == 'pending':
            array_push($sorted_connections['waiting'],$conn);
          break;

          case $conn['initiating_user_id'] == $user_id && $conn['status'] == 'pending':
            array_push($sorted_connections['pending'],$conn);
          break;

          case $conn['status'] != 'blocked': // handling this seperately so as not to cross-polinate
            array_push($sorted_connections[$conn['status']],$conn);
          break;
        }
      }
      $sorted_connections['blocked'] = $blocked;
      return $this->json($sorted_connections);
    }
  }

  #[Route('/api/connection/feed', name: 'all_feed_connections', methods: ['GET'])]
  public function all_feed_connections (): JsonResponse {
    if (!$this->user) {
      return $this->json(null);
    } else {
      $user_id = $this->user->getId();
      $mutual = $this->entityManager->getRepository(Connection::class)->getUserMutuals($user_id);
      $following = $this->entityManager->getRepository(Connection::class)->getUserFollowing($user_id);
      $feed_connections = [...$mutual,...$following];
      $enriched_connections = [
        'mutual'=>[],
        'following'=>[],
      ];
      foreach ($feed_connections as $buddy) {
        $this_user_data = [];
        if ($buddy["initiating_user_id"] != $user_id) {
          $buddy_id = $buddy["initiating_user_id"];
         } else {
          $buddy_id = $buddy["connected_user_id"];
         }
        $this_user_data['buddy_id'] = $buddy_id;
        $user_info = $this->entityManager->getRepository(User::class)->findOneBy(['id'=>$buddy_id]);
        $this_user_data['updates'] = $user_info->getFeedEntrys();
        $this_user_data += $buddy;
        array_push($enriched_connections[$buddy['status']],$this_user_data);
      }
      return $this->json($enriched_connections);
    }
  }

  #[Route('/api/connection/status/{user1}/{user2}',name: 'user_connection_status', methods: ['GET'])]
  public function user_connection_status (String $user1, String $user2): JsonResponse {
    if (!$this->user) {
      return $this->json(null);
    } else {
      $user1id = $this->entityManager->getRepository(User::class)->findOneBy(['username'=>$user1])->getId();
      $user2id = $this->entityManager->getRepository(User::class)->findOneBy(['username'=>$user2])->getId();
      $connection = $this->entityManager->getRepository(Connection::class)->getUserConnectionStatus($user1id,$user2id);
      if (!$connection) {
        return $this->json(null);
      } else {
        return $this->json($connection[0]);
      }
    }
  }
}