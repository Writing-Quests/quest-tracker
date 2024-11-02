<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Repository\ReportRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

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
    
    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    private ?string $reported_by = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    private ?string $details = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    private ?string $reason = null;

    #[ORM\Column(length: 255)]
    private ?string $type = null;

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

    public function getReportedBy(): ?string
    {
        return $this->reported_by;
    }

    public function setReportedBy(?string $reported_by): static
    {
        $this->reported_by = $reported_by;

        return $this;
    }

    public function getDetails(): ?string
    {
        return $this->details;
    }

    public function setDetails(?string $details): static
    {
        $this->details = $details;

        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): static
    {
        $this->reason = $reason;

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
  }