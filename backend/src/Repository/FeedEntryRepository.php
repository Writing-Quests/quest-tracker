<?php

namespace App\Repository;
use Exception;
use App\Entity\User;
use App\Entity\FeedEntry;
use App\Entity\Project;
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

    public function getFullUserFeed(array $buddy_ids, int $page = 1, int $itemsPerPage = 30): Array
    {
      return (
        $this->createQueryBuilder('f')
          ->join('f.user', 'user')
          ->join ('f.project', 'project')
          ->select('f.code as update_code, f.created_at, f.update_type, f.details, f.edited_at, project.title as project_title, project.code as project_code, user.username')
          ->andWhere('f.user IN (:user_ids)')
          ->setParameter('user_ids', $buddy_ids)
          ->orderBy('f.edited_at', 'DESC')
          ->addCriteria(
              Criteria::create()
                ->setFirstResult(($page - 1) * $itemsPerPage)
                ->setMaxResults($itemsPerPage)
          )
          ->getQuery()
          ->getResult()
      );
    }

    public function getManualPageInfo (array $buddy_ids): array
    {
      $itemsPerPage = 30;
      $totalItems = count(
        $this->createQueryBuilder('f')
          ->select('f.code')
          ->andWhere('f.user IN (:user_ids)')
          ->setParameter('user_ids', $buddy_ids)
          ->getQuery()
          ->getResult()
      );
      return ['totalItems' => $totalItems, 'pages' => ceil($totalItems / $itemsPerPage)];
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
