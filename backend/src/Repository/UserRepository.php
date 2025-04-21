<?php

namespace App\Repository;
use Exception;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */

class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface,UserLoaderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function loadUserByIdentifier(string $usernameOrEmail): ?User
    {
        $entityManager = $this->getEntityManager();

        return $entityManager->createQuery(
                'SELECT u
                FROM App\Entity\User u
                WHERE u.username = :query
                OR u.email = :query'
            )
            ->setParameter('query', $usernameOrEmail)
            ->getOneOrNullResult();
    }

    public function getAllPublicUsersAndConnections($user_id): array|Exception
    # relative to a signed-in user, finds all public users who are not blocked or blocking the signed in user
    {
      try { 
        $conn = $this->getEntityManager()->getConnection();
        $sql = 'SELECT u.email, u.username, u.description, (SELECT status FROM connection WHERE (initiating_user_id = :user_id OR connected_user_id = :user_id) AND (initiating_user_id = u.id OR connected_user_id = u.id)) AS connection FROM user u WHERE public = 1 AND id != :user_id AND NOT EXISTS (SELECT status FROM connection WHERE (initiating_user_id = :user_id OR connected_user_id = :user_id) AND (initiating_user_id = u.id OR connected_user_id = u.id) AND status = "blocked")';
        $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id]);
        return $resultSet->fetchAllAssociative();
      } catch (Exception $err) {
        return $err;
      }
    }

    public function getAllPublicUsers (): array|Exception
    # all public users, if no user is signed in
    {
      try { 
        $conn = $this->getEntityManager()->getConnection();
        $sql = 'SELECT u.email, u.username, u.description FROM user u WHERE public = 1;';
        $resultSet = $conn->executeQuery($sql);
        return $resultSet->fetchAllAssociative();
      } catch (Exception $err) {
        return $err;
      }
    }
    //    /**
    //     * @return User[] Returns an array of User objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?User
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
