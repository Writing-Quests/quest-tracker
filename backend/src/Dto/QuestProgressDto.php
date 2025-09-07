<?php

namespace App\Dto;

use App\Entity\Quest;
use App\Entity\User;
use App\Entity\ProgressEntry;
use Symfony\Component\Uid\Uuid;
use ApiPlatform\Metadata\ApiResource;

#[ApiResource(
    shortName: 'QuestProgress',
    uriTemplate: '/users/{username}/quests/{id}',
    read: false,
    provider: 'App\\State\\UserQuestProvider'
)]
final class QuestProgressDto
{
    public ?array $progressEntries;
    public ?Quest $quest;
    public ?string $total;
    public ?float $percent;
    public ?bool $completed;

    public function __construct()
    { }
}
