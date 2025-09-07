<?php

namespace App\Entity;

use ApiPlatform\GraphQl\Resolver\Stage\WriteStage;
use App\Repository\ConnectionRepository;

use App\Entity\Quest;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiSubresource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;

use Doctrine\ORM\EntityManagerInterface;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

use App\Controller\NewUserController;

use App\State\UserMeProvider;
use App\State\UserProfileProvider;
use App\State\NotLoggedInRepresentation;
use App\State\AvailableProfilesProvider;
use App\State\UserProfileProcessor;
use DateTimeImmutable;
use App\State\UserQuestProvider;
use Doctrine\ORM\EntityManager;

use Doctrine\Persistence\ManagerRegistry;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
#[ApiResource(
    operations: [
      new Get(
        uriTemplate: '/users/{username}',
        provider: UserProfileProvider::class,
        security: "is_granted('ROLE_ADMIN') or object.isPublic() or object == user or object.isLoggedInUserAllowed()"
      ),
      new Get(
        uriTemplate: '/me',
        provider: UserMeProvider::class,
        normalizationContext: ['groups' => ['user:read']],
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
        uriTemplate: '/users/{username}',
        denormalizationContext: ['groups' => ['user:create', 'user:write']],
        controller: NewUserController::class
      ),
      new Patch(
        uriTemplate: '/users/{username}',
        denormalizationContext: ['groups' => ['user:write']],
        security: "is_granted('ROLE_ADMIN') or object == user",
        processor: UserProfileProcessor::class
      ),
      new Patch(
        uriTemplate: '/users/{username}/reset', // needed a version with  lighter permissions, restricted to only changing the password
        denormalizationContext: ['groups' => ['user:onlypassword']],
        processor: UserProfileProcessor::class
      ),
      new Post(
        uriTemplate: '/users/{id}',
        security: "object == user"
      ),
      new Patch(
        uriTemplate: '/users/{username}',
        security: "object == user"
      ),
      new Get(
        uriTemplate: '/users/{username}/quests/{id}',
        name: 'get_user_quest',
        provider: UserQuestProvider::class,
        uriVariables: [
          'username' => new Link(fromClass: User::class, fromProperty: 'username'),
          'id' => new Link(fromClass: Quest::class, fromProperty: 'id'),
        ]
      ),
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: false, writable: false)]
    #[Groups(['user:read','user:write'])]
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
    #[Groups(['user:create','user:read'])]
    private ?string $username = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Ignore]
    #[Groups(['user:read','user:write'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Ignore]
    #[Groups(['user:write','user:onlypassword'])]
    #[ApiProperty(readable: false, writable: true)]
    private ?string $password = null;

    #[ApiProperty(readable: false, writable: true)]
    #[Groups(['user:write','user:onlypassword'])]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty(readable: true, writable: true, security: "object == user")]
    #[Groups(['user:read','user:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 255,nullable: true)]
    #[ApiProperty(readable: true, writable: true, security: "object == user")]
    #[Groups(['user:read','user:write'])]
    private ?string $unverified_email = null;

    #[ORM\Column]
    #[ApiProperty(writable: false)]
    #[Groups(['user:create','user:read'])]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $edited_at = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $email_verified_at = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $last_activity_timestamp = null;

    # TODO: should we have a shorter length limit for this? 
    #[ORM\Column(type: Types::TEXT, nullable: true, length: 65535)]
    #[Groups(['user:read','user:write'])]
    private $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read','user:write'])]
    private ?string $link = null;

    #[ORM\Column(type: Types::DATETIMETZ_MUTABLE)]
    private ?\DateTimeInterface $timezone = null;

    #[ORM\Column]
    #[Groups(['user:read','user:write'])]
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
    #[Groups(['user:read'])]
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
    #[Groups(['user:read'])]
    private Collection $feedEntries;

    /**
     * @var Collection<int, Interaction>
     */
    #[ORM\OneToMany(targetEntity: Interaction::class, mappedBy: 'user', orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $interactions;

    // this is managed in State/UserProfileProvider.php to get user permissions 
    private $loggedInUserAllowed;
    private $loggedInUserConnection;

    #[ORM\Column]
    #[Groups(['user:read','user:write'])]
    private ?bool $allow_dms = false;

    #[ORM\Column]
    #[Groups(['user:read','user:write'])]
    private ?bool $send_email_notifications = true;

    /**
     * @var Collection<int, Notification>
     */
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'user')]
    private Collection $notifications;

    /**
     * @var Collection<int, Quest>
     */
    #[ORM\ManyToMany(targetEntity: Quest::class, mappedBy: 'user')]
    private Collection $quests;

    public function __construct()
    {
        $this->loginTokens = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->feedEntries = new ArrayCollection();
        $this->interactions = new ArrayCollection();
        $this->loggedInUserConnection = array();
        $this->loggedInUserAllowed = $this->isPublic();
        $this->quests = new ArrayCollection();
    }

    #[ApiResource (writable: false)]
    #[Groups(['user:read'])]
    public function isLoggedInUserAllowed()
    {
        return $this->loggedInUserAllowed;
    }

    public function setLoggedInUserAllowed(bool $allowed): static
    {
        $this->loggedInUserAllowed = $allowed;
        return $this;
    }

    #[ApiResource (writable: false)]
    #[Groups(['user:read'])]
    public function getLoggedInUserConnection()
    {
        return $this->loggedInUserConnection;
    }

    public function setLoggedInUserConnection($connection)
    {
        $this->loggedInUserConnection = $connection;
        return $this;
    }

    #[ApiResource (writable: false)]
    #[Groups(['user:read'])]
    public function getMostRecentUpdate() {
      return $this->getFeedEntries()[0];
    }

    #[ApiResource (writable: false)]
    #[Groups(['user:read'])]
    public function getGravatarUrl(): string|null
    {
        if($this->email) {
          $url = 'https://www.gravatar.com/avatar/' . hash( 'sha256', strtolower( trim( $this->email))) . '?d=404&s=100&r=pg';
          $headers = @get_headers($url);
          if(!$headers || $headers[0] == 'HTTP/1.1 404 Not Found') {
            return null;
          } else {
            return $url;
          }
        } else {
          return null;
        }
    }

    #[ApiResource (writable: false)]
    #[Groups(['user:read'])]
    public function getIsATurtle (): ?bool {
      foreach ($this->getRoles() as $role) {
        if ($role == 'ROLE_TURTLE') {
          return true;
        }
      }
      return false;
    }

    #[Groups(['user:write'])]
    public function setIsATurtle ($turtleStatus) {
      $roles = $this->getRoles();
      if ($turtleStatus) {
        array_push($roles,'ROLE_TURTLE');
      } else {
        $i = array_search('ROLE_TURTLE', $roles);
        if ($i) {
          unset($roles[$i]);
        }
      }
      $this->setRoles($roles);
    }

    #[Groups(['user:write'])]
    public function setSpecificUserRole ($roleName,$add) {
      $roles = $this->getRoles();
      if ($add) {
        array_push($roles,$roleName);
      } else {
        $i = array_search($roleName, $roles);
        if ($i) {
          unset($roles[$i]);
        }
      }
      $this->setRoles($roles);
    }

    #[Groups(['user:read'])]
    public function getId(): ?int
    {
        return $this->id;
    }

    #[Groups(['user:read'])]
    public function getUsername(): ?string
    {
        return $this->username;
    }

    #[Groups(['user:write'])]
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
    #[Groups(['user:read'])]
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    #[Groups(['user:write'])]
    #[ApiResource (writable: false,readable:true)]
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
    #[ApiResource (writable: false)]
    #[Groups(['user:write'])]
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    #[Ignore]
    #[Groups(['user:write'])]
    #[ApiResource (writable: false, readable:false)]
    public function getPassword(): ?string
    {
        return $this->password;
    }

    #[Groups(['user:write'])]
    #[ApiResource (writable: true, readable:false)]
    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    #[Groups(['user:write'])]
    #[ApiResource (writable: true, readable:false)]
    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    #[Groups(['user:write'])]
    #[ApiResource (writable: true, readable:false)]
    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        $this->plainPassword = null;
    }

    #[Groups(['user:read'])]
    public function getEmail(): ?string
    {
        return $this->email;
    }

    #[Groups(['user:write'])]
    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    #[Groups(['user:write'])]
    public function getUnverifiedEmail(): ?string
    {
        return $this->unverified_email;
    }

    #[Groups(['user:write'])]
    public function setUnverifiedEmail($unverified_email): static
    {
        $this->unverified_email = $unverified_email;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getEditedAt(): ?\DateTimeImmutable
    {
        return $this->edited_at;
    }

    #[Groups(['user:write'])]
    public function setEditedAt(\DateTimeImmutable $edited_at): static
    {
        $this->edited_at = $edited_at;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getEmailVerifiedAt(): ?\DateTimeImmutable
    {
        return $this->email_verified_at;
    }

    #[Groups(['user:write'])]
    public function setEmailVerifiedAt(?\DateTimeImmutable $email_verified_at): static
    {
        $this->email_verified_at = $email_verified_at;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getLastActivityTimestamp(): ?\DateTimeImmutable
    {
        return $this->last_activity_timestamp;
    }

    #[Groups(['user:write'])]
    public function setLastActivityTimestamp(?\DateTimeImmutable $last_activity_timestamp): static
    {
        $this->last_activity_timestamp = $last_activity_timestamp;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getDescription()
    {
        return $this->description;
    }

    #[Groups(['user:write'])]
    public function setDescription($description): static
    {
        $this->description = $description;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getLink(): ?string
    {
        return $this->link;
    }

    #[Groups(['user:write'])]
    public function setLink(?string $link): static
    {
        $this->link = $link;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getTimezone(): ?\DateTimeInterface
    {
        return $this->timezone;
    }

    #[Groups(['user:write'])]
    public function setTimezone(\DateTimeInterface $timezone): static
    {
        $this->timezone = $timezone;

        return $this;
    }

    #[Groups(['user:read'])]
    public function isPublic(): ?bool
    {
        return $this->public;
    }

    #[Groups(['user:write'])]
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
    #[Groups(['user:read'])]
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
        $this->edited_at = new \DateTimeImmutable();
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

    #[Ignore]
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
    
    #[Groups(['user:read'])]
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
            if ($feedEntry->getUser() === $this) {
                $feedEntry->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Interaction>
     */
    
    #[Groups(['user:read'])]
    public function getInteractions(): Collection
    {
        return $this->interactions;
    }

    public function addInteraction(Interaction $interaction): static
    {
        if (!$this->interactions->contains($interaction)) {
            $this->interactions->add($interaction);
            $interaction->setUser($this);
        }

        return $this;
    }

    public function removeInteraction(Interaction $interaction): static
    {
        if ($this->interactions->removeElement($interaction)) {
            // set the owning side to null (unless already changed)
            if ($interaction->getUser() === $this) {
                $interaction->setUser(null);
            }
        }

        return $this;
    }

    #[Groups(['user:read'])]
    public function getAllowDms(): ?bool
    {
        return $this->allow_dms;
    }

    #[Groups(['user:write'])]
    public function setAllowDms(bool $allow_dms): static
    {
        $this->allow_dms = $allow_dms;
        return $this;
    }
    /**
     * @return Collection<int, Quest>
     */
    public function getQuests(): Collection
    {
        return $this->quests;
    }

    public function addQuest(Quest $quest): static
    {
        if (!$this->quests->contains($quest)) {
            $this->quests->add($quest);
            $quest->addUser($this);
        }

        return $this;
    }

    #[Groups(['user:read'])]
    public function getSendEmailNotifications(): ?bool
    {
        return $this->send_email_notifications;
    }

    #[Groups(['user:write'])]
    public function setSendEmailNotifications(bool $send_email_notifications): static
    {
        $this->send_email_notifications = $send_email_notifications;
        return $this;
    }

    public function removeQuest(Quest $quest): static
    {
        if ($this->quests->removeElement($quest)) {
            $quest->removeUser($this);
        }

        return $this;
    }
}
