<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\LoginToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;

class UserController extends AbstractController
{
  #[Route('/api/user/create/', name: 'register_user', methods: ['POST'])]
  public function create_user (Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer): JsonResponse
  {
      $resp = [
        'errors' => []
      ];
      $POST = $request->getPayload();
      $email = $POST->get('email');
      $username = $POST->get('username');
      $find_username = $entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
      if ($find_username) {
        $username_available = false;
        array_push($resp['errors'],['id'=>'usernameTaken', 'text'=>'Username is already in use.']);
      } else {
        $username_available = true;
      }
      $find_email = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
      if ($find_email) {
        $email_available = false;
        array_push($resp['errors'],['id'=>'emailTaken', 'text'=>'Email address is already in use.']);
      } else {
        $email_available = true;
      }
      if ($email_available && $username_available) {
        try {
          // everything is good, let's create the user
          $created = false;
          $createdAt = new \DateTimeImmutable();
          $userTimezone = new \DateTimeImmutable('', new \DateTimeZone($POST->get('timezone')));
          $newUser = new User();
          $hashedPassword = $passwordHasher->hashPassword(
            $newUser,
            $POST->get('password')
          );
          ($newUser)
            ->setUsername($username)
            ->setEmail($email)
            ->setUnverifiedEmail($email)
            ->setCreatedAt($createdAt)
            ->setTimezone($userTimezone)
            ->setPassword($hashedPassword);
          $token = bin2hex(random_bytes(32));
          $verifyEmailToken = new LoginToken();
          ($verifyEmailToken)
            ->setUser($newUser)
            ->setSecret($token)
            ->setCreatedAt($createdAt)
            ->setExpiresAt(new \DateTimeImmutable('now +24 hours'))
            ->setType('verify-email')
            ->setPayload($email);
          $verifyEmailURL = "http://frontend.quest-tracker.lndo.site/verify?e=$email&t=$token";
          $resp['url'] = $verifyEmailURL;
          $entityManager->persist($verifyEmailToken);
          $entityManager->persist($newUser);
          $entityManager->flush();
          $created = true;
          // TODO: set up the SMTP stuff for novelquests; using one of my mailers for testing right now.
          $resp['sentVerificationEmail'] = (new SendEmails)->sendFirstVerification($mailer, $username, $email, $verifyEmailURL);
        } catch (\Exception $err) {
          array_push($resp['errors'],['id'=> 'phpError', 'text'=>$err->getMessage()]);
        }
      } else {
        $created = false; 
      }
      $resp['created'] = $created;
      return $this->json($resp);
  }

  #[Route('/api/password/request/', name: 'register_user', methods: ['POST'])]
  public function requestReset (Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): JsonResponse {
    $resp = [
      'errors'=>[],
      'emailSent'=>false // it's false until it succeeds
    ];
    $POST = $request->getPayload();
    $email = $POST->get('email');
    $user = $entityManager->getRepository(User::class)->findOneBy(['email'=>$email]);
    if (!$user) {
      array_push($resp['errors'],['id'=>'notFound', 'text'=>'Email address not found.']);
    } else if ($user->getEmailVerifiedAt() == null) {
      array_push($resp['errors'],['id'=>'notFound', 'text'=>'Email address not verified.']);
    } else {
      // email address is valid and has been verified
      $tokenRepository = $entityManager->getRepository(LoginToken::class);
      $pending_reset = $tokenRepository->findOneBy(['payload'=>$email, 'type'=>'reset-password']);
      $current_datetime = new \DateTimeImmutable();
      if ($pending_reset) { // there is a current 'reset-password' token -- delete it so we don't have multiples hanging out
        $entityManager->remove($pending_reset);
      }
      $token = bin2hex(random_bytes(32));
      $resetPasswordToken = new LoginToken();
      ($resetPasswordToken)
        ->setUser($user)
        ->setSecret($token)
        ->setCreatedAt($current_datetime)
        ->setExpiresAt(new \DateTimeImmutable('now +24 hours'))
        ->setType('reset-password')
        ->setPayload($email);
      $resetURL = "http://frontend.quest-tracker.lndo.site/reset?e=$email&t=$token";
      $entityManager->persist($resetPasswordToken);
      $emailSent = (new SendEmails)->sendPasswordResetLink($mailer, $email, $resetURL);
      if (!$emailSent) { // if sending the reset link fails
        array_push($resp['errors'],['id'=>'emailFailed', 'text'=>'An error occurred while sending this email. Please try again.']);
      } else {
        $resp['emailSent'] = $emailSent;
      }
    }
    $entityManager->flush();
    return $this->json($resp);
  }
}


class SendEmails {
  public function sendFirstVerification ($mailer, $username, $email, $verifyEmailURL) {
    // TODO: look up the twig integration for email for formatting
    try {
      $email = (new Email())
        ->from('noreply@novelquest.org')
        ->to($email)
        ->subject('[Novel Quest] Verify Your Email Address')
        ->text('Welcome to the Novel Quests tracker!\n\nPlease verify your email address by clicking the link below, or copy/pasting it into the browser:\n\n' . $verifyEmailURL . '\n\nThis link will expire in 24 hours. Visit the Novel Quests website to request a new verification  link as needed.')
        ->html('<div><p>Welcome to the Novel Quests tracker!</p><p>Your account with the username ' . $username . ' has been created. Please verify your email address by clicking the link below, or copy/pasting it into your browser.<p>' . $verifyEmailURL . '<p>This link will expire in 24 hours.</p></div>'); 
      $mailer->send($email);
      return true;
    } catch (\Exception $err) {
      // TODO: put the error somewhere
      return false;
    }
  }

  // TODO: function: Resent verify email. (Did you not request this email? Note to self: what did I mean about the parathentical???)
  
  // TODO: function: verification on email change.

  public function sendPasswordResetLink ($mailer, $email, $resetPasswordURL) {
    try {
      $email = (new Email())
        ->from('noreply@novelquest.org')
        ->to($email)
        ->subject('[Novel Quest] Reset Your Password')
        ->text('Reset the password for your Novel Quest account by clicking the link below, or copy/pasting it into the browser:\n\n' . $resetPasswordURL . '\n\nThis link will expire in 24 hours. No changes will be able to your password unless you use this link.')
        ->html('<div><p>Reset the password for your Novel Quest account by clicking the link below, or copy/pasting it into the browser:<p>' . $resetPasswordURL . '<p>This link will expire in 24 hours. No changes will be able to your password unless you use this link.</p></div>'); 
      $mailer->send($email);
      return true;
    } catch (\Exception $err) {
      // TODO: put the error somewhere
      return false;
    }
  }
}