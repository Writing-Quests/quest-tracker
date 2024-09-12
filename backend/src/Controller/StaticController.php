<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class StaticController extends AbstractController {
    public function index(): Response {
        $entrypoint_exists = file_exists(getcwd() . '/app/index.html');
        if ($entrypoint_exists) {
            return $this->render('index.html');
        } else {
            return new Response('Run <strong><code>lando npm run build</code></strong> to build the frontend code or access this app at the frontend URL.');
        }
    }
}
