<?php

namespace App\Listener;

use DateTime;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use App\Entity\Project;

class ProjectListener
{
    private $token_storage;

    public function __construct(TokenStorageInterface $token_storage)
    {
        $this->token_storage = $token_storage;
    }

    public function prePersist(Project $project)
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        $project->setCreatedAt(new DateTime());
        $project->setEditedAt(new DateTime());

        $project->setUser($this->token_storage->getToken()->getUser());
    }

    public function preUpdate(Project $project)
    {
        $project->setEditedAt(new DateTime());
    }

}
