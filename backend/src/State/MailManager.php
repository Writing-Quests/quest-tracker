<?php
namespace App\State;

use Symfony\Component\Mime\Email;

class MailManager {
  protected string $from;
  protected string $settingsURL;
  function __construct()
  {
    $this->from = 'Novel Quest <noreply@novelquest.org>';
    $this->settingsURL = 'http://frontend.quest-tracker.lndo.site/settings';
    return $this;
  }
  // TODO: look up the twig integration for email for formatting - https://symfony.com/doc/current/mailer.html#mailer-twig 
  // TODO: working with HTML to plain text; which is the more logical place to start? 
  public function sendEmailVerification ($username, $email, $verifyEmailURL, $expiresAt, $newAccount=false) {
    // used for both new accounts and resending a verification when the email hasn't changed
    // FIXME: maybe; this currently shows in UTC. Appended that to the timestamp for clarity.
    $expirationString = $expiresAt->format('F jS, Y \a\t g:i a \(e\)');
    $bodyHTML = '<p>';
    if ($newAccount) {
      // TODO: do we have a "welcome, new users?" sort of FAQ?
      $bodyHTML .= 'Welcome to the Novel Quests tracker!</b></p><p>Your user account (' . $username . ') has been created. ';
    }
    $bodyHTML .= 'Please verify your email address by clicking the link below, or copy/pasting it into the browser:</p><p><a href="'. $verifyEmailURL .'">'. $verifyEmailURL . '</a></p><p>This link will expire on ' . $expirationString . '. If this link as expired, you can request a new one. See <a href="'. $this->settingsURL .'">the "Settings" page</a> on the tracker site.</p><p>Happy creating!</p>';
    $msg = (new Email())
      ->from($this->from)
      ->to($email)
      ->subject('[Novel Quest] Verify Your Email Address')
      ->html($bodyHTML);
    return $msg;
  }
  
  public function changedEmailVerification ($username, $email, $oldEmail, $verifyEmailURL, $expiresAt) {
    // FIXME: maybe; this currently shows in UTC. Appended that to the timestamp for clarity.
    $expirationString = $expiresAt->format('F jS, Y \a\t g:i a \(e\)');
    $bodyHTML = '<p>The email address connected to your Novel Quests tracker account (' . $username . ') has been changed.</p><p>Please verify your email address by clicking the link below, or copy/pasting it into the browser:</p><p><a href="'. $verifyEmailURL .'">'. $verifyEmailURL . '</a></p><p>This link will expire on ' . $expirationString . '. If this link as expired, you can request a new one. See <a href="'. $this->settingsURL .'">the "Settings" page</a> on the tracker site.</p><p>Happy creating!</p>';
    $msg = (new Email())
      ->from($this->from)
      ->to($email)
      ->subject('[Novel Quest] Verify Your Email Address')
      ->html($bodyHTML); 
    return $msg;
  }

  public function createPasswordReset ($email, $resetPasswordURL) {
    $msg = (new Email())
      ->from($this->from)
      ->to($email)
      ->subject('[Novel Quest] Reset Your Password')
      ->text('Reset the password for your Novel Quest account by clicking the link below, or copy/pasting it into the browser:\n\n' . $resetPasswordURL . '\n\nThis link will expire in 24 hours. No changes will be able to your password unless you use this link.')
      ->html('<div><p>Reset the password for your Novel Quest account by clicking the link below, or copy/pasting it into the browser:<p>' . $resetPasswordURL . '<p>This link will expire in 24 hours. No changes will be able to your password unless you use this link.</p></div>'); 
    return $msg;
  }


  public function notificationPasswordChange ($email) {
    $msg = (new Email())
      ->from($this->from)
      ->to($email)
      ->subject('[Novel Quest] Your Password Change')
      ->text('This email is to let you know that your account password has been successfully changed.')
      ->html('<div><p>This email is to let you know that your account password has been successfully changed.</p></div>');
    return $msg;
  }
}
