<?php

namespace App\Controller;

use App\Entity\LoginToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Validator\Constraints as Assert;

class VerificationController extends AbstractController
{
  #[Route('/api/user/verify/', name: 'verify_email', methods: ['GET'])]
  public function verify (Request $request, EntityManagerInterface $entityManager): JsonResponse {
    try {
      $params = $request->query;
      $email = $params->get('e');
      $token = $params->get('t');
      $tokenRepository = $entityManager->getRepository(LoginToken::class);
      $tokenEntry = $tokenRepository->findOneBy(['payload' => $email, 'type' => 'verify-email']);
      $resp = [
        'errors'=>[]
      ];
      if (!$tokenEntry) {
        $resp['verified'] = false;
        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($user->getEmailVerifiedAt() != null) {
          $err_text = "The address $email is already verified.";
        } else {
          $err_text = "The verification link for $email is no longer valid. Sign in to your account to request a new verification link.";
        }
        array_push($resp['errors'],['id'=>'notFound', 'text'=>$err_text]);
      } else {
        $verifyTime = new \DateTimeImmutable();
        $isExpired = $verifyTime > $tokenEntry->getExpiresAt();
        $user = $tokenEntry->getUser();
        $tokenMatches = $tokenEntry->verifySecret($token);
        if ($tokenMatches && !$isExpired) { 
          $resp['verified'] = true;
          $user->setEmailVerifiedAt($verifyTime);
          $user->setUnverifiedEmail(null);
          // TODO: ask group: do we consider a verified email an "edited at"? or is that just for user edits?
          $entityManager->persist($user);
          $entityManager->remove($tokenEntry);
        } else {
          $resp['verified'] = false;
          $err_text = "The verification link used is malformed/otherwise invalid. Try copy and pasting the link directly from your email to try again";
          if ($isExpired) {
            $entityManager->remove($tokenEntry);
            $err_text = "The verification link for $email is no longer valid. Sign in to your account to request a new verification link.";
          }
          array_push($resp['errors'],['id'=>'notFound', 'text'=>$err_text]);
        }
        $resp['isExpired'] = $isExpired;
        $resp['tokenMatches'] = $tokenMatches;
      }
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    } 
    $entityManager->flush();
    return $this->json($resp);
  }
}