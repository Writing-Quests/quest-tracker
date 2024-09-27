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
      $type = $params->get('type');
      $tokenEntry = $entityManager->getRepository(LoginToken::class)->findOneBy(['payload' => $email, 'type' => $type]);
      $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
      switch ($type) {
        case 'verify-email':
          $resp = $this->finish_email_verify($entityManager,$tokenEntry,$user,$email,$token);
        break;

        case 'reset-password':
          $resp = $this->check_password_reset($entityManager,$tokenEntry,$user,$email,$token);
        break;

        default:
          $resp = [
            'errors'=>[['id'=>'invalid','text'=>'This token URL is not valid.']],
            'verified'=>false
          ];
        break;
      }
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    }
    $entityManager->flush();
    return $this->json($resp);
  }
  
  private function finish_email_verify ($entityManager,$tokenEntry,$user,$email,$token) {
    // TODO: make sure this still works after modifications
    $this_resp = [
      'errors'=>[]
    ];
    if (!$tokenEntry) {
      $this_resp['verified'] = false;
      if ($user->getEmailVerifiedAt() != null) {
        $err_text = "The address $email is already verified.";
      } else {
        $err_text = "The verification link for $email is no longer valid. Sign in to your account to request a new verification link.";
      }
      array_push($this_resp['errors'],['id'=>'notFound', 'text'=>$err_text]);
    } else {
      $verifyTime = new \DateTimeImmutable();
      $isExpired = $verifyTime > $tokenEntry->getExpiresAt();
      $user = $tokenEntry->getUser();
      $tokenMatches = $tokenEntry->verifySecret($token);
      if ($tokenMatches && !$isExpired) { 
        $this_resp['verified'] = true;
        $user->setEmailVerifiedAt($verifyTime);
        $user->setUnverifiedEmail(null);
        // TODO: ask group: do we consider a verified email an "edited at"? or is that just for user edits?
        $entityManager->persist($user);
        $entityManager->remove($tokenEntry);
      } else {
        $this_resp['verified'] = false;
        $err_text = "The verification link used is malformed/otherwise invalid. Try copy and pasting the link directly from your email to try again";
        if ($isExpired) {
          $entityManager->remove($tokenEntry);
          $err_text = "The verification link for $email is no longer valid. Sign in to your account to request a new verification link.";
        }
        array_push($this_resp['errors'],['id'=>'notFound', 'text'=>$err_text]);
      }
      $this_resp['isExpired'] = $isExpired;
      $this_resp['tokenMatches'] = $tokenMatches;
      return $this_resp;
    }
  }

  private function check_password_reset ($entityManager,$tokenEntry,$user,$email,$token) {
    $this_resp = [
      'errors'=>[]
    ];
    if (!$tokenEntry) {
      $this_resp['verified'] = false;
      array_push($this_resp['errors'],['id'=>'notFound', 'text'=>'This password reset URL is not valid']);
    } else {
      $verifyTime = new \DateTimeImmutable();
      $isExpired = $verifyTime > $tokenEntry->getExpiresAt();
      $tokenMatches = $tokenEntry->verifySecret($token);
      if ($tokenMatches && !$isExpired) { 
        $this_resp['verified'] = true;
        $this_resp['username'] = $user->getUsername();
      } else {
        $this_resp['verified'] = false;
        $err_text = "The password reset link used is malformed/otherwise invalid. Try copy and pasting the link directly from your email to try again";
        if ($isExpired) {
          $err_text = "This password reset link for $email is no longer valid. Please request a new password reset link.";
        }
        array_push($this_resp['errors'],['id'=>'notFound', 'text'=>$err_text]);
      }
      $this_resp['isExpired'] = $isExpired;
      $this_resp['tokenMatches'] = $tokenMatches;
    }
    return $this_resp;
  }
}