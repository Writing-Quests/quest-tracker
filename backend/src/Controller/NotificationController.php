<?php

namespace App\Controller;

use App\Entity\Notification;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;


final class NotificationController extends AbstractController
{
    public $entityManager;
    public $user;
    private $token_storage;

    public function __construct(EntityManagerInterface $entityManager, TokenStorageInterface $token_storage)
    {
      $this->entityManager = $entityManager;
      $this->token_storage = $token_storage;
      if ($token_storage->getToken()) {
        $this->user = $token_storage->getToken()->getUser();
      } else {
        $this->user = null;
      }
    }

    #[Route('/api/notifications/bulk', name: 'mark_read_bulk', methods: ['PATCH'])]
    public function index(Request $req): JsonResponse
    {
      if ($this->user) {
        $POST = $req->getPayload();
        $notification_ids = [];
        foreach ($POST as $notif) {
          array_push($notification_ids, $notif['id']);
        }
        return $this->json(['data' => $this->entityManager->getRepository(Notification::class)->markMultipleAsRead($notification_ids, $this->user->getId())]);
      } 
    }
}
