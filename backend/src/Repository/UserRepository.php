<?php

namespace App\Repository;
use Exception;
use App\Entity\User;
use App\Entity\Connection;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Common\Collections\Criteria;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;
use Doctrine\ORM\Tools\Pagination\Paginator as DoctrinePaginator;

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

    public function getAllPublicUsersAndConnections($user_id,int $page = 1, int $itemsPerPage = 10): DoctrinePaginator
    # relative to a signed-in user, finds all public users who are not blocked or blocking the signed in user
    {
        return new DoctrinePaginator(
            $this->createQueryBuilder('u')
              ->addSelect('u.id, u.username, u.created_at, u.description, u.last_activity_timestamp')
              ->andWhere('u.public = :public')
              ->andWhere('u.id != :user_id')
              ->andWhere('NOT EXISTS (SELECT c2.status FROM App\Entity\Connection c2 WHERE (c2.initiating_user_id = :user_id OR c2.connected_user_id = :user_id) AND (c2.initiating_user_id = u.id OR c2.connected_user_id = u.id) AND c2.status = :status)')
              ->setParameter('public', true)
              ->setParameter('user_id',$user_id)
              ->setParameter('status', 'blocked') # this works when it's a parameter, not when written into the query builder, idk - Ashley
              ->orderBy('u.last_activity_timestamp', 'DESC')
              ->addCriteria(
                  Criteria::create()
                    ->setFirstResult(($page - 1) * $itemsPerPage)
                    ->setMaxResults($itemsPerPage)
            )
        );
    }

    public function getAllPublicUsers (int $page = 1, int $itemsPerPage = 10): DoctrinePaginator
    # all public users, if no user is signed in
    {
      try { 
        /*
        $conn = $this->getEntityManager()->getConnection();
        $sql = 'SELECT u.username, u.created_at, u.description FROM user u WHERE public = 1;';
        $resultSet = $conn->executeQuery($sql);
        return $resultSet->fetchAllAssociative();
        */
        return new DoctrinePaginator(
            $this->createQueryBuilder('u')
              ->addSelect('u.username, u.created_at, u.description, u.last_activity_timestamp')
              ->where('u.public = :public')
              ->setParameter('public', true)
              ->orderBy('u.last_activity_timestamp', 'DESC')
              ->addCriteria(
                  Criteria::create()
                    ->setFirstResult(($page - 1) * $itemsPerPage)
                    ->setMaxResults($itemsPerPage)
            )
        );
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
