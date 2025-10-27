<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Link;
use App\Repository\MessageThreadRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Ulid;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;

use App\Listener\MessageThreadListener;
use App\State\UserInboxProvider;
use App\State\MessageThreadProvider;
use DateTime;
use DateTimeImmutable;

#[ORM\Entity(repositoryClass: MessageThreadRepository::class)]
#[ORM\EntityListeners(["App\Listener\MessageThreadListener"])]
#[ApiResource(
    operations: [
      new Get(
        uriTemplate: '/messages/details/{code}',
        normalizationContext: ['groups' => ['read']],
      ),
      new GetCollection(
        uriTemplate: '/messages/mine',
        provider: UserInboxProvider::class
      ),
      new Patch(
        uriTemplate: '/inbox/update/{code}',
        denormalizationContext: ['groups' => ['write']],
      )
    ],
)]
class MessageThread
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[ApiProperty(identifier: false, writable: false, readable: false)]
    #[Ignore]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'ulid')]
    #[Groups(['read','write'])]
    #[ApiProperty(identifier: true, writable: false)]
    private ?Ulid $code = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[Ignore]
    private ?Report $report = null;

    #[ORM\Column]
    #[Groups(['read','write'])]
    private ?int $sender_user_id = null;

    #[ORM\Column]
    #[Groups(['read','write'])]
    private ?int $receiving_user_id = null;

    #[ORM\Column]
    #[Ignore]
    private ?bool $in_recipient_inbox = true;

    #[ORM\Column]
    #[Ignore]
    private ?bool $in_sender_inbox = true;

    #[ApiProperty(readable: true)]
    private ?bool $in_my_inbox = true;

    #[ApiProperty(readable: true)]
    private ?bool $unread_for_me = false;

    #[ApiProperty(readable: true)]
    private ?bool $am_i_original_sender = null;

    #[ApiProperty(readable: true)]
    private $otherUserDetails = null;

    #[ApiProperty(readable: true)]
    private bool $replyAvailable = false;

    /**
     * @var Collection<int, DirectMessage>
     */
    #[ORM\OneToMany(targetEntity: DirectMessage::class, mappedBy: 'message_thread')]
    #[ORM\OrderBy(["sent_at" => "DESC"])]
    #[Ignore]
    private Collection $allMessages;

    #[ORM\Column(length: 255)]
    private ?string $subject = null;

    public function __construct()
    {
        $this->allMessages = new ArrayCollection();
    }

    #[Groups(['write'])]
    public function getId(): ?int
    {
        return $this->id;
    }

    #[Groups(['read','write'])]
    public function getCode(): ?Ulid
    {
        return $this->code;
    }

    public function setCode(Ulid $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getReport(): ?Report
    {
        return $this->report;
    }

    public function setReport(?Report $report): static
    {
        $this->report = $report;

        return $this;
    }

    public function getSenderUserId(): ?int
    {
        return $this->sender_user_id;
    }

    #[Groups(['write'])]
    public function setSenderUserId(int $sender_user_id): static
    {
        $this->sender_user_id = $sender_user_id;

        return $this;
    }

    public function getReceivingUserId(): ?int
    {
        return $this->receiving_user_id;
    }

    #[Groups(['write'])]
    public function setReceivingUserId(int $receiving_user_id): static
    {
        $this->receiving_user_id = $receiving_user_id;

        return $this;
    }

    public function isInRecipientInbox(): ?bool
    {
        return $this->in_recipient_inbox;
    }

    #[Groups(['write'])]
    public function setInRecipientInbox(bool $in_recipient_inbox): static
    {
        $this->in_recipient_inbox = $in_recipient_inbox;

        return $this;
    }

    public function isInSenderInbox(): ?bool
    {
        return $this->in_sender_inbox;
    }

    #[Groups(['write'])]
    public function setInSenderInbox(bool $in_sender_inbox): static
    {
        $this->in_sender_inbox = $in_sender_inbox;
        return $this;
    }

    #[ApiResource (writable: false)]
    public function getLastMessageSentAt () {
      return $this->getAllMessages()[0]->getSentAt();
    }

    #[ApiResource (writable: false)]
    public function isUnreadForMe () {
      return $this->unread_for_me;
    }

    public function setIsUnreadForMe (bool $read_status) {
      $this->unread_for_me = $read_status;
      return $this;
    }

    #[ApiResource (writable: false)]
    public function isInMyInbox () {
      return $this->in_my_inbox;
    }

    #[ApiResource (writable: false)]
    public function getAmIOriginalSender () {
      return $this->am_i_original_sender;
    }

    #[ApiResource (writable: false)]
    public function getMostRecentMessage () {
      return $this->getAllMessages()[0];
    }

    #[ApiResource (writable: false)]
    public function getOtherUserDetails () {
      return $this->otherUserDetails;
    }

    public function setOtherUserDetails ($other_user) {
      $this->otherUserDetails = $other_user;
      
      return $this;
    }

    public function setInMyInbox (int $myUserId): static {
      if ($myUserId == $this->sender_user_id) {
        // i am the OG sender
        $this->in_my_inbox = $this->in_sender_inbox;
        $this->am_i_original_sender = true;
      } else {
        // the other user is the original render; OG recipient is logged in
        $this->in_my_inbox = $this->in_recipient_inbox;
        $this->am_i_original_sender = false;
      }
      return $this;
    }

    /**
     * @return Collection<int, DirectMessage>
     */
    public function getAllMessages(): Collection
    {
        return $this->allMessages;
    }

    public function addAllMessage(DirectMessage $allMessage): static
    {
        if (!$this->allMessages->contains($allMessage)) {
            $this->allMessages->add($allMessage);
            $allMessage->setMessageThread($this);
        }

        return $this;
    }

    public function removeAllMessage(DirectMessage $allMessage): static
    {
        if ($this->allMessages->removeElement($allMessage)) {
            // set the owning side to null (unless already changed)
            if ($allMessage->getMessageThread() === $this) {
                $allMessage->setMessageThread(null);
            }
        }

        return $this;
    }

    public function getSubject(): ?string
    {
        return $this->subject;
    }

    #[Groups(['write'])]
    public function setSubject(string $subject): static
    {
        $this->subject = $subject;

        return $this;
    }

    public function getReplyAvailable () {
      return $this->replyAvailable;
    }

    #[Groups(['write'])]
    public function setReplyAvailable (bool $available): static 
    {
      $this->replyAvailable = $available;
      return $this;
    }
}
