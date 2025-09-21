<?php

namespace App\DataFixtures;

use DateTimeImmutable;
use DateTimeZone;

use App\Entity\User;
use App\Entity\Quest;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasher;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactory;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Uid\Uuid;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public $passwordHasher;

    public function __construct()
    {
        $passwordHasherFactory = new PasswordHasherFactory([
            // auto hasher with default options for the User class (and children)
            User::class => ['algorithm' => 'bcrypt'],

            // auto hasher with custom options for all PasswordAuthenticatedUserInterface instances
            PasswordAuthenticatedUserInterface::class => [
                'algorithm' => 'bcrypt',
                'cost' => 15,
            ],
        ]);
        $this->passwordHasher = new UserPasswordHasher($passwordHasherFactory);
    }

    public function load(ObjectManager $manager): void
    {
        // User
        $user1 = new User();
        $user1->setUsername('user1');
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user1,
            'password'
          );
        $user1->setPassword($hashedPassword);
        $user1->setEmail('user1@example.com');
        $user1->setCreatedAt(new DateTimeImmutable()); // Defaults to now
        $user1->setTimezone(new DateTimeImmutable('', new DateTimeZone('America/Los_Angeles')));
        $manager->persist($user1);

        // Quest
        $dateFormat = 'Y-m-d';
        $quest1 = new Quest();
        $quest1->setTitle('August Novel Quest');
        $quest1->setStartDate(DateTimeImmutable::createFromFormat($dateFormat, '2025-09-01'));
        $quest1->setEndDate(DateTimeImmutable::createFromFormat($dateFormat, '2025-09-30'));
        $quest1->setGoalType('writing');
        $quest1->setGoalUnits('words');
        $quest1->setGoalAmount(50000);
        $manager->persist($quest1);
        // Bypass the automatic uuid creation
        $quest1->setId(Uuid::fromString('b00cb00c-b00c-4b00-9b00-b00cb00cb00c'));
        $manager->persist($quest1);

        $manager->flush();
    }
}
