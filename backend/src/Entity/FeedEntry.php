<?php

namespace App\Entity;

use DateTime;
use App\Repository\FeedEntryRepository;
use App\State\ConnectionFeedProvider;
use App\Filter\SearchFilter;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Link;
use ApiPlatform\OpenApi\Model\Parameter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiSubresource;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: FeedEntryRepository::class)]
#[ORM\EntityListeners(["App\Listener\FeedEntryListener"])]
#[ApiResource(
  operations: [
    new Get(),
    new GetCollection(
        uriTemplate: '/project/{code}/feed',
        uriVariables: [
            'code' => new Link(
                fromClass: Project::class,
                fromProperty: 'code',
                toProperty: 'project',
                securityObjectName: 'uriProject',
                security: "is_granted('ROLE_USER') or (uriProject.isPublic())" 
            )
        ],
        security: "true", // Security is on the Link level
    ),
  ],
)]
/*
* 2025-08-09 - see notes in ConnectionFeedProvider.php for why I had to knock this one out. T_T
* For now, /connection/feed is set in FeedEntryRepository to get around the issue.
* /
/*
#[ApiResource(
  operations: [
      new GetCollection(
        uriTemplate: '/connection/feed',
        provider: ConnectionFeedProvider::class
      ),
  ],
  security: "is_granted('ROLE_USER')",
)]
*/
class FeedEntry
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: false, readable: true, writeable: false)]
    private ?int $id = null;
    
    // need to revisit this; API throws an IRI error if it can't read the ID, even with code as the identifier
    #[ORM\Column(type: 'ulid')]
    #[ApiProperty(identifier: true, readable: true, writable: false)]
    private ?Ulid $code = null;

    #[ORM\ManyToOne(inversedBy: 'feed_entries')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty(readable:false)] // I get username elsewere, this return the API 
    private ?User $user = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[ApiProperty(readable:true)]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[ApiProperty(readable:true)]
    private ?\DateTimeInterface $edited_at = null;
    
    /**
     * @var Collection<int, Interaction>
     */
    #[ORM\OneToMany(targetEntity: Interaction::class, mappedBy: 'feed_entry_id', orphanRemoval: true)]
    #[ApiProperty(readable:true)]
    private Collection $interactions;

    #[ORM\Column]
    #[ApiProperty(readable:true)]
    private array $details = [];

    #[ORM\Column(length: 255)]
    #[ApiProperty(readable:true)]
    private ?string $update_type = null;

    #[ORM\ManyToOne(inversedBy: 'updates')]
    #[ORM\JoinColumn(nullable: true)]
    #[ApiProperty(readable:false)]
    private ?Project $project = null;

    public function __construct()
    {
        $this->interactions = new ArrayCollection();
    }

    #[ApiResource (writable: false)]
    public function getProjectTitle() {
      return $this->getProject()->getTitle();
    }

    #[ApiResource (writable: false)]
    public function getProjectCode() {
      return $this->getProject()->getCode();
    }

    #[ApiResource (writable: false)]
    public function getUsername() {
      return $this->getUser()->getUsername();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?user
    {
        return $this->user;
    }

    public function setUser(?user $user): static
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
    
    /**
     * @return Collection<int, Interaction>
     */
    public function getInteractions(): Collection
    {
        return $this->interactions;
    }

    public function addInteraction(Interaction $interaction): static
    {
        if (!$this->interactions->contains($interaction)) {
            $this->interactions->add($interaction);
            $interaction->setPostId($this);
        }

        return $this;
    }

    public function removeInteraction(Interaction $interaction): static
    {
        if ($this->interactions->removeElement($interaction)) {
            // set the owning side to null (unless already changed)
            if ($interaction->getPostId() === $this) {
                $interaction->setPostId(null);
            }
        }

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

    public function getUpdateType(): ?string
    {
        return $this->update_type;
    }

    public function setUpdateType(string $update_type): static
    {
        $this->update_type = $update_type;

        return $this;
    }

    public function getProject(): ?project
    {
        return $this->project;
    }

    public function setProject(?project $project): static
    {
        $this->project = $project;

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
}
