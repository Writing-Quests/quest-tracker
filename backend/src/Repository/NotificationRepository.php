<?php

namespace App\Repository;

use App\Entity\Notification;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    public function markMultipleAsRead (array $notification_ids, int $user_id) {
      return (
        $this->createQueryBuilder('n')
          ->update(Notification::class, 'n')
          ->set('n.user_read',1)
          ->andWhere('n.id IN (:notification_ids)')
          ->andWhere('n.user = :user_id')
          ->setParameter('notification_ids', $notification_ids)
          ->setParameter('user_id', $user_id)
          ->getQuery()
          ->execute()
      );
      /*
      $conn = $this->getEntityManager()->getConnection();
      $sql = '
      UPDATE notification SET user_read = 1 WHERE id IN (:id_string) AND user_id = :user_id
      ';
      $resultSet = $conn->executeQuery($sql, ['user_id' => $user_id, 'id_string' => implode(",", $notification_ids)]);
      return $resultSet->fetchAllAssociative();
      */
    }

    //    /**
    //     * @return Notification[] Returns an array of Notification objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('n.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Notification
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
