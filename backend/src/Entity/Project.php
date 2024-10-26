<?php

namespace App\Entity;

use Sqids\Sqids;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;

use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Serializer\Annotation\SerializedName;

use App\Repository\ProjectRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\EntityListeners(["App\Listener\ProjectListener"])]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(
            uriTemplate: '/users/{id}/projects',
            uriVariables: [
                'id' => new Link(
                    fromClass: User::class,
                    fromProperty: 'username',
                    toProperty: 'user',
                    securityObjectName: 'uriUser',
                    security: "uriUser == user or is_granted('ROLE_ADMIN')", // TODO: Expand this to allow public listing of public projects
                )
            ],
            security: "true", // Security is on the Link level for now
        ),
        new Post(
            security: "is_granted('ROLE_USER')",
        ),
        new Patch(
            security: "is_granted('ROLE_ADMIN') or (object.getUser() == user)",
        ),
    ],
    security: "object.isPublic() or is_granted('ROLE_ADMIN') or (object.getUser() == user)",
)]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(writable: false)]
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

    #[ORM\Column(options: ["default" => "(JSON_OBJECT())"])]
    private ?array $details = null;

    #[ORM\Column(nullable: false, options: ["default" => false])]
    private ?bool $public = false;

    /**
     * @var Collection<int, ProjectGoal>
     */
    #[ORM\OneToMany(targetEntity: ProjectGoal::class, mappedBy: 'project', orphanRemoval: true)]
    private Collection $projectGoals;

    public function __construct()
    {
        $this->projectGoals = new ArrayCollection();
    }

    public function getId(): ?string
    {
        $sqids = new Sqids(minLength: 8, alphabet: $_ENV['SQIDS_ALPHABET_PROJECTS']);
        return $sqids->encode([$this->id]);
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

    /**
     * @return Collection<int, ProjectGoal>
     */
    #[Ignore]
    public function getProjectGoals(): Collection
    {
        return $this->projectGoals;
    }

    // For some reason this works to embed the goals into the API response
    public function getGoals(): Collection
    {
        return $this->projectGoals;
    }

    public function addProjectGoal(ProjectGoal $projectGoal): static
    {
        if (!$this->projectGoals->contains($projectGoal)) {
            $this->projectGoals->add($projectGoal);
            $projectGoal->setProject($this);
        }

        return $this;
    }

    public function removeProjectGoal(ProjectGoal $projectGoal): static
    {
        if ($this->projectGoals->removeElement($projectGoal)) {
            // set the owning side to null (unless already changed)
            if ($projectGoal->getProject() === $this) {
                $projectGoal->setProject(null);
            }
        }

        return $this;
    }
}
