<?php

namespace App\Repository;

use App\Entity\Connection;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Connection>
 */
class ConnectionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Connection::class);
    }

    //     * @return Connection[] Returns an array of Connection objects
    //     */
    //https://symfony.com/doc/current/doctrine.html#querying-with-the-query-builder
        public function getAllUserConnections($user_id): array
        {
          $conn = $this->getEntityManager()->getConnection();
          $sql = '
          SELECT c.*, u1.username AS initiating_username, u2.username AS connected_username 
          FROM connection c 
          LEFT JOIN user u1 ON u1.id = c.initiating_user_id
          LEFT JOIN user u2 ON u2.id = c.connected_user_id
          WHERE c.initiating_user_id = :user_id OR (c.connected_user_id = :user_id AND c.status != "blocked");
          ';
          $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id]);
          return $resultSet->fetchAllAssociative();
        }

        public function getUserMutuals($user_id): array {
          $conn = $this->getEntityManager()->getConnection();
          $sql = '
          SELECT c.*, u1.username AS initiating_username, u2.username AS connected_username 
          FROM connection c 
          LEFT JOIN user u1 ON u1.id = c.initiating_user_id
          LEFT JOIN user u2 ON u2.id = c.connected_user_id
          WHERE (c.initiating_user_id = :user_id OR c.connected_user_id = :user_id) AND c.status = "mutual";
          ';
          $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id]);
          return $resultSet->fetchAllAssociative();
        }

        public function getBlockedUsers($user_id): array {
          // I don't need to know my own username; only grab username of blocked user
          $conn = $this->getEntityManager()->getConnection();
          $sql = '
          SELECT c.*, u2.username AS connected_username 
          FROM connection c 
          LEFT JOIN user u2 ON u2.id = c.connected_user_id
          WHERE c.initiating_user_id = :user_id AND c.status = "blocked";
          ';
          $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id]);
          return $resultSet->fetchAllAssociative();
        }

        public function getUserFollowing ($user_id,): array {
          // I don't need to know my own username; only grab username of followed user
          $conn = $this->getEntityManager()->getConnection();
          $sql = '
          SELECT c.*, u2.username AS connected_username 
          FROM connection c 
          LEFT JOIN user u2 ON u2.id = c.connected_user_id
          WHERE c.initiating_user_id = :user_id AND c.status = "following";
          ';
          $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id]);
          return $resultSet->fetchAllAssociative();
        }

        public function getConnectionsAwaitingAction($user_id): array {
          // I don't need to know my own username; only grab username of other user
          // as far as the initiating user is concerned, an ignored request is just pending
          $conn = $this->getEntityManager()->getConnection();
          $sql = '
          SELECT c.*, u1.username AS initiating_username
          FROM connection c 
          LEFT JOIN user u1 ON u1.id = c.connected_user_id
          WHERE c.connected_user_id = :user_id AND (c.status = "pending" OR c.status = "ignored");
          ';
          $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id]);
          return $resultSet->fetchAllAssociative();
        }

        public function getUserConnectionStatus($user1_id,$user2_id): array {
          // this one doesn't require any username information; right now it runs on a single profile page, so
          // by the time this endpoint is queried, we already know both of our users
          return $this->createQueryBuilder('c')
            ->andWhere('c.initiating_user_id = :user1_id AND c.connected_user_id = :user2_id')
            ->orWhere('c.initiating_user_id = :user2_id AND c.connected_user_id = :user1_id')
            ->setParameter(':user1_id', $user1_id)
            ->setParameter(':user2_id', $user2_id)
            ->getQuery()
            ->getResult();
        }

    //    /**
    //     * @return Connection[] Returns an array of Connection objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('c.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Connection
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
