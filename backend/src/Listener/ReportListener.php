<?php

namespace App\Listener;
use DateTime;
use App\Entity\Report;
# TODO: needs to send an email to reports@writingquests.org
class ReportListener
{
    public function prePersist(Report $report)
    {
        // Doctrine is including created_at in the initial INSERT statement, bypassing MySQL's default now :(
        $report->setCreatedAt(new DateTime());
    }

}
