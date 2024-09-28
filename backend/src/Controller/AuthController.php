<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

use App\Entity\User;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class AuthController extends AbstractController
{
    #[Route('/api/auth/login', name: 'login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'message' => 'missing credentials',
                'loggedIn' => false,
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Automatically returns session in cookie
        return $this->json([
            'loggedIn' => true,
            'user' => $user->getUserIdentifier(),
        ]);
    }

    #[Route('/api/auth/logout', name: 'logout', methods: ['POST'])]
    public function logout(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null !== $user) {
            return $this->json([ 'loggedOut' => true ]);
        }
        return $this->json([ 'loggedOut' => false ]);
    }
}
