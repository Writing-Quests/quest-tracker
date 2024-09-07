<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StaticController extends AbstractController {
    public function index(): BinaryFileResponse {
        $indexFile = $this->getParameter('kernel.project_dir') . '/../frontend/dist/index.html';
        $response = new BinaryFileResponse($indexFile);
        $response->headers->set('Content-Type', 'text/html');
        return $response;
    }
}
