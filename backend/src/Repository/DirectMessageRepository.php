<?php

namespace App\Repository;

use App\Entity\DirectMessage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DirectMessage>
 */
class DirectMessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DirectMessage::class);
    }

    public function threadHasUnreadForMe (int $message_thread_id, int $user_id) {
      $conn = $this->getEntityManager()->getConnection();
      $sql = '
      SELECT id,seen_at,from_user_id FROM direct_message WHERE message_thread_id = :message_thread_id AND seen_at IS NULL AND from_user_id != :user_id
      ';
      $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id, 'message_thread_id' => $message_thread_id]);
      return count($resultSet->fetchAllAssociative()) > 0;
    }
    //    /**
    //     * @return DirectMessage[] Returns an array of DirectMessage objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('d')
    //            ->andWhere('d.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('d.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?DirectMessage
    //    {
    //        return $this->createQueryBuilder('d')
    //            ->andWhere('d.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
