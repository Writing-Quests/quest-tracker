<?php

namespace App\Controller;

use DateTime;

use App\Entity\ProjectGoal;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AsController]
class ProjectGoalProgress extends AbstractController
{
    // Expects input in the format
    // [
    //  {
    //      date: "2024-11-01",
    //      action: "add",
    //      value: 5
    //  },
    //  {
    //      date: "2024-11-02",
    //      action: "replace",
    //      value: 1000,
    //  }
    // ]
    public function __invoke($data, Request $request): ProjectGoal
    {
        $goal = $data;
        if(!$goal->getStartDate() || !$goal->getEndDate()) {
            throw new BadRequestHttpException('start_date and end_date need to be set on the goal in order to modify the progress');
        }
        $body = json_decode($request->getContent(), true);
        if(!is_array($body)) {
            throw new BadRequestHttpException('malformed request body');
        }
        foreach($body as $op) {
            // Request validation
            // TODO: Is there any way to do this declaratively? That might be too much for just this one controller though...
            if(!isset($op['date']) or !isset($op['action']) or !isset($op['value'])) {
                throw new BadRequestHttpException('malformed request body: missing date, action, or value');
            }
            $date = DateTime::createFromFormat('Y-m-d|', $op['date']);
            if(!$date) {
                throw new BadRequestHttpException('malformed request body: bad date');
            }
            if(!($op['action'] == 'add' or $op['action'] == 'replace')) {
                throw new BadRequestHttpException('malformed request body: unknown action');
            }
            if(!is_numeric($op['value'])) {
                throw new BadRequestHttpException('malformed request body: bad value');
            }

            // Get the index of the progress array to modify
            $daysAfterEnd = (int)$goal->getEndDate()->diff($date)->format('%r%a');
            if($daysAfterEnd > 0) {
                throw new BadRequestHttpException('malformed request body: date is after the project end_date');
            }
            $arrayKey = (int)$goal->getStartDate()->diff($date)->format('%r%a');
            if($arrayKey < 0) {
                throw new BadRequestHttpException('malformed request body: date is before the project start_date');
            }

            // Update the progress array
            $newProgress = $goal->getProgress();
            if($op['action'] == 'add') {
                $newProgress[$arrayKey] = bcadd($newProgress[$arrayKey] ?? '0', (string)$op['value'], 2);
            } else if ($op['action'] == 'replace') {
                // No-op to make sure this is in the right format
                $newProgress[$arrayKey] = bcadd('0', (string)$op['value'], 2);
            }
            $goal->setProgress($newProgress);
        }
        return $goal;
    }
}
