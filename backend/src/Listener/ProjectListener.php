<?php

namespace App\Listener;

use DateTime;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Uid\Ulid;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Project;
use App\Entity\FeedEntry;

class ProjectListener
{
    private $token_storage;

    public function __construct(TokenStorageInterface $token_storage, EntityManagerInterface $entityManager)
    {
        $this->token_storage = $token_storage;
        $this->entityManager = $entityManager;
    }

    public function prePersist(Project $project)
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        $user = $this->token_storage->getToken()->getUser();
        $project->setCreatedAt(new DateTime());
        $project->setEditedAt(new DateTime());
        $project->setCode(new Ulid());
        $project->setUser($user);
    }

    public function postPersist (Project $project) {
      $update_post = new FeedEntry();
      $user = $this->token_storage->getToken()->getUser();
      ($update_post)
        ->setUser($user)
        ->setUpdateType('new')
        ->setCreatedAt(new DateTime())
        ->setEditedAt(new DateTime())
        ->setProject($project)
        ->setDetails([
          'verb' => 'created'
        ]);
      $this->entityManager->persist($update_post);
      $this->entityManager->flush();
    }

    public function preUpdate(Project $project)
    {
        $project->setEditedAt(new DateTime());
    }

}
