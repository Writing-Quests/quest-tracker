<?php

namespace App\Repository;

use App\Entity\LoginToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use DateTimeImmutable;

/**
 * @extends ServiceEntityRepository<LoginToken>
 */
class LoginTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LoginToken::class);
    }

    public function verifyTokenInformation($email, $token, $type): ?LoginToken
    {
            return $this->createQueryBuilder('l')
                ->where('l.payload = :email')
                ->andWhere('l.secret = :token')
                ->andWhere('l.type = :type')
                ->setParameter('email', $email)
                ->setParameter('token', $token)
                ->setParameter('type', $type)
                ->getQuery()
                ->getOneOrNullResult()
            ;
    }

    public function removeUserOldTokensOfType ($email, $type, $current_token_id): void {
      $qb = $this->createQueryBuilder('l');
      $qb->delete(LoginToken::class, 'l')
        ->where('l.payload = :email')
        ->andWhere('l.type = :type')
        ->andWhere('l.id != :current_token_id')
        ->setParameter('email', $email)
        ->setParameter('type', $type)
        ->setParameter('current_token_id', $current_token_id)
        ->getQuery()
        ->execute();
    }

    public function removeAllExpiredTokens (): void {
      $rightNow = (new DateTimeImmutable())->format("Y-m-d H:i:s");
      $qb = $this->createQueryBuilder('l');
      $qb->delete(LoginToken::class, 'l')
        ->andWhere('l.expires_at < :now')
        ->setParameter('now', $rightNow)
        ->getQuery()
        ->execute();
    }

    //    /**
    //     * @return LoginToken[] Returns an array of LoginToken objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('l.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?LoginToken
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
