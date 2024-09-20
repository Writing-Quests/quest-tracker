<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\LoginToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;

class UserController extends AbstractController
{
    #[Route('/api/user/create/', name: 'register_user', methods: ['POST'])]
    public function index (Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer): JsonResponse
    {
        $resp = [
          'errors' => []
        ];
        $POST = $request->getPayload();
        $email = $POST->get('email');
        $username = $POST->get('username');
        $find_username = $entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
        if ($find_username) {
          $username_available = false;
          array_push($resp['errors'],['id'=>'usernameTaken', 'text'=>'Username is already in use.']);
        } else {
          $username_available = true;
        }
        $find_email = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($find_email) {
          $email_available = false;
          array_push($resp['errors'],['id'=>'emailTaken', 'text'=>'Email address is already in use.']);
        } else {
          $email_available = true;
        }
        if ($email_available && $username_available) {
          try {
            // everything is good, let's create the user
            $created = false;
            $createdAt = new \DateTimeImmutable();
            $userTimezone = new \DateTimeImmutable(null, new \DateTimeZone($POST->get('timezone')));
            $newUser = new User();
            $newUser->setUsername($username);
            $newUser->setEmail($email);
            $newUser->setUnverifiedEmail($email);
            $newUser->setCreatedAt($createdAt);
            $newUser->setTimezone($userTimezone);
            $hashedPassword = $passwordHasher->hashPassword(
                $newUser,
                $POST->get('password')
            );
            $newUser->setPassword($hashedPassword);
            $token = bin2hex(random_bytes(32));
            $verifyEmailToken = new LoginToken();
            $verifyEmailToken->setUser($newUser);
            $hashedToken = $passwordHasher->hashPassword(
              $newUser,
              $token
            );
            ($verifyEmailToken)
              ->setSecret($hashedToken)
              ->setCreatedAt($createdAt)
              ->setExpiresAt(new \DateTimeImmutable('now +24 hours'))
              ->setType('verify-email')
              ->setPayload($email);
            $verifyEmailURL = "http://frontend.quest-tracker.lndo.site/verify?e=$email&t=$token";
            $resp['url'] = $verifyEmailURL;
            $entityManager->persist($verifyEmailToken);
            $entityManager->persist($newUser);
            $entityManager->flush();
            $created = true;
            // TODO: set up the SMTP stuff for novelquests; using one of my mailers for testing right now.
            $email = (new Email())
              ->from('mailer@lfkwriters.com')
              ->to($email)
              ->subject('[Novel Quests] Verify Your Email Address')
              ->text('Welcome to the Novel Quests tracker!\n\nPlease verify your email address by clicking the link below, or copy/pasting it into the browser:\n\n' . $verifyEmailURL . '\n\nThis link will expire in 24 hours. Visit the Novel Quests website to request a new verification  link as needed.')
              ->html('<div><p>Welcome to the Novel Quests tracker!</p><p>Your account with the username ' . $username . ' has been created. Please verify your email address by clicking the link below, or copy/pasting it into your browser.<p>' . $verifyEmailURL . '<p>This link will expire in 24 hours.</p></div>'); // TODO: look up the twig integration for email for formatting
            $mailer->send($email);
          } catch (\Exception $err) {
            array_push($resp['errors'],['id'=> 'phpError', 'text'=>$err->getMessage()]);
          }
        } else {
          $created = false; 
        }
        $resp['created'] = $created;
        return $this->json($resp);
    }
}