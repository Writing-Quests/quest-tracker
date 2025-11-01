<?php

namespace App\State;

use App\Entity\User;
use App\Entity\Connection;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UserProfileProvider implements ProviderInterface
{
  public function __construct(
    private Security $security,
    private EntityManagerInterface $entityManager
  ) {}

  public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
  {
    $lookup_username = $uriVariables['username'] ?? null;
    if ($lookup_username) {
      $profile = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $lookup_username]);
    }
    $user = $this->security->getUser();
    if ($user && ($user->getUsername() != $lookup_username)) { // a user is logged in and this is not your profile
      $connection = $this->entityManager->getRepository(Connection::class)->getUserConnectionStatus($profile->getId(), $user->getId());
      if (!$connection) {
        $profile->setLoggedInUserAllowed($profile->isPublic());
      } else {
        // a connection exists
        switch ($connection->getStatus()) {
          case 'blocked':
            $profile->setLoggedInUserAllowed(false);
            break;

          case 'mutual':
          case 'pending': // in the case where it's pending, going to set for true, tho more logic is needed (if the initator is private but recipient is public)
            $profile->setLoggedInUserAllowed(true);
            break;

          default:
            // following and pending? depends on the profile public status
            $public_profile = $profile->isPublic();
            $profile->setLoggedInUserAllowed($public_profile);
            break;
        }
        $profile->setLoggedInUserConnection($connection);
      }
    }
    return $profile;
  }
}
