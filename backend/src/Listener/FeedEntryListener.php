<?php

namespace App\Listener;

use DateTime;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Uid\Ulid;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\FeedEntry;

class FeedEntryListener
{
    private $token_storage;
    private $entityManager;
    public function __construct(TokenStorageInterface $token_storage, EntityManagerInterface $entityManager)
    {
        $this->token_storage = $token_storage;
        $this->entityManager = $entityManager;
    }

    public function prePersist(FeedEntry $feed_entry)
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        //$user = $this->token_storage->getToken()->getUser();
        $user = $feed_entry->getUser();
        $feed_entry->setCreatedAt(new DateTime());
        $feed_entry->setEditedAt(new DateTime());
        $feed_entry->setCode(new Ulid());
        $feed_entry->setUser($user);
    }

    public function preUpdate(FeedEntry $feed_entry)
    {
        $feed_entry->setEditedAt(new DateTime());
    }

}
