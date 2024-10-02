<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Session\Session;

use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class LoginController extends AbstractController
{
    #[Route('/api/login', name: 'login', methods: ['POST'])]
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
          'session-cookie-params'=>session_get_cookie_params()
      ]);
    }

    #[Route('/api/logout', name: 'logout', methods: ['GET'])]
    public function logout(Security $security): JsonResponse
    {
        // logout the user in on the current firewall
        #$response = $security->logout();

        // you can also disable the csrf logout
        try {
          $response = $security->logout(false);
          return $this->json(true);
        } catch (\Exception $err) {
          return $this->json(['error'=>$err->getMessage()]);
        }
    }
  }
