<?php

namespace App\Entity;

use ApiPlatform\GraphQl\Resolver\Stage\WriteStage;
use App\Repository\ConnectionRepository;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiSubresource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model;

use Doctrine\ORM\EntityManagerInterface;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Serializer\Annotation\SerializedName;
use App\State\UserMeProvider;
use App\State\NotLoggedInRepresentation;
use App\State\AvailableProfilesProvider;
use Doctrine\ORM\EntityManager;

use Doctrine\Persistence\ManagerRegistry;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
#[ApiResource(
    operations: [
      new Get(
        uriTemplate: '/users/{username}',
        security: "is_granted('ROLE_ADMIN') or object.isPublic() or object == user"
      ),
      new Get(
          uriTemplate: '/me',
          provider: UserMeProvider::class,
          output: NotLoggedInRepresentation::class,
          openapi: new Model\Operation(
              summary: 'Retrieves the current User',
              description: 'Retrieves the currently-logged-in User resource. If not logged in, it will return `"anonymous_user": true`.',
          ),
          security: "is_granted('ROLE_ADMIN') or object.isPublic() or object == user"
      ),
      new GetCollection(
        uriTemplate: '/profiles/public',
        provider: AvailableProfilesProvider::class
      ),
      new Post(
        uriTemplate: '/users/{id}',
        security: "object == user"
      )
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: false, writable: false)]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[ApiProperty(identifier: true, writable: false)]
    #[Assert\Regex(
        pattern: '/^[a-zA-Z0-9_]+$/',
        message: 'Username can only contain letters, numbers, and underscore',
    )]
    #[Assert\Length(
        min: 5,
        max: 100,
    )]
    private ?string $username = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Ignore]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Ignore]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty(readable: true, writable: false, security: "object == user")]
    private ?string $email = null;

    #[ORM\Column(length: 255,nullable: true)]
    private ?string $unverified_email = null;

    #[ORM\Column]
    #[ApiProperty(writable: false)]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    private ?\DateTimeImmutable $edited_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $email_verified_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $last_activity_timestamp = null;

    # TODO: should we have a shorter length limit for this? 
    #[ORM\Column(type: Types::TEXT, nullable: true, length: 65535)]
    private $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $link = null;

    #[ORM\Column(type: Types::DATETIMETZ_MUTABLE)]
    private ?\DateTimeInterface $timezone = null;

    #[ORM\Column]
    private ?bool $public = false;

    /**
     * @var Collection<int, LoginToken>
     */
    #[ORM\OneToMany(targetEntity: LoginToken::class, mappedBy: 'user')]
    #[Ignore]
    private Collection $loginTokens;

    /**
     * @var Collection<int, Project>
     */
    #[ORM\OneToMany(targetEntity: Project::class, mappedBy: 'user', fetch: 'EAGER')]
    #[ORM\OrderBy(["edited_at" => "DESC"])]
    private Collection $projects;

    /**
     * @var Collection<int, Report>
     */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'reported_by_user')]
    private Collection $reports;

    /**
     * @var Collection<int, FeedEntry>
     */
    #[ORM\OneToMany(targetEntity: FeedEntry::class, mappedBy: 'user', orphanRemoval: true)]
    //#[ORM\OrderBy(["edited_at" => "DESC"])]
    private Collection $feedEntries;

    /**
     * @var Collection<int, Interaction>
     */
    #[ORM\OneToMany(targetEntity: Interaction::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $interactions;

    public function __construct()
    {
        $this->loginTokens = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->feedEntries = new ArrayCollection();
        $this->interactions = new ArrayCollection();
    }

    #[ApiResource (writable: false)]
    public function getMostRecentUpdate() {
      return $this->getFeedEntries()[0];
    }


    #[ApiResource (writable: false)]
    public function getGravatarUrl(): ?string
    {
        if($this->email) {
          $url = 'https://www.gravatar.com/avatar/' . hash( 'sha256', strtolower( trim( $this->email))) . '?d=404&s=100&r=pg';
          $headers = @get_headers($url);
          if(!$headers || $headers[0] == 'HTTP/1.1 404 Not Found') {
            return null;
          } else {
            return $url;
          }
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    #[Ignore]
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    #[Ignore]
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    #[Ignore]
    public function getUnverifiedEmail(): ?string
    {
        return $this->unverified_email;
    }

    public function setUnverifiedEmail($unverified_email): static
    {
        $this->unverified_email = $unverified_email;

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

    public function getEditedAt(): ?\DateTimeImmutable
    {
        return $this->edited_at;
    }

    public function setEditedAt(\DateTimeImmutable $edited_at): static
    {
        $this->edited_at = $edited_at;

        return $this;
    }

    public function getEmailVerifiedAt(): ?\DateTimeImmutable
    {
        return $this->email_verified_at;
    }

    public function setEmailVerifiedAt(?\DateTimeImmutable $email_verified_at): static
    {
        $this->email_verified_at = $email_verified_at;

        return $this;
    }

    public function getLastActivityTimestamp(): ?\DateTimeImmutable
    {
        return $this->last_activity_timestamp;
    }

    public function setLastActivityTimestamp(?\DateTimeImmutable $last_activity_timestamp): static
    {
        $this->last_activity_timestamp = $last_activity_timestamp;

        return $this;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function setLink(?string $link): static
    {
        $this->link = $link;

        return $this;
    }

    public function getTimezone(): ?\DateTimeInterface
    {
        return $this->timezone;
    }

    public function setTimezone(\DateTimeInterface $timezone): static
    {
        $this->timezone = $timezone;

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
     * @return Collection<int, LoginToken>
     */
    public function getLoginTokens(): Collection
    {
        return $this->loginTokens;
    }

    public function addLoginToken(LoginToken $loginToken): static
    {
        if (!$this->loginTokens->contains($loginToken)) {
            $this->loginTokens->add($loginToken);
            $loginToken->setUser($this);
        }

        return $this;
    }

    public function removeLoginToken(LoginToken $loginToken): static
    {
        if ($this->loginTokens->removeElement($loginToken)) {
            // set the owning side to null (unless already changed)
            if ($loginToken->getUser() === $this) {
                $loginToken->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Project>
     */
    #[ApiProperty(readableLink: false, writableLink: false)]
    public function getProjects(): ?Collection
    {
        return $this->projects;
    }

    public function addProject(Project $project): static
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
            $project->setUser($this);
        }

        return $this;
    }

    public function removeProject(Project $project): static
    {
        if ($this->projects->removeElement($project)) {
            // set the owning side to null (unless already changed)
            if ($project->getUser() === $this) {
                $project->setUser(null);
            }
        }

        return $this;
    }
    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->edited_at = new \DateTime();
    }

    /**
     * @return Collection<int, Report>
     */
    #[Ignore]
    // TODO: this should have some level of security so that the user or an admin can see it, but it's not just given out with the API. Right now set to ignore.
    public function getReports(): Collection
    {
        return $this->reports;
    }

    public function addReport(Report $report): static
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
            $report->setReportedByUser($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getReportedByUser() === $this) {
                $report->setReportedByUser(null);
            }
        }

        return $this;
    }

    public function makeSnapshot () {
      // returns a version of the user data that's compatible with the JSON field in MySQL
      return [
        'username'=>$this->getUsername(),
        'email'=>$this->getEmail(),
        'createdAt'=>$this->getCreatedAt(),
        'editedAt'=>$this->getEditedAt(),
        'profile_link'=>$this->getLink(),
        'gravatar'=>$this->getGravatarUrl(),
        'description'=>$this->getDescription()
      ];
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    public function getFeedEntries(): Collection
    {
        return $this->feedEntries;
    }

    public function addFeedEntry(FeedEntry $feedEntry): static
    {
        if (!$this->feedEntries->contains($feedEntry)) {
            $this->feedEntries->add($feedEntry);
            $feedEntry->setUser($this);
        }

        return $this;
    }

    public function removeFeedEntry(FeedEntry $feedEntry): static
    {
        if ($this->feedEntries->removeElement($feedEntry)) {
            // set the owning side to null (unless already changed)
            if ($feedEntry->user() === $this) {
                $feedEntry->setUser(null);
            }
        }

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
            $interaction->setUserId($this);
        }

        return $this;
    }

    public function removeInteraction(Interaction $interaction): static
    {
        if ($this->interactions->removeElement($interaction)) {
            // set the owning side to null (unless already changed)
            if ($interaction->getUserId() === $this) {
                $interaction->setUserId(null);
            }
        }

        return $this;
    }
}
