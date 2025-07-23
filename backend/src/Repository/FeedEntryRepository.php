<?php

namespace App\Repository;
use Exception;
use App\Entity\User;
use App\Entity\FeedEntry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\Tools\Pagination\Paginator as DoctrinePaginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FeedEntry>
 */
class FeedEntryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FeedEntry::class);
    }

    public function getFullUserFeed(array $buddy_ids, int $page = 1, int $itemsPerPage = 30): DoctrinePaginator
    {
      return new DoctrinePaginator(
        $this->createQueryBuilder('f')
          ->addSelect('f.code, f.details, f.edited_at')
          ->andWhere('f.user IN (:user_ids)')
          ->setParameter('user_ids', $buddy_ids)
          ->orderBy('f.edited_at', 'DESC')
          ->addCriteria(
              Criteria::create()
                ->setFirstResult(($page - 1) * $itemsPerPage)
                ->setMaxResults($itemsPerPage)
          )
      );
    }

    //    /**
    //     * @return FeedEntry[] Returns an array of FeedEntry objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('p.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?FeedEntry
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
