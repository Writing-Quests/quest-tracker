<?php

namespace App\Controller;

use Exception;

use App\Entity\User;
use App\Entity\Connection;
use App\Entity\LoginToken;
use App\Service\MailerService;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use DateTimeImmutable;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\Entity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserController extends AbstractController
{
  public $entityManager;
  public $mailer;
  private $token_storage;

  public function __construct(EntityManagerInterface $entityManager,MailerInterface $mailer,TokenStorageInterface $token_storage)
  {
    $this->entityManager = $entityManager;
    $this->mailer = $mailer;
    $this->token_storage = $token_storage;
  }
  #[Route('/api/user/$create/', name: 'register_user', methods: ['POST'])]
  public function create_user (Request $request, UserPasswordHasherInterface $passwordHasher, ValidatorInterface $validator): JsonResponse
  {
      $resp = [
        'errors' => []
      ];
      $POST = $request->getPayload();
      $email = $POST->get('email');
      $username = $POST->get('username');
      $find_username = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
      if ($find_username) {
        $username_available = false;
        array_push($resp['errors'],['id'=>'usernameTaken', 'text'=>'Username is already in use.']);
      } else {
        $username_available = true;
      }
      $find_email = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
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
          $expiresAt = new \DateTimeImmutable('now +24 hours');
          $verifyEmailToken = new LoginToken();
          ($verifyEmailToken)
            ->setUser($newUser)
            ->setSecret($token)
            ->setCreatedAt($createdAt)
            ->setExpiresAt($expiresAt)
            ->setType('verify-email')
            ->setPayload($email);
          // TODO: Have this autodetect or grab from consts
          $verifyEmailURL = 'http://questy.writingquests.org/verify?e='.$email.'&t='.$token;
          $resp['url'] = $verifyEmailURL;
          $violations = $validator->validate($newUser);
          if (0 !== count($violations)) {
            throw new Exception($violations);
          }
          $this->entityManager->persist($verifyEmailToken);
          $this->entityManager->persist($newUser);
          $this->entityManager->flush();
          $created = true;
          $newUserMsg = (new MailerService)->sendEmailVerification($newUser, $email, $verifyEmailURL, $expiresAt, true);
          $this->mailer->send($newUserMsg);
          $resp['sentVerificationEmail'] = true;
        } catch (\Exception $err) {
          array_push($resp['errors'],['id'=> 'phpError', 'text'=>$err->getMessage()]);
        }
      } else {
        $created = false; 
      }
      $resp['created'] = $created;
      return $this->json($resp);
  }

  #[Route('/api/password/$reset/', name: 'request_reset', methods: ['POST'])]
  public function requestReset (Request $request, ): JsonResponse 
  {
    try {
      $resp = [
        'errors'=>[],
        'emailSent'=>false // it's false until it succeeds
      ];
      $POST = $request->getPayload();
      $email = $POST->get('email');
      $user = $this->entityManager->getRepository(User::class)->findOneBy(['email'=>$email]);
      if (!$user) {
        array_push($resp['errors'],['id'=>'notFound', 'text'=>'Email address not found.']);
      } else if ($user->getEmailVerifiedAt() == null) {
        array_push($resp['errors'],['id'=>'notFound', 'text'=>'Email address not verified.']);
      } else {
        // email address is valid and has been verified
        $tokenRepository = $this->entityManager->getRepository(LoginToken::class);
        $pending_reset = $tokenRepository->findOneBy(['payload'=>$email, 'type'=>'reset-password']);
        $current_datetime = new \DateTimeImmutable();
        if ($pending_reset) { // there is a current 'reset-password' token -- delete it so we don't have multiples hanging out
          $this->entityManager->remove($pending_reset);
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
        // TODO: Have this autodetect or grab from consts
        $resetURL = 'http://questy.writingquests.org/resetform?e='.$email.'&t='.$token;
        $this->entityManager->persist($resetPasswordToken);
        $resetPasswordMsg = (new MailerService)->createPasswordReset($user, $email, $resetURL);
        $this->mailer->send($resetPasswordMsg);
        $resp['emailSent'] = true;
      }
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'emailFailed', 'text'=>'An error occurred while sending this email. Please try again.']);
      array_push($resp['errors'],['id'=>'phpErr', 'text'=>$err->getMessage()]);
    } finally {
      $this->entityManager->flush();
      return $this->json($resp);
    }
  }

  #[Route('api/password/$submit', name: 'finish_reset', methods: ['POST'])]
  public function finishReset (Request $request,  UserPasswordHasherInterface $passwordHasher): JsonResponse
  {
    $resp = [
      'errors' => []
    ];
    try {
      $POST = $request->getPayload();
      $email = $POST->get('email');
      $username = $POST->get('username');
      $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
      $tokenEntry = $this->entityManager->getRepository(LoginToken::class)->findOneBy(['payload'=>$email, 'type'=>'reset-password']);
      $hashedPassword = $passwordHasher->hashPassword(
        $user,
        $POST->get('password')
      );
      ($user)
        ->setPassword($hashedPassword)
        ->setEditedAt(new \DateTimeImmutable());
      $this->entityManager->remove($tokenEntry);
      $this->entityManager->flush();
      $passwordChanged = true;
      $confirmMsg = (new MailerService)->notificationPasswordChange($email);
      $this->mailer->send($confirmMsg);
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
      $passwordChanged = false;
    }
    $resp['passwordChanged'] = $passwordChanged;
    return $this->json($resp);
  }

  #[Route('api/profile/$edit', name: 'edit_profile', methods: ['POST'])]
  public function updateUserProfile(Request $request,  UserPasswordHasherInterface $passwordHasher): JsonResponse
  {
    try{
      $resp = ['errors'=>[]];
      $POST = $request->getPayload()->all();
      $user = $this->entityManager->getRepository(User::class)->findOneBy(['username'=>$POST['username']]);
      $user->setEditedAt(new DateTimeImmutable());
      foreach ($POST as $key=>$value) {
        switch ($key) {
          case 'description':
            $user->setDescription($value);
          break;

          case 'link':
            $user->setLink($value);
          break;

          case 'public':
            $user->setPublic($value);
          break;

          case 'emailChange':
            $email = $POST['unverified_email'];
            $emailInUse = $this->entityManager->getRepository(User::class)->findOneBy(['email'=>$email]);
            if (!$emailInUse) {
              $oldEmail = $POST['email'];
              $user->setUnverifiedEmail($email);
              $token = bin2hex(random_bytes(32));
              $verifyEmailToken = new LoginToken();
              $expiresAt = new \DateTimeImmutable('now +24 hours');
              ($verifyEmailToken)
                ->setUser($user)
                ->setSecret($token)
                ->setCreatedAt(new \DateTimeImmutable())
                ->setExpiresAt($expiresAt)
                ->setType('verify-email')
                ->setPayload($email);
              // TODO: Have this auto-detect or grab from consts
              $verifyEmailURL = 'http://questy.writingquests.org/verify?e='.$email.'&t='.$token;
              $this->entityManager->persist($verifyEmailToken);
              $newVerificationMsg = (new MailerService)->changedEmailVerification($POST['username'], $email, $oldEmail, $verifyEmailURL, $expiresAt);
              $this->mailer->send($newVerificationMsg);
            } else {
              $resp['revertEmail'] = $user->getUnverifiedEmail();
              throw new \Exception('Email address not changed; ' . $email . ' already in use.');
            }
          break;

          case 'passwordChange':
            $newPasswordHash = $passwordHasher->hashPassword(
              $user,
              $POST['password']
            );
            $user->setPassword($newPasswordHash);
            $resp['sendLogout'] = true;
          break;
        }
        $this->entityManager->persist($user);
      }
      $this->entityManager->flush();
      $resp['updated'] = true;
    } catch (\Exception $err) {
      $resp['updated'] = false;
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    }
    return $this->json($resp);
  }

  #[Route('/api/user/$resend', name: 'resend_verification', methods: ['POST'])]
  public function resendVerification (Request $request, ): JsonResponse {
    $resp = ['errors'=>[]];
    $verifyEmailURL = null;
    try {
      $verifiedEmail = $request->getPayload()->get('email');
      $unverifiedEmail = $request->getPayload()->get('unverified_email');
      $username = $request->getPayload()->get('username');
      $resp['userInfo'] = ['vEmail'=>$verifiedEmail, 'uEmail'=>$unverifiedEmail, 'username'=>$username];
      $tokenEntry = $this->entityManager->getRepository(LoginToken::class)->findOneBy(['payload' => $unverifiedEmail, 'type' => 'verify-email']);
      $currentTime = new \DateTimeImmutable();
      $user = $this->entityManager->getRepository(User::class)->findOneBy(['username'=>$username]);
      $resp['time'] = $currentTime;
      if (!$tokenEntry) { // there is no existing verification token; create a new one
        $resp['tokenStatus'] = 'null';
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('now +24 hours');
        $tokenEntry = new LoginToken;
        ($tokenEntry)
          ->setUser($user)
          ->setSecret($token)
          ->setCreatedAt($currentTime)
          ->setExpiresAt($expiresAt)
          ->setType('verify-email')
          ->setPayload($unverifiedEmail);
          $this->entityManager->persist($tokenEntry);
          $this->entityManager->flush();
       } else if ($currentTime > $tokenEntry->getExpiresAt()) { // a token exists but is expired; create a new one on existing row
        $resp['tokenStatus'] = 'expired';
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('now +24 hours');
        ($tokenEntry)
          ->setUser($user)
          ->setSecret($token)
          ->setCreatedAt($currentTime)
          ->setExpiresAt($expiresAt)
          ->setType('verify-email')
          ->setPayload($unverifiedEmail);
          $this->entityManager->persist($tokenEntry);
          $this->entityManager->flush();
       } else {
        $resp['tokenStatus'] = 'exists';
        $token = $tokenEntry->getSecret();
        $expiresAt = $tokenEntry->getExpiresAt();
      }
      // TODO: Have this autodetect or grab from consts
      $verifyEmailURL = 'http://questy.writingquests.org/verify?e='.$unverifiedEmail.'&t='.$token;
      if ($verifiedEmail != $unverifiedEmail) {
        $resp['newEmail'] = true;
        $verificationMsg = (new MailerService)->changedEmailVerification($user, $unverifiedEmail, $verifiedEmail, $verifyEmailURL, $expiresAt);
      } else {
        $resp['newEmail'] = false;
        $verificationMsg = (new MailerService)->sendEmailVerification($user, $unverifiedEmail, $verifyEmailURL, $expiresAt);
      }
      if ($verificationMsg) {
        $this->mailer->send($verificationMsg);
        $resp['sent'] = true;
      } else {
        $resp['sent'] = false;
        $resp['maybeEmail'] = $verificationMsg;
      }
    } catch (\Exception $err) {
      $resp['sent'] = false;
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    } finally {
      return $this->json($resp);
    }
  }

  #[Route('api/user/$revert', name: 'revert_email', methods: ['POST'])]
  public function revertVerifiedEmail(Request $request, ): JsonResponse
  {
    // TODO: maybe: email user when their email is reverted to the old verified address?
    try{
      $resp = ['errors'=>[]];
      $POST = $request->getPayload()->all();
      $user = $this->entityManager->getRepository(User::class)->findOneBy(['username'=>$POST['username']]);
      $pendingToken = $this->entityManager->getRepository(LoginToken::class)->findOneBy(['payload'=>$POST['unverified_email'], 'type'=>'verify-email']);
      $resp['token'] = $pendingToken->getSecret();
      if ($pendingToken) {
        $this->entityManager->remove($pendingToken);
      }
      $user->setUnverifiedEmail(null);
      $this->entityManager->persist($user);
      $this->entityManager->flush();
      $resp['changed'] = true;
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'phpErr', 'text'=>$err->getMessage()]);
    } finally {
      return $this->json($resp);
    }
  }

  # TODO: 2025-04-08 - this should REALLY be via APIPlatform filters, but went this route for now for ease of getting it out the door because I was stumped
  # TODO: this could be a problem if we blow up as it has no pagination to it. Again, should be APIPlatform'd
  #[Route('api/user/$public', name: 'all_public_users', methods: ['GET'])]
  public function getPublicUsers(Request $request): JsonResponse {
    try {
      $resp = ['errors'=>[], 'users'=>[]];
      if ($this->token_storage->getToken()) {
        $user = $this->token_storage->getToken()->getUser();
        $user_id = $user->getId();
        $all_public_users = $this->entityManager->getRepository(User::class)->getAllPublicUsersAndConnections($user_id);
      } else {
        $all_public_users = $this->entityManager->getRepository(User::class)->getAllPublicUsers();
      }
      $updated_users = [];
      foreach ($all_public_users as $u) {
        $user = $u;
        $url = 'https://www.gravatar.com/avatar/' . hash( 'sha256', strtolower( trim( $user['email']))) . '?d=404&s=100&r=pg';
        $headers = @get_headers($url);
        if(!$headers || $headers[0] == 'HTTP/1.1 404 Not Found') {
          $user['gravatar'] = null;
        } else {
          $user['gravatar'] = $url;
        }
        unset($user['email']);
        array_push($updated_users,$user);
      }
      $resp['users'] = $updated_users;
    } catch (\Exception $err) {
      array_push($resp['errors'],$err->getMessage());
    } finally {
      return $this->json($resp);
    }
  }
}
