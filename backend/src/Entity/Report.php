<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Repository\ReportRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: ReportRepository::class)]
#[ORM\EntityListeners(["App\Listener\ReportListener"])]
#[ApiResource(
  operations: [
      new Get(),
      new Post(
        uriTemplate: '/report/new'
      ),
  ],
  security: "is_granted('ROLE_USER')",
)]

# TODO: I cannot, to save my life, get the ManyToOne user connection to work with ApiPlatform. Works when the reported_by comes in as a string, though. 

class Report
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $reviewed_at = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    private ?string $path = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[ApiProperty]
    private ?string $details = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    private ?string $reason = null;

    #[ORM\Column(length: 255)]
    private ?string $type = null;

    #[ORM\Column(type: 'ulid')]
    private ?Ulid $code = null;

    #[ORM\ManyToOne(inversedBy: 'reports')]
    private ?User $reported_by_user = null;

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

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;

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
        'path'=>$this->getPath(),
        'reason'=>$this->getReason(),
        'details'=>$this->getDetails(),
        'review_link'=>'http://frontend.quest-tracker.lndo.site/admin/report/' . $this->getCode()
      ];
    }
  }