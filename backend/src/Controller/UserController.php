<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\LoginToken;
use App\State\MailManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;

class UserController extends AbstractController
{
  #[Route('/api/user/$create/', name: 'register_user', methods: ['POST'])]
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
          $entityManager->persist($verifyEmailToken);
          $entityManager->persist($newUser);
          $entityManager->flush();
          $created = true;
          // TODO: set up the SMTP stuff for novelquests
          $newUserMsg = (new MailManager)->sendEmailVerification($username, $email, $verifyEmailURL, $expiresAt, true);
          $mailer->send($newUserMsg);
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

  #[Route('/api/password/$request/', name: 'request_reset', methods: ['POST'])]
  public function requestReset (Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): JsonResponse 
  {
    try {
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
        // TODO: Have this autodetect or grab from consts
        $resetURL = 'http://questy.writingquests.org/resetform?e='.$email.'&t='.$token;
        $entityManager->persist($resetPasswordToken);
        $resetPasswordMsg = (new MailManager)->createPasswordReset($email, $resetURL);
        $mailer->send($resetPasswordMsg);
        $resp['emailSent'] = true;
      }
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'emailFailed', 'text'=>'An error occurred while sending this email. Please try again.']);
      array_push($resp['errors'],['id'=>'phpErr', 'text'=>$err->getMessage()]);
    } finally {
      $entityManager->flush();
      return $this->json($resp);
    }
  }

  #[Route('api/password/$submit', name: 'finish_reset', methods: ['POST'])]
  public function finishReset (Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer): JsonResponse
  {
    $resp = [
      'errors' => []
    ];
    try {
      $POST = $request->getPayload();
      $email = $POST->get('email');
      $username = $POST->get('username');
      $user = $entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
      $tokenEntry = $entityManager->getRepository(LoginToken::class)->findOneBy(['payload'=>$email, 'type'=>'reset-password']);
      $hashedPassword = $passwordHasher->hashPassword(
        $user,
        $POST->get('password')
      );
      ($user)
        ->setPassword($hashedPassword)
        ->setEditedAt(new \DateTimeImmutable());
      $entityManager->remove($tokenEntry);
      $entityManager->flush();
      $passwordChanged = true;
      $confirmMsg = (new MailManager)->notificationPasswordChange($email);
      $mailer->send($confirmMsg);
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
      $passwordChanged = false;
    }
    $resp['passwordChanged'] = $passwordChanged;
    return $this->json($resp);
  }

  #[Route('api/profile/$get', name: 'view_profile', methods: ['GET'])]
  public function getUserProfile (#[CurrentUser] ?User $user, Request $request, EntityManagerInterface $entityManager): JsonResponse 
  {
    try {
      // https://docs.gravatar.com/api/avatars/images/
      $requestedUsername = $request->query->get('username');
      $requestedUser = $entityManager->getRepository(User::class)->findOneBy(['username'=>$requestedUsername]);
      if (!$requestedUser) { // no user found by that username
        throw $this->createNotFoundException('User not found');
      }
      $resp = (new UserProfile())->getProfileInfo($requestedUser,$user);
      if (!$resp) { // we return null if it's a private profile and it's not your private profile; buddies later
        throw $this->createNotFoundException('User not found');
      }
      $status = 200;
    } catch (\Exception $err) {
      $resp = [
        'errors'=>[['id'=>'phpError','text'=>$err->getMessage()]]
      ];
      $status = 404;
    } finally {
      return $this->json($resp,$status);
    }
  }

  #[Route('api/profile/$edit', name: 'edit_profile', methods: ['POST'])]
  public function updateUserProfile(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer): JsonResponse
  {
    try{
      $resp = ['errors'=>[]];
      $POST = $request->getPayload()->all();
      $user = $entityManager->getRepository(User::class)->findOneBy(['username'=>$POST['username']]);
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
            $email = $POST['unverifiedEmail'];
            $emailInUse = $entityManager->getRepository(User::class)->findOneBy(['email'=>$email]);
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
              $entityManager->persist($verifyEmailToken);
              $newVerificationMsg = (new MailManager)->changedEmailVerification($POST['username'], $email, $oldEmail, $verifyEmailURL, $expiresAt);
              $mailer->send($newVerificationMsg);
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
        $entityManager->persist($user);
      }
      $entityManager->flush();
      $resp['updated'] = true;
    } catch (\Exception $err) {
      $resp['updated'] = false;
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    }
    return $this->json($resp);
  }

  #[Route('api/profile/$public', name: 'all_public_profiles', methods: ['GET'])]
  public function showAllPublicProfiles(#[CurrentUser] ?User $user, Request $request, EntityManagerInterface $entityManager): JsonResponse
  {
    $publicUsers = $entityManager->getRepository(User::class)->findBy(['public'=>1]);
    $profiles = [];
    foreach ($publicUsers as $user) {
      array_push($profiles, (new UserProfile)->publicCard($user));
    }
    return $this->json($profiles);
  }

  #[Route('/api/user/$resend', name: 'resend_verification', methods: ['POST'])]
  public function resendVerification (Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): JsonResponse {
    $resp = ['errors'=>[]];
    $verifyEmailURL = null;
    try {
      $verifiedEmail = $request->getPayload()->get('email');
      $unverifiedEmail = $request->getPayload()->get('unverifiedEmail');
      $username = $request->getPayload()->get('username');
      $resp['userInfo'] = ['vEmail'=>$verifiedEmail, 'uEmail'=>$unverifiedEmail, 'username'=>$username];
      $tokenEntry = $entityManager->getRepository(LoginToken::class)->findOneBy(['payload' => $unverifiedEmail, 'type' => 'verify-email']);
      $currentTime = new \DateTimeImmutable();
      $resp['time'] = $currentTime;
      if (!$tokenEntry) { // there is no existing verification token; create a new one
        $resp['tokenStatus'] = 'null';
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('now +24 hours');
        $tokenEntry = new LoginToken;
        ($tokenEntry)
          ->setUser($entityManager->getRepository(User::class)->findOneBy(['username'=>$username]))
          ->setSecret($token)
          ->setCreatedAt($currentTime)
          ->setExpiresAt($expiresAt)
          ->setType('verify-email')
          ->setPayload($unverifiedEmail);
          $entityManager->persist($tokenEntry);
          $entityManager->flush();
       } else if ($currentTime > $tokenEntry->getExpiresAt()) { // a token exists but is expired; create a new one on existing row
        $resp['tokenStatus'] = 'expired';
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('now +24 hours');
        ($tokenEntry)
          ->setUser($entityManager->getRepository(User::class)->findOneBy(['username'=>$username]))
          ->setSecret($token)
          ->setCreatedAt($currentTime)
          ->setExpiresAt($expiresAt)
          ->setType('verify-email')
          ->setPayload($unverifiedEmail);
          $entityManager->persist($tokenEntry);
          $entityManager->flush();
       } else {
        $resp['tokenStatus'] = 'exists';
        $token = $tokenEntry->getSecret();
        $expiresAt = $tokenEntry->getExpiresAt();
      }
      // TODO: Have this autodetect or grab from consts
      $verifyEmailURL = 'http://questy.writingquests.org/verify?e='.$unverifiedEmail.'&t='.$token;
      if ($verifiedEmail != $unverifiedEmail) {
        $resp['newEmail'] = true;
        $verificationMsg = (new MailManager)->changedEmailVerification($username, $unverifiedEmail, $verifiedEmail, $verifyEmailURL, $expiresAt);
      } else {
        $resp['newEmail'] = false;
        $verificationMsg = (new MailManager)->sendEmailVerification($username, $unverifiedEmail, $verifyEmailURL, $expiresAt);
      }
      $mailer->send($verificationMsg);
      $resp['sent'] = true;
    } catch (\Exception $err) {
      $resp['sent'] = false;
      array_push($resp['errors'],['id'=>'phpError','text'=>$err->getMessage()]);
    } finally {
      return $this->json($resp);
    }
  }

  #[Route('api/user/$revert', name: 'revert_email', methods: ['POST'])]
  public function revertVerifiedEmail(Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): JsonResponse
  {
    // TODO: maybe: email user when their email is reverted to the old verified address?
    try{
      $resp = ['errors'=>[]];
      $POST = $request->getPayload()->all();
      $user = $entityManager->getRepository(User::class)->findOneBy(['username'=>$POST['username']]);
      $pendingToken = $entityManager->getRepository(LoginToken::class)->findOneBy(['payload'=>$POST['unverifiedEmail'], 'type'=>'verify-email']);
      $resp['token'] = $pendingToken->getSecret();
      if ($pendingToken) {
        $entityManager->remove($pendingToken);
      }
      $user->setUnverifiedEmail(null);
      $entityManager->persist($user);
      $entityManager->flush();
      $resp['changed'] = true;
      $resp['profile'] = (new UserProfile)->getOwnProfile($user);
    } catch (\Exception $err) {
      array_push($resp['errors'],['id'=>'phpErr', 'text'=>$err->getMessage()]);
    } finally {
      return $this->json($resp);
    }
  }
}

// TODO: This is duplicating logic from the Users ApiResource
class UserProfile {
  public function publicCard($requestedUser) {
    $profile = [];
    $gravatar_url = 'https://www.gravatar.com/avatar/' . hash( 'sha256', strtolower( trim( $requestedUser->getEmail() ) ) ) . '?d=404&s=75&r=pg';
    $profile = [
      'username'=>$requestedUser->getUsername(),
      'description'=>$requestedUser->getDescription(),
      'gravatar'=>$this->checkGravarExists($gravatar_url),
      'memberSince'=>$requestedUser->getCreatedAt()
    ];
    return $profile;
  }

  public function getProfileInfo($requestedUser,$loggedInUser) {
    $profile = [];
    $profilePublic = $requestedUser->isPublic();
    if ($loggedInUser != null) {
      $profileOwner = ($loggedInUser->getUserIdentifier() == $requestedUser->getUserIdentifier());
    } else {
      $profileOwner = false;
    }
    $profilePublic = $requestedUser->isPublic();
    if ((!$profileOwner || $loggedInUser == null) && !$profilePublic) { 
      // two conditionals; 
      //  if you're not the profile owner and the profile is not public
      //  if you're not logged in and the profile is not public
      return null;
    }
    // TODO: this will need to return project data as well in the future
    $gravatar_url = 'https://www.gravatar.com/avatar/' . hash( 'sha256', strtolower( trim( $requestedUser->getEmail() ) ) ) . '?d=404&s=100&r=pg';
    $profile = [
      'username'=>$requestedUser->getUsername(),
      'link'=>$requestedUser->getLink(),
      'description'=>$requestedUser->getDescription(),
      'gravatar'=>$this->checkGravarExists($gravatar_url),
      'profileOwner'=>$profileOwner,
      'public'=>$profilePublic,
      'memberSince'=>$requestedUser->getCreatedAt()
    ];
    if ($profileOwner) {
      $profile['email'] = $requestedUser->getEmail();
      $profile['unverifiedEmail'] = $requestedUser->getUnverifiedEmail();
      $profile['emailVerified'] = ($requestedUser->getUnverifiedEmail() == null); // unverifiedmail is set to null when email is verified
      $profile['unverifiedAccount'] = ($requestedUser->getEmailVerifiedAt() == null); // even if the account currently has an unverified email, this wouldn't be null if they have verified an initial email address
    }
    $profile['status'] = 200;
    return $profile;
  }

  public function getOwnProfile($loggedInUser) {
    $profile = [];
    $profilePublic = $loggedInUser->isPublic();
    $profileOwner = true;
    $profile = [
      'username'=>$loggedInUser->getUsername(),
      'link'=>$loggedInUser->getLink(),
      'description'=>$loggedInUser->getDescription(),
      'profileOwner'=>$profileOwner,
      'public'=>$profilePublic,
      'memberSince'=>$loggedInUser->getCreatedAt(),
      'email'=>$loggedInUser->getEmail(),
      'unverifiedEmail'=>$loggedInUser->getUnverifiedEmail(),
      'emailVerified'=>($loggedInUser->getUnverifiedEmail() == null)
    ];
    $profile['status'] = 200;
    return $profile;
  }

  private function checkGravarExists ($url) {
    $avatar = $url;
    $headers = @get_headers($avatar);
    if(!$headers || $headers[0] == 'HTTP/1.1 404 Not Found') {
      return null;
    }
    else {
      return $url;
    }
  }
}
