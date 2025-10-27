<?php

namespace App\State;

use App\Entity\User;
use App\Entity\LoginToken;
use App\Service\NotificationService;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserProfileProcessor implements ProcessorInterface
{
  public function __construct(
    #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
    private ProcessorInterface $persistProcessor,
    #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
    private ProcessorInterface $removeProcessor,
    private TokenStorageInterface $token_storage,
    private EntityManagerInterface $entityManager,
    private UserPasswordHasherInterface $passwordHasher,
    private RequestStack $requestStack,
    private NotificationService $notify,
    private ValidatorInterface $validator
  ) {}
  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
  {
    /* right now this processor isn't used to delete a user, but I'm holding it here for when eventually it surely could be a self-service action
        if ($operation instanceof DeleteOperationInterface) {
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }
    */
        /*
        $POST = $request->getPayload();
          $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
          $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $POST->get('plainPassword')
          );
          ($user)
            
        */
    $createVerificationToken = false;
    $sendPasswordChange = false;
    $resetToken = $this->requestStack->getCurrentRequest()->getPayload()->get('resetToken');
    $userChangedEmail = $this->requestStack->getCurrentRequest()->getPayload()->get('userChangedEmail');
    if ($data->getPlainPassword()) {
      $hashedPassword = $this->passwordHasher->hashPassword($data,$data->getPlainPassword());
      $data->setPassword($hashedPassword);
      $data->eraseCredentials();
      $sendPasswordChange = true;
    }
    if ($userChangedEmail) {
      // check if the email address requested by the user is already in use in either a verified or unverified email field for any other user
      $find_email = $this->entityManager->getRepository(User::class)->checkIfEmailAvailable($data->getUnverifiedEmail(),$data->getId());
      if ($find_email) { 
        $data->setUnverifiedEmail($data->getEmail());
      } else {
        $createVerificationToken = true;
      }
    }
    
    $data->setEditedAt(new \DateTimeImmutable());
    $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    if ($createVerificationToken) { // i could do this above, but I don't want to send the email before saving the data, in case there's an error.
      $this->createVerificationToken($result);
    }
    if ($resetToken) { // the user changed their password via Reset Password + Valid Link; delete the existing token and sent the password change email.
      $sendPasswordChange = true;
      $tokenEntry = $this->entityManager->getRepository(LoginToken::class)->findOneBy(['secret' => $resetToken]);
      if ($tokenEntry) {
        $this->entityManager->remove($tokenEntry);
      }
    }
    if ($sendPasswordChange) {
      $changeTime = (new \DateTimeImmutable())->format('F jS, Y \a\t g:i a \(e\)');
      $this->notify->sendSystemNotification("Your Questy password was changed on $changeTime.",[
        'user' => $result,
        'changedAt' => $changeTime
      ]);
    }
    return $result;
  }

  private function createVerificationToken($user)
  {
    $verifyEmailToken = new LoginToken();
    ($verifyEmailToken)
      ->setUser($user)
      ->setPayload($user->getUnverifiedEmail())
      ->setType('verify-email');
    $this->entityManager->persist($verifyEmailToken);
    $this->entityManager->flush();
    /*
    $violations = $this->validator->validate($user);
    if (0 !== count($violations)) {
      throw new \Exception($violations);
    }
    */
  }
}
