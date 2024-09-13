<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class WhoAmIController extends AbstractController
{
    #[Route('/api/whoami', name: 'whoami', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        if (null === $user) {
            return $this->json([
                'user' => null,
                'loggedIn' => false,
            ]);
        }

        return $this->json([
            'loggedIn' => true,
            'user' => $user->getUserIdentifier(),
        ]);
    }
}
