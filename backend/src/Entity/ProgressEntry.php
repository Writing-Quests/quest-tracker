<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use App\Repository\ProgressEntryRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Ulid;
use Symfony\Component\Serializer\Annotation\Groups;
use DateTime;
use DateTimeImmutable;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;

#[ORM\Entity(repositoryClass: ProgressEntryRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/project/{code}/progress',
            uriVariables: [
                'code' => new Link(
                    fromClass: Project::class,
                    fromProperty: 'code',
                    toProperty: 'project',
                    securityObjectName: 'uriProject',
                    security: "uriProject.getUser() == user or is_granted('ROLE_ADMIN') or uriProject.getUser().isPublic()",
                )
            ],
            security: "true", // Security is on the Link level
        ),
        new Post(
            securityPostDenormalize: "object.getProject().getUser() == user or is_granted('ROLE_ADMIN')",
        ),
    ]
)]
class ProgressEntry
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'progressEntries')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['progress:write'])]
    private ?\DateTimeInterface $entry_date = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    #[Groups(['progress:write'])]
    private ?string $value = null;

    #[ORM\Column(length: 255)]
    #[Groups(['progress:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Groups(['progress:write'])]
    private ?string $units = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(Ulid $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getEntryDate(): ?\DateTimeInterface
    {
        return $this->entry_date;
    }

    public function setEntryDate(\DateTimeInterface $entry_date): static
    {
        $this->entry_date = $entry_date;

        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): static
    {
        $this->value = $value;

        return $this;
    }

    #[ORM\PrePersist]
    public function prePersist(): void
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        $this->setCreatedAt(new DateTimeImmutable());
        if(!$this->getEntryDate()) {
            $this->setEntryDate(new DateTime());
        }
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getUnits(): ?string
    {
        return $this->units;
    }

    public function setUnits(string $units): static
    {
        $this->units = $units;

        return $this;
    }
}
