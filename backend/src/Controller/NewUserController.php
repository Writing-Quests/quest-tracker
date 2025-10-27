<?php

namespace App\Controller;

use Exception;
use DateTimeImmutable;

use App\Entity\User;
use App\Entity\LoginToken;
use App\Service\MailerService;
use App\Service\NotificationService;

use Doctrine\ORM\EntityManagerInterface;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsController]
class NewUserController extends AbstractController
{
  public function __construct(
    private EntityManagerInterface $entityManager,
    private TokenStorageInterface $token_storage,
    private UserPasswordHasherInterface $passwordHasher,
    private NotificationService $notify,
    private MailerService $sendEmail
  ) {}

  public function __invoke(Request $request, ValidatorInterface $validator): JsonResponse
  {
    $resp = (object)[
      'errors' => []
    ];
    $POST = $request->getPayload();
    $email = $POST->get('email');
    $username = $POST->get('username');
    $usernameAvailable = is_null($this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]));
    $emailAvailable = is_null($this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]));
    if ($emailAvailable && $usernameAvailable) {
      try {
        // everything is good, let's create the user
        $created = false;
        $createdAt = new \DateTimeImmutable();
        $userTimezone = new \DateTimeImmutable('', new \DateTimeZone($POST->get('timezone')));
        $newUser = new User();
        ($newUser)
          ->setUsername($username)
          ->setEmail($email)
          ->setUnverifiedEmail($email)
          ->setCreatedAt($createdAt)
          ->setTimezone($userTimezone)
          ->setSpecificUserRole('ROLE_USER',true);
            // doing violations before creating verification token
        $hashedPassword = $this->passwordHasher->hashPassword(
          $newUser,
          $POST->get('password')
        );
        ($newUser)->setPassword($hashedPassword);
        $violations = $validator->validate($newUser);
        if (0 !== count($violations)) {
          throw new Exception($violations);
        }
        // made it past verification, send verification email token
        $this->entityManager->persist($newUser);
        $verifyEmailToken = (new LoginToken())
          ->setUser($newUser)
          ->setPayload($newUser->getUnverifiedEmail())
          ->setType('verify-email');
        $this->entityManager->persist($verifyEmailToken);
        $this->entityManager->flush();
        // we made it, we're done!
        $created = true;
      } catch (\Exception $err) {
        array_push($resp->errors, $err->getMessage());
      }
    } else {
      $created = false;
    }
    $resp->created = $created;
    $resp->emailAvailable = $emailAvailable;
    $resp->usernameAvailable = $usernameAvailable;
    return $this->json($resp);
  }
}
