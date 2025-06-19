<?php

namespace App\Listener;

use DateTime;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\ProgressEntry;
use App\Entity\FeedEntry;

class ProgressEntryListener
{
    private $token_storage;
    private $entityManager;
    public function __construct(TokenStorageInterface $token_storage, EntityManagerInterface $entityManager)
    {
        $this->token_storage = $token_storage;
        $this->entityManager = $entityManager;
    }

    public function prePersist(ProgressEntry $progress)
    {
        $project = $progress->getProject();
        $update_post = new FeedEntry();
        ($update_post)
          ->setUser($this->token_storage->getToken()->getUser())
          ->setUpdateType('progress')
          ->setCreatedAt(new DateTime())
          ->setEditedAt(new DateTime())
          ->setProject($project)
          ->setDetails([
            'verb' => 'added',
            'unit' => $progress->getUnits(),
            'value' => $progress->getValue()
          ]);
        $this->entityManager->persist($update_post);
        $this->entityManager->flush();
    }
}
