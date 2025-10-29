<?php

namespace App\Entity;

use App\Repository\LoginTokenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactory;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiSubresource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model;
use ApiPlatform\Metadata\QueryParameter;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;

use App\Controller\VerificationController;
use App\Controller\LoginTokenController;

#[ORM\Entity(repositoryClass: LoginTokenRepository::class)]
#[ORM\EntityListeners(["App\Listener\LoginTokenListener"])]
#[ApiResource(
  operations: [
    new Get(
      uriTemplate: '/verify/{secret}',
      uriVariables: [
        'secret' => new Link(fromClass: LoginToken::class)
      ],
      parameters: [
        'email' => new QueryParameter(description: 'The email address associated with the token'),
        'type' => new QueryParameter(description: 'The type of token being verified')
      ],
      normalizationContext: ['groups' => ['user:read']],
      controller: VerificationController:: class,
      read: false
    ),
    new Post(
      uriTemplate: '/verify/create',
      denormalizationContext: ['groups' => ['write']],
      controller: LoginTokenController::class,
      read: false
    )
  ],
)]
class LoginToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: true)]
    #[Groups(['user:read', 'write'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    #[Groups(['user:read','write'])]
    private ?string $secret = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['user:read','write'])]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['user:read','write'])]
    private ?\DateTimeImmutable $expires_at = null;

    #[ORM\ManyToOne(inversedBy: 'loginTokens')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty]
    #[Groups(['user:read','write'])]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    #[Groups(['user:read','write'])]
    private ?string $type = null;

    #[ORM\Column(type: Types::BLOB)]
    #[ApiProperty]
    #[Groups(['user:read','write'])]
    private $payload;

    #[Groups(['user:read'])]
    public function getId(): ?int
    {
        return $this->id;
    }

    #[Groups(['user:read'])]
    public function getVerificationUrl (): string {
      // TODO: Have this autodetect or grab from consts
      $type = ($this->type == 'verify-email') ? 'verify' : 'resetform';
      return 'http://questy.writingquests.org/' . $type . '?e=' . $this->payload . '&t=' . $this->secret;
    }

    #[Groups(['user:read'])]
    public function getSecret(): ?string
    {
        return $this->secret;
    }

    public function verifySecret(string $plaintext): ?bool
    {
      return $this->secret == $plaintext;
    }

    public function setSecret(string $secret): static
    {
        $this->secret = $secret;
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
    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expires_at;
    }

    public function setExpiresAt(\DateTimeImmutable $expires_at): static
    {
        $this->expires_at = $expires_at;

        return $this;
    }

    #[Groups(['user:read'])]
    #[ApiProperty]
    public function isTokenExpired (): bool 
    {
      $verifyTime = new \DateTimeImmutable();
      return $verifyTime > ($this->getExpiresAt());
    }

    #[Groups(['user:read'])]
    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getType(): ?string
    {
        return $this->type;
    }

    #[Groups(['write'])]
    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    #[Groups(['user:read'])]
    public function getPayload()
    {
        return $this->payload;
    }

    #[Groups(['write'])]
    public function setPayload($payload): static
    {
        
        $this->payload = $payload;

        return $this;
    }
}
