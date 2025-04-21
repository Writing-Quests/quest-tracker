<?php
namespace App\Service;

use DateTime;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;
use App\Entity\User;
use DateTimeImmutable;

class MailerService {
  protected string $from_name;
  protected string $from_addr;
  protected string $currentDateTimeString;
  public function __construct()
  {
      $this->from_name = 'Writing Quests';
      $this->from_addr = 'no-reply@writingquests.org';
      $this->currentDateTimeString = (new DateTimeImmutable())->format('F jS, Y \a\t g:i a \(e\)');
      return $this;
  }

  public function sendEmailVerification ($user, $email, $verifyEmailURL, $expiresAt, $newAccount=false) {
    // used for both new accounts and resending a verification when the email hasn't changed
    $username = $user->getUsername();
    $timezone = $user->getTimezone();
    // FIXME: maybe; this currently shows in UTC. Appended that to the timestamp for clarity.
    $expirationString = $expiresAt->format('F jS, Y \a\t g:i a \(e\)');
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->subject('[Questy Notification] Verify Your Email Address')
      ->htmlTemplate('emails/verifyEmail.html.twig')
      ->textTemplate('emails/verifyEmail.txt.twig')
      ->context([
          'username'=>$username,
          'verifyEmailURL'=>$verifyEmailURL,
          'datetimerequested'=>$this->currentDateTimeString,
          'datetimerexpires'=>$expirationString,
          'newaccount'=>$newAccount,
          'emailchange'=>false
        ]);
    return $msg;
  }
  
  public function changedEmailVerification ($user, $email, $oldEmail, $verifyEmailURL, $expiresAt) {
    $username = $user->getUsername();
    $timezone = $user->getTimezone();
    // FIXME: maybe; this currently shows in UTC. Appended that to the timestamp for clarity.
    $expirationString = $expiresAt->format('F jS, Y \a\t g:i a \(e\)');
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->subject('[Questy Notification] Verify Your Email Address')
      ->htmlTemplate('emails/verifyEmail.html.twig')
      ->textTemplate('emails/verifyEmail.txt.twig')
      ->context([
          'username'=>$username,
          'verifyEmailURL'=>$verifyEmailURL,
          'timezone'=>$timezone,
          'datetimerequested'=>$this->currentDateTimeString,
          'datetimerexpires'=>$expirationString,
          'newaccount'=>false,
          'emailchange'=>true,
          'newemail'=>$email,
          'oldemail'=>$oldEmail
        ]);
    return $msg;
  }

  public function createPasswordReset ($user, $email, $resetPasswordURL) {
    $username = $user->getUsername();
    $timezone = $user->getTimezone();
    $expiresAt = (new DateTimeImmutable('now +24 hours'))->format('F jS, Y \a\t g:i a \(e\)');
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->subject('[Questy Notification] Password Reset Request')
      ->htmlTemplate('emails/passwordReset.html.twig')
      ->textTemplate('emails/passwordReset.txt.twig')
      ->context([
          'username'=>$username,
          'resetURL'=>$resetPasswordURL,
          'timezone'=>$timezone,
          'datetimerequested'=>$this->currentDateTimeString,
          'datetimeexpires'=>$expiresAt
        ]);
    return $msg;
  }

  public function notificationPasswordChange ($email) {
    $msg = (new Email())
      ->from($this->from_addr)
      ->to($email)
      ->subject('[Writing Quests] Your Password Change')
      ->text('This email is to let you know that your account password has been successfully changed.')
      ->html('<div><p>This email is to let you know that your account password has been successfully changed.</p></div>');
    return $msg;
  }

  public function reportSubmitted ($report) {
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to('reports@writingquests.org')
      ->subject('[Questy Notification] New User Safety Report')
      ->htmlTemplate('emails/report.html.twig')
      ->textTemplate('emails/report.txt.twig')
      ->context(['report'=>$report->makeEmailObject(),'admin'=>true]);
    return $msg;
  }

  public function reportReceipt ($report) {
    $report_details = $report->makeEmailObject();
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($report_details['reported_by_email'])
      ->subject('[Writing Quests] New User Report')
      ->htmlTemplate('emails/report.html.twig')
      ->textTemplate('emails/report.txt.twig')
      ->context(['report'=>$report_details,'admin'=>false]);
    return $msg;
  }

  public function newConnectionRequest ($connectedUser,$initiatingUser,$connectionId) {
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($connectedUser->getEmail())
      ->subject('[Questy Notification] New Friend Request')
      ->htmlTemplate('emails/newFriendRequest.html.twig')
      ->textTemplate('emails/newFriendRequest.txt.twig')
      ->context([
        'username'=>$initiatingUser->getUsername(),
        'connectionId'=>$connectionId
      ]);
    return $msg;
  }
}
