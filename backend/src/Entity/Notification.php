<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;

// NOTE: bulk management of notifications via patch is handled in Controller/NotificationController.php
#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ApiResource(
    operations: [
      new GetCollection(
          order: ['created_at' => 'DESC'],
          uriTemplate: '/users/{id}/notifications',
          uriVariables: [
              'id' => new Link(
                  fromClass: User::class,
                  fromProperty: 'username',
                  toProperty: 'user',
                  securityObjectName: 'uriUser',
                  security: "uriUser == user",
              )
          ],
          security: "true", // Security is on the Link level for now
        )
    ],
    security: "is_granted('ROLE_ADMIN') or (object.getUser() == user)",
)]
class Notification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'notifications')]
    #[ApiProperty(writable: false, readable: false)]
    private ?User $user = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(length: 255)]
    private ?string $content = null;

    #[ORM\Column]
    private ?bool $user_read = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $notification_link = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $read_at = null;

    public function getId(): ?int
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function hasUserRead(): ?bool
    {
        return $this->user_read;
    }

    public function setUserRead(bool $user_read): static
    {
        $this->user_read = $user_read;

        return $this;
    }

    public function getNotificationLink(): ?string
    {
        return $this->notification_link;
    }

    public function setNotificationLink(?string $notification_link): static
    {
        $this->notification_link = $notification_link;

        return $this;
    }

    public function getReadAt(): ?\DateTimeImmutable
    {
        return $this->read_at;
    }

    public function setReadAt(?\DateTimeImmutable $read_at): static
    {
        $this->read_at = $read_at;

        return $this;
    }
}
