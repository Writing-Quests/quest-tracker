<?php

namespace App\Repository;

use App\Entity\MessageThread;
use App\Entity\DirectMessage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator as DoctrinePaginator;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\QueryBuilder;

/**
 * @extends ServiceEntityRepository<MessageThread>
 */
class MessageThreadRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MessageThread::class);
    }

    public function getUserMessageThreads($user_id,int $page = 1, int $itemsPerPage = 30): DoctrinePaginator
    {
          $qb = $this->createQueryBuilder('m');
          // '(SELECT d.sent_at FROM App\Entity\DirectMessage d WHERE d.message_thread_id = m.id ORDER BY d.sent_at DESC limit 1) AS thread_updated_at'
          $subQb = $this->createQueryBuilder('q');
          ($subQb)
            ->select('MAX(d.sent_at)')
            ->from('App\Entity\DirectMessage', 'd')
            ->where('d.message_thread = m.id');
            return new DoctrinePaginator(
            ($qb)
              ->addSelect(sprintf('(%s) AS thread_updated_at', $subQb->getDQL()))
              ->where('m.sender_user_id = :user_id')
              ->orWhere('m.receiving_user_id = :user_id')
              ->setParameter('user_id',$user_id)
              ->orderBy('thread_updated_at', 'DESC')
              ->addCriteria(
                  Criteria::create()
                    ->setFirstResult(($page - 1) * $itemsPerPage)
                    ->setMaxResults($itemsPerPage)
            )
        );
    }

    //    /**
    //     * @return MessageThread[] Returns an array of MessageThread objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('m.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?MessageThread
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
