<?php

namespace App\Entity;

use DateTime;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;

use App\Repository\ProjectRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
    ]
)]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'projects')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, options: ["default" => "NOW()"])]
    #[ApiProperty(writable: false)]
    private ?\DateTimeInterface $created_at;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, options: ["default" => "NOW()"])]
    #[ApiProperty(writable: false)]
    private ?\DateTimeInterface $edited_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $title = null;

    #[ORM\Column]
    private array $details = [];

    #[ORM\Column(nullable: false, options: ["default" => false])]
    private ?bool $public = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeInterface $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getEditedAt(): ?\DateTimeInterface
    {
        return $this->edited_at;
    }

    public function setEditedAt(\DateTimeInterface $edited_at): static
    {
        $this->edited_at = $edited_at;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDetails(): array
    {
        return $this->details;
    }

    public function setDetails(array $details): static
    {
        $this->details = $details;

        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->public;
    }

    public function setPublic(bool $public): static
    {
        $this->public = $public;

        return $this;
    }

    #[ORM\PrePersist]
    public function prePersist(): void
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        $this->created_at = new DateTime();
        $this->edited_at = new DateTime();
    }
    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->edited_at = new DateTime();
    }
}
