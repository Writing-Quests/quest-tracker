<?php

namespace App\Entity;

use ApiPlatform\Api\UriVariablesConverter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiSubresource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\OpenApi\Model;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\QueryParameter;


use App\Repository\ConnectionRepository;
use App\State\ConnectionFeedProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConnectionRepository::class)]
#[ORM\EntityListeners(["App\Listener\ConnectionListener"])]
// NOTE: GET endpoints are managed via App\Controller\ConnectionController to account for user column weirdness
#[ApiResource(
  operations: [
      new Post (
        uriTemplate: 'connection/new',
        security: "is_granted('ROLE_USER')"
      ),
      new Patch (
        uriTemplate: 'connection/{id}',
        security: "object.getConnectedUserId() == user.getId() or object.getInitiatingUserId() == user.getId()"
      ),
      new Delete (
        uriTemplate: 'connection/{id}',
        security: "object.getConnectedUserId() == user.getId() or object.getInitiatingUserId() == user.getId()"
      )
  ],
  security: "is_granted('ROLE_USER')",
)]
class Connection
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: true, readable: true)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    private ?string $status = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[ApiProperty]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[ApiProperty]
    private ?\DateTimeInterface $changed_at = null;

    #[ORM\Column]
    #[ApiProperty]
    private ?int $initiating_user_id;

    #[ORM\Column]
    #[ApiProperty]
    private ?int $connected_user_id;

    public function __construct()
    {}

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
      # STATUS STRING OPTIONS: 
        # pending
        # ignored
        # mutual
        # following
        # blocked
        $this->status = $status;

        return $this;
    }

    public function getChangedAt(): ?\DateTimeInterface
    {
        return $this->changed_at;
    }

    public function setChangedAt(\DateTimeInterface $changed_at = (new \DateTime())): static
    {
        $this->changed_at = $changed_at;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeInterface $created_at = (new \DateTime())): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getConnectedUserId(): int
    {
        return $this->connected_user_id;
    }

    public function setConnectedUserId(int $connected_user_id): static
    {
        $this->connected_user_id = $connected_user_id;

        return $this;
    }

    public function getInitiatingUserId(): int
    {
        return $this->initiating_user_id;
    }

    public function setInitiatingUserId(int $initiating_user_id): static
    {
        $this->initiating_user_id = $initiating_user_id;

        return $this;
    }
}