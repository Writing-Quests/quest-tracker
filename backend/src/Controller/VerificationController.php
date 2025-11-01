<?php
namespace App\Controller;

use App\Entity\LoginToken;

use App\Service\NotificationService;

use Doctrine\ORM\EntityManagerInterface;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use DateTimeImmutable;

#[AsController]
class VerificationController extends AbstractController
{
  public function __construct(
    private EntityManagerInterface $entityManager,
    private TokenStorageInterface $token_storage,
    private NotificationService $notify)
  {}

  public function __invoke (Request $request, string $secret): JsonResponse {
    $resp = (object)[];
    $email = $request->query->get('email');
    $type = $request->query->get('type');
    $token = $this->entityManager->getRepository(LoginToken::class)->verifyTokenInformation($email, $secret, $type);
    if (!$token) { // returned a null result
      $resp->verified = false;
      $resp->message = "This link is malformed or invalid.";
    } else {
      $resp->verified = false;
      $resp->expired = $token->isTokenExpired();
      $type = $token->getType();
      if ($token->isTokenExpired()) {
        $resp->message = "This link has expired.";
      } else { // The token is good to go!
        $resp->verified = true;
        $user = $token->getUser();
        switch ($type) {
          case 'verify-email':
            $user->setEmail($email);
            $user->setUnverifiedEmail(null);
            $user->setEmailVerifiedAt(new DateTimeImmutable());
            // Once the email is set verified, we don't need this token anymore.
            $this->entityManager->remove($token);
            $this->entityManager->flush();
          break;
        }
      }
    }
    $resp->user = $user;
    return $this->json($resp);
  }
}
