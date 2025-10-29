<?php

namespace App\Controller;

use App\Entity\LoginToken;
use App\Entity\User;

use App\Service\NotificationService;

use Doctrine\ORM\EntityManagerInterface;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use DateTimeImmutable;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[AsController]
class LoginTokenController extends AbstractController
{
  public function __construct(
    private EntityManagerInterface $entityManager,
    private TokenStorageInterface $token_storage,
    private NotificationService $notify
  ) {}

  public function __invoke(Request $request): JsonResponse
  {
    $resp = (object)[];
    $email = $request->getPayload()->get('email');
    $type = $request->getPayload()->get('type');
    if ($type == 'verify-email') {
      $field = 'unverified_email';
    } else {
      $field = 'email';
    }
    $user = $this->entityManager->getRepository(User::class)->findOneBy([$field => $email]);
    if (!$user) {
      $resp->created = false;
      $resp->message = "Email address not valid.";
    } else {
      $token = (new LoginToken)
        ->setType($type)
        ->setUser($user)
        ->setPayload($email);
      $this->entityManager->persist($token);
      $this->entityManager->flush();
      $resp->created = true;
    }
    return $this->json($resp);
  }
}
