<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Link;

use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Serializer\Annotation\SerializedName;

use App\Repository\ProjectRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\EntityListeners(["App\Listener\ProjectListener"])]
#[ApiResource(
    operations: [
        new Get(
          uriTemplate: '/project/{code}',
          security: "is_granted('ROLE_ADMIN') or object.getUser() == user or object.getUser().isPublic()",
        ),
         new GetCollection(
            uriTemplate: '/users/{id}/projects',
            uriVariables: [
                'id' => new Link(
                    fromClass: User::class,
                    fromProperty: 'username',
                    toProperty: 'user',
                    securityObjectName: 'uriUser',
                    security: "uriUser == user or is_granted('ROLE_ADMIN') or uriUser.isPublic()",
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
    #[ApiProperty(identifier: false, writable: false, readable: false)]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'projects')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, options: ["default" => "CURRENT_TIMESTAMP"])]
    #[ApiProperty(writable: false)]
    private ?\DateTimeInterface $created_at;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, options: ["default" => "CURRENT_TIMESTAMP"])]
    #[ApiProperty(writable: false)]
    private ?\DateTimeInterface $edited_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $title = null;

    #[ORM\Column(options: ["default" => "json_object()"], nullable: true)]
    private ?array $details = null;

    #[ORM\Column(nullable: false, options: ["default" => false])]
    private ?bool $public = false;

    /**
     * @var Collection<int, ProjectGoal>
     */
    #[ORM\OneToMany(targetEntity: ProjectGoal::class, mappedBy: 'project', orphanRemoval: true)]
    private Collection $projectGoals;

    #[ORM\Column(type: 'ulid')]
    #[ApiProperty(identifier: true, writable: false)]
    private ?Ulid $code = null;

    /**
     * @var Collection<int, ProgressEntry>
     */
    #[ORM\OneToMany(targetEntity: ProgressEntry::class, mappedBy: 'project', orphanRemoval: true)]
    #[ORM\OrderBy(["created_at" => "DESC"])]
    private Collection $progressEntries;

    /**
     * @var Collection<int, FeedEntry>
     */
    #[ORM\OneToMany(targetEntity: FeedEntry::class, mappedBy: 'project')]
    private Collection $updates;

    public function __construct()
    {
        $this->projectGoals = new ArrayCollection();
        $this->progressEntries = new ArrayCollection();
        $this->updates = new ArrayCollection();
    }

    public function getId(): ?string
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
        // this was giving the reporting snapshot issues when it came back null, idk why
        if ($this->details == null) {
          return [];
        } else {
          return $this->details;
        }
    }

    public function setDetails(array $details): static
    {
        $this->details = $details;

        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->getUser()->isPublic();
        // TODO: Actually implement permissions on projects
        //return $this->public;
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
        //dd($this->projectGoals->getValues());
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

    public function getCode(): ?Ulid
    {
        return $this->code;
    }

    public function setCode(Ulid $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function makeSnapshot () {
      // returns a version of the entity data that's compatible with the JSON field in MySQL
      return [
        'username'=>$this->getUser()->getUsername(),
        'email'=>$this->getUser()->getEmail(),
        'createdAt'=>$this->getCreatedAt(),
        'lastUpdate'=>$this->getEditedAt(),
        'title'=>$this->getTitle(),
        'details'=>$this->getDetails()
      ];
    }

    /**
     * @return Collection<int, ProgressEntry>
     */
    #[Ignore]
    public function getProgressEntries(): Collection
    {
        return $this->progressEntries;
    }

    #[ApiProperty]
    public function getProgress(): array
    {
        $ret = array();
        foreach($this->progressEntries as $entry) {
            if(!isset($ret[$entry->getType()])) {
                $ret[$entry->getType()] = array();
            }
            if(!isset($ret[$entry->getType()][$entry->getUnits()])) {
                $ret[$entry->getType()][$entry->getUnits()] = "0";
            }
            $ret[$entry->getType()][$entry->getUnits()] = bcadd(
                $ret[$entry->getType()][$entry->getUnits()],
                $entry->getValue(),
                2
            );
        }
        return $ret;
    }

    public function addProgressEntry(ProgressEntry $progressEntry): static
    {
        if (!$this->progressEntries->contains($progressEntry)) {
            $this->progressEntries->add($progressEntry);
            $progressEntry->setProject($this);
        }

        return $this;
    }

    public function removeProgressEntry(ProgressEntry $progressEntry): static
    {
        if ($this->progressEntries->removeElement($progressEntry)) {
            // set the owning side to null (unless already changed)
            if ($progressEntry->getProject() === $this) {
                $progressEntry->setProject(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    public function getUpdates(): Collection
    {
        return $this->updates;
    }

    public function addUpdate(FeedEntry $update): static
    {
        if (!$this->updates->contains($update)) {
            $this->updates->add($update);
            $update->setProject($this);
        }

        return $this;
    }

    public function removeUpdate(FeedEntry $update): static
    {
        if ($this->updates->removeElement($update)) {
            // set the owning side to null (unless already changed)
            if ($update->getProject() === $this) {
                $update->setProject(null);
            }
        }

        return $this;
    }
}
