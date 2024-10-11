<?php
namespace App\State;

use Symfony\Component\Mime\Email;

class MailManager {
  public function createFirstVerification ($username, $email, $verifyEmailURL) {
    // TODO: look up the twig integration for email for formatting
    try {
      $msg = (new Email())
        ->from('noreply@novelquest.org')
        ->to($email)
        ->subject('[Novel Quest] Verify Your Email Address')
        ->text('Welcome to the Novel Quests tracker!\n\nPlease verify your email address by clicking the link below, or copy/pasting it into the browser:\n\n' . $verifyEmailURL . '\n\nThis link will expire in 24 hours. Visit the Novel Quests website to request a new verification  link as needed.')
        ->html('<div><p>Welcome to the Novel Quests tracker!</p><p>Your account with the username ' . $username . ' has been created. Please verify your email address by clicking the link below, or copy/pasting it into your browser.<p>' . $verifyEmailURL . '<p>This link will expire in 24 hours.</p></div>'); 
      return $msg;
    } catch (\Exception $err) {
      // TODO: put the error somewhere
      return $err;
    }
  }
  
  public function createNewVerification ($username, $email, $oldEmail, $verifyEmailURL) {
    try {
      $msg = (new Email())
        ->from('noreply@novelquest.org')
        ->to($email)
        ->subject('[Novel Quest] Verify Your Email Address')
        ->text('The email address connected to your Novel Quests tracker account (' . $username . ') has been updated.\n\nPlease verify your email address by clicking the link below, or copy/pasting it into the browser:\n\n' . $verifyEmailURL . '\n\nThis link will expire in 24 hours. You can request a fresh verification link in your user profile.')
        ->html('<div><p>The email address connected to your Novel Quests tracker account (' . $username . ') has been updated.</p><p>Please verify your email address by clicking the link below, or copy/pasting it into the browser:</p><p>' . $verifyEmailURL . '</p><p>This link will expire in 24 hours. You can request a fresh verification link in your user profile.</p></div>'); 
      return $msg;
    } catch (\Exception $err) {
      // TODO: put the error somewhere
      return $err;
    }
  }

  public function createPasswordReset ($email, $resetPasswordURL) {
    try {
      $msg = (new Email())
        ->from('noreply@novelquest.org')
        ->to($email)
        ->subject('[Novel Quest] Reset Your Password')
        ->text('Reset the password for your Novel Quest account by clicking the link below, or copy/pasting it into the browser:\n\n' . $resetPasswordURL . '\n\nThis link will expire in 24 hours. No changes will be able to your password unless you use this link.')
        ->html('<div><p>Reset the password for your Novel Quest account by clicking the link below, or copy/pasting it into the browser:<p>' . $resetPasswordURL . '<p>This link will expire in 24 hours. No changes will be able to your password unless you use this link.</p></div>'); 
      return $msg;
    } catch (\Exception $err) {
      // TODO: put the error somewhere
      return $err;
    }
  }


  public function notificationPasswordChange ($email) {
    try {
      $msg = (new Email())
        ->from('noreply@novelquest.org')
        ->to($email)
        ->subject('[Novel Quest] Your Password Change')
        ->text('This email is to let you know that your account password has been successfully changed.')
        ->html('<div><p>This email is to let you know that your account password has been successfully changed.</p></div>');
      return $msg;
    } catch (\Exception $err) {
      // TODO: put the error somewhere
      return $err;
    }
  }
}
?>