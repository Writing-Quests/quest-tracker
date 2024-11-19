<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\QueryParameter;

use App\Repository\ReportRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: ReportRepository::class)]
#[ORM\EntityListeners(["App\Listener\ReportListener"])]
#[ApiResource(
  operations: [
      new Get(
        uriTemplate: '/report/{code}',
        security: "is_granted('ROLE_ADMIN')",
      ),
      new Post(
        uriTemplate: '/report/new'
      ),
      new Patch(
        uriTemplate: '/report/{code}',
        security: "is_granted('ROLE_ADMIN')",
     )
  ],
  security: "is_granted('ROLE_USER')",
)]

class Report
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: false, readable: false)]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $reviewed_at = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    private ?string $reported_identifier = null;

    #[ORM\Column(length: 1000, nullable: true)]
    #[ApiProperty]
    private ?string $details = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    private ?string $reason = null;

    #[ORM\Column(length: 255)]
    private ?string $type = null;

    #[ApiProperty(identifier: true, writable: false)]
    #[ORM\Column(type: 'ulid')]
    private ?Ulid $code = null;

    #[ORM\ManyToOne(inversedBy: 'reports')]
    private ?User $reported_by_user = null;


    #[ORM\Column(length: 1000, nullable: true)]
    private ?string $reviewAction = null;

    #[ORM\Column(nullable: true)]
    private ?bool $reviewComplete = null;

    #[ORM\ManyToOne]
    private ?User $reviewedByUser = null;

    #[ORM\Column]
    private array $snapshot = [];

    public function getId(): ?int
    {
        return $this->id;
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

    public function getReviewedAt(): ?\DateTimeInterface
    {
        return $this->reviewed_at;
    }

    public function setReviewedAt(?\DateTimeInterface $reviewed_at): static
    {
        $this->reviewed_at = $reviewed_at;

        return $this;
    }

    public function getReportedIdentifier(): ?string
    {
        return $this->reported_identifier;
    }

    public function setReportedIdentifier(string $reported_identifier): static
    {
        $this->reported_identifier = $reported_identifier;

        return $this;
    }

    public function getDetails(): ?string
    {
        return $this->details;
    }

    public function setDetails(?string $details): static
    {
        $this->details = htmlentities($details);

        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): static
    {
        $this->reason = htmlentities($reason);

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

    public function getCode(): ?Ulid
    {
        return $this->code;
    }

    public function setCode(Ulid $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getReportedByUser(): ?User
    {
        return $this->reported_by_user;
    }

    public function setReportedByUser(?User $reported_by_user): static
    {
        $this->reported_by_user = $reported_by_user;

        return $this;
    }

    public function makeEmailObject() {
      return [
        'reported_by'=>$this->getReportedByUser()->getUsername(),
        'reported_by_email'=>$this->getReportedByUser()->getEmail(),
        'created_at'=>$this->getCreatedAt()->format('F jS, Y \a\t g:i a \(e\)'),
        'type'=>$this->getType(),
        'reported_identifier'=>$this->getReportedIdentifier(),
        'reason'=>$this->getReason(),
        'details'=>$this->getDetails(),
        'review_link'=>'http://frontend.quest-tracker.lndo.site/admin/report/' . $this->getCode()
      ];
    }

    public function getReviewAction(): ?string
    {
        return $this->reviewAction;
    }

    public function setReviewAction(?string $reviewAction): static
    {
        $this->reviewAction = $reviewAction;

        return $this;
    }

    public function isReviewed(): ?bool
    {
        return $this->reviewComplete;
    }

    public function setReviewed(?bool $reviewComplete): static
    {
        $this->reviewComplete = $reviewComplete;

        return $this;
    }

    public function getReviewedByUser(): ?User
    {
        return $this->reviewedByUser;
    }

    public function setReviewedByUser(?User $reviewedByUser): static
    {
        $this->reviewedByUser = $reviewedByUser;

        return $this;
    }

    public function getSnapshot(): array
    {
        return $this->snapshot;
    }

    public function setSnapshot(array $snapshot): static
    {
        $this->snapshot = $snapshot;

        return $this;
    }
  }