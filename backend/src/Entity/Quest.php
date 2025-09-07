<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\QuestRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: QuestRepository::class)]
#[ApiResource(
    operations: [
        new Get(uriTemplate: '/quests/{id}'),
        new GetCollection()
    ]
)]
class Quest
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $start_date = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $end_date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $goal_type = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $goal_units = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 14, scale: 2, nullable: true)]
    private ?string $goal_amount = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'quests')]
    private Collection $user;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $title = null;

    public function __construct()
    {
        $this->user = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function setId(Uuid $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getStartDate(): ?\DateTimeImmutable
    {
        return $this->start_date;
    }

    public function setStartDate(?\DateTimeImmutable $start_date): static
    {
        $this->start_date = $start_date;

        return $this;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->end_date->setTime(23, 59, 59);
    }

    public function setEndDate(?\DateTimeImmutable $end_date): static
    {
        $this->end_date = $end_date->setTime(23, 59, 59);

        return $this;
    }

    public function getGoalType(): ?string
    {
        return $this->goal_type;
    }

    public function setGoalType(?string $goal_type): static
    {
        $this->goal_type = $goal_type;

        return $this;
    }

    public function getGoalUnits(): ?string
    {
        return $this->goal_units;
    }

    public function setGoalUnits(?string $goal_units): static
    {
        $this->goal_units = $goal_units;

        return $this;
    }

    public function getGoalAmount(): ?string
    {
        return $this->goal_amount;
    }

    public function setGoalAmount(?string $goal_amount): static
    {
        $this->goal_amount = $goal_amount;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getUser(): Collection
    {
        return $this->user;
    }

    public function addUser(User $user): static
    {
        if (!$this->user->contains($user)) {
            $this->user->add($user);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        $this->user->removeElement($user);

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }
}
