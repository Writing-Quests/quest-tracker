<?php

namespace App\State;

use App\Entity\User;
use App\Entity\Connection;
use App\State\NotLoggedInRepresentation;
use ApiPlatform\State\ProviderInterface;
use ApiPlatform\Metadata\Operation;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProviderInterface<User|NotLoggedInRepresentation|null>
 */
final class UserMeProvider implements ProviderInterface {
    public function __construct(
        private Security $security,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): User|NotLoggedInRepresentation|null
    {
        $user = $this->security->getUser();
        if($user) {
            return $this
                ->entityManager
                ->getRepository(User::class)
                ->find($user->getId());
              
        } else {
            return new NotLoggedInRepresentation();
        }
    }
}
