<?php

namespace App\Controller;

use App\Entity\LoginToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;

class VerificationController extends AbstractController
{
  #[Route('/api/user/verify/', name: 'verify_email', methods: ['GET'])]
  public function verify (Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): JsonResponse {
    try {
      $params = $request->query;
      $email = $params->get('e');
      $token = $params->get('t');
      $tokenEntry = $entityManager->getRepository(LoginToken::class)->findOneBy(['payload' => $email, 'type' => 'verify-email']);
      $resp = [
        'errors'=>[]
      ];
      if (!$tokenEntry) {
        $resp['verified'] = false;
        array_push($resp['errors'],['id'=>'notFound', 'text'=>'No verify-email token found for ' . $email]);
      } else {
        // TODO: verify that token sent matches token in database
        // TODO: confirm that token isn't expired; if expired, put a "resend verification email" button
        // TODO: update user object with "verified" timestamp
        // TODO: delete token from database if expired OR if verified successfully
        // TODO: a "request new verification" token flow
        $resp['verified'] = 'maybe';
        $verifyTime = new \DateTimeImmutable();
        $isExpired = $verifyTime > $tokenEntry->getExpiresAt();
        $user = $tokenEntry->getUser();
        $tokenMatches = $passwordHasher->isPasswordValid($user, $token);
        $resp['isExpired'] = $isExpired;
        $resp['tokenMatches'] = $tokenMatches;
        $resp['usingToken'] = $token;
      }
    } catch (\Exception $err) {
      $resp['verified'] = false;
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    } finally {
      return $this->json($resp);
    }
  }
}