<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Link;

use Symfony\Component\Serializer\Annotation\Groups;

use App\Listener\DirectMessageListener;

use App\Entity\MessageThread;
use App\State\MessageThreadProvider;
use App\State\IncomingMessageProcessor;

use App\Repository\DirectMessageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DirectMessageRepository::class)]
#[ORM\EntityListeners(["App\Listener\DirectMessageListener"])]
#[ApiResource(
  operations: [
    new Get(
      uriTemplate: '/messages/read/{code}',
      provider: MessageThreadProvider::class,
      uriVariables: [
        'code' => new Link(
            fromClass: MessageThread::class,
            fromProperty: 'code',
            toProperty: 'message_thread',
            securityObjectName: 'uriThread'
            // TODO: get something on the thread that tells us who the users who can access it is
        )
      ],
      security: "is_granted('ROLE_USER')"
    ),
    new Post(
      uriTemplate: '/messages/send',
      processor: IncomingMessageProcessor::class,
      denormalizationContext: ['groups' => ['write']],
    ),
    new Patch(
      uriTemplate: '/messages/update/{id}',
      denormalizationContext: ['groups' => ['write']],
    )
  ]
)]
class DirectMessage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: true)]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['read','write'])]
    private ?int  $to_user_id;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['read','write'])]
    private ?int $from_user_id;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['read','write'])]
    private ?string $content = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['read','write'])]
    private ?\DateTimeImmutable $seen_at = null;

    #[ORM\Column]
    #[Groups(['read','write'])]
    private ?\DateTimeImmutable $sent_at = null;

    #[ORM\ManyToOne(inversedBy: 'allMessages')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty]
    #[Groups(['write'])]
    private ?MessageThread $message_thread = null;

    #[Groups(['read','write'])]
    private $sent_by_me = false; // false until proven true

    #[ApiResource (writable: false)]
    public function getSentByMe () {
      return $this->sent_by_me;
    }

    #[Groups(['write'])]
    public function setSentByMe ($user) {
      $this->sent_by_me = ($user->getId() === $this->from_user_id);
      return $this;
    }

    #[Groups(['read','write'])]
    public function getId(): ?int
    {
        return $this->id;
    }
    
    
    #[Groups(['write'])]
    public function setId(int $id): void
    {
        $this->id = $id;
    }

    #[Groups(['read','write'])]
    public function getToUserId(): ?int {
      return $this->to_user_id;
    }

    #[Groups(['write'])]
    public function setToUserId(int $user_id): static {
      $this->to_user_id = $user_id;
      return $this;
    }

    #[Groups(['read','write'])]
    public function getFromUserId(): ?int {
      return $this->from_user_id;
    }

    #[Groups(['write'])]
    public function setFromUserId(int $user_id): static {
      $this->from_user_id = $user_id;
      return $this;
    }

    #[Groups(['read','write'])]
    public function getMessageContent(): ?string
    {
        return $this->content;
    }

    #[Groups(['write'])]
    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    #[Groups(['read','write'])]
    public function getSeenAt(): ?\DateTimeImmutable
    {
        return $this->seen_at;
    }

    #[Groups(['write'])]
    public function setSeenAt(?\DateTimeImmutable $seen_at): static
    {
        $this->seen_at = $seen_at;
        return $this;
    }

    #[Groups(['read','write'])]
    public function getSentAt(): ?\DateTimeImmutable
    {
        return $this->sent_at;
    }

    #[Groups(['write'])]
    public function setSentAt(\DateTimeImmutable $sent_at): static
    {
        $this->sent_at = $sent_at;

        return $this;
    }

    #[Groups(['read','write'])]
    public function getMessageThread(): ?MessageThread
    {
        return $this->message_thread;
    }

    #[Groups(['write'])]
    public function setMessageThread(?MessageThread $message_thread): static
    {
        $this->message_thread = $message_thread;

        return $this;
    }

    #[Groups(['read','write'])]
    public function getMessageSubject(): ?string {
      return $this->getMessageThread()->getSubject();
    }

    #[Groups(['read','write'])]
    public function getMessageCode(): ?string {
      return $this->getMessageThread()->getCode();
    }
}
