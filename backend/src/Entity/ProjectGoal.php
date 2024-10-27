<?php

namespace App\Entity;

use DateTime;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Link;

use App\Repository\ProjectGoalRepository;
use App\Controller\ProjectGoalProgress;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Context;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;
use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: ProjectGoalRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/goals/{code}',
        ),
        new GetCollection(
            uriTemplate: '/projects/{id}/goals',
            uriVariables: [
                // TODO: This breaks for projects without any goals. The UI currently enforces that every project has to have at least one goal, but this is something to be fixed in the future
                'id' => new Link(
                    fromClass: Project::class,
                    toProperty: 'project',
                    security: "project.isPublic() or is_granted('ROLE_ADMIN') or (project.getUser() === user)",
                )
            ],
            security: "true", // Security is on the Link level
        ),
        new Patch(
            uriTemplate: '/goals/{code}',
            security: "is_granted('ROLE_ADMIN') or (object.getProject().getUser() == user)",
        ),
        new Patch(
            uriTemplate: '/goals/{code}/progress',
            inputFormats: ['json' => ['application/json']],
            security: "is_granted('ROLE_ADMIN') or (object.getProject().getUser() == user)",
            controller: ProjectGoalProgress::class,
            deserialize: false,
        ),
        new Post(
            uriTemplate: '/goals',
            security: "is_granted('ROLE_USER')",
        ),
    ],
    security: "object.getProject().isPublic() or is_granted('ROLE_ADMIN') or (object.getProject().getUser() == user)",
)]
class ProjectGoal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: false, readable: false)]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'projectGoals')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    #[ORM\Column(length: 255)]
    private ?string $type = 'writing';

    #[ORM\Column(length: 255)]
    private ?string $units = 'words';

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    private ?string $goal = '0.00';

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[ApiProperty(writable: false)]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[ApiProperty(writable: false)]
    private ?\DateTimeInterface $edited_at = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $start_date = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $end_date = null;

    #[ORM\Column(type: Types::SIMPLE_ARRAY)]
    private array $progress = ['0'];

    #[ORM\Column(type: 'ulid')]
    #[ApiProperty(identifier: true, writable: false)]
    private ?Ulid $code = null;

    public function getId(): ?string
    {
        return $this->id;
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

    public function getGoal(): ?string
    {
        return $this->goal;
    }

    public function setGoal(string $goal): static
    {
        $this->goal = $goal;

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

    #[Context([DateTimeNormalizer::FORMAT_KEY => 'Y-m-d'])]
    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->start_date;
    }

    public function setStartDate(?\DateTimeInterface $start_date): static
    {
        $this->start_date = $start_date;

        return $this;
    }

    #[Context([DateTimeNormalizer::FORMAT_KEY => 'Y-m-d'])]
    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->end_date;
    }

    public function setEndDate(?\DateTimeInterface $end_date): static
    {
        $this->end_date = $end_date;

        return $this;
    }

    public function getProgress(): array
    {
        return $this->progress;
    }

    public function setProgress(array $progress): static
    {
        $min = min(array_keys($progress));
        $max = max(array_keys($progress));

        // Fill in missing keys with null
        for ($i = $min; $i <= $max; $i++) {
            if (!array_key_exists($i, $progress)) {
                $progress[$i] = null;
            }
        }

        // Sort array by key to ensure correct order
        ksort($progress);

        $this->progress = $progress;

        return $this;
    }

    #[ApiProperty]
    public function getCurrentValue(): string
    {
        $sum = '0.00';
        foreach($this->progress as $p) {
            $sum = bcadd($sum, $p, 2);
        }
        return $sum;
    }

    #[ApiProperty]
    public function getGoalProgressPercent(): ?string
    {
        // Prevent division by 0 errors
        if((int) $this->goal <= 0) {
            return null;
        }
        return bcmul(
            bcdiv($this->getCurrentValue(), $this->goal, 4),
            '100',
            2
        );
    }

    #[ORM\PrePersist]
    public function prePersist(): void
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        $this->setCreatedAt(new DateTime());
        $this->setEditedAt(new DateTime());
        $this->setCode(new Ulid());
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->setEditedAt(new DateTime());
    }

    public function getCode(): ?Ulid
    {
        return $this->code;
    }

    public function setCode(Ulid $code): static
    {
        $this->code = $code;

        return $this;
    }
}
