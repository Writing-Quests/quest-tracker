<?php
namespace App\Service;

use DateTime;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use App\Entity\User;
use DateTimeImmutable;

class MailerService {
  protected string $from_name;
  protected string $from_addr;
  protected string $currentDateTimeString;
  
  public function __construct(
    private MailerInterface $mailer
  )
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
      ->subject('[Questy] Verify Your Email Address')
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
    $this->mailer->send($msg);
  }
  
  public function changedEmailVerification ($user, $verifyEmailURL, $expiresAt) {
    $username = $user->getUsername();
    $timezone = $user->getTimezone();
    $email = $user->getUnverifiedEmail(); 
    $oldEmail = $user->getEmail();
    // FIXME: maybe; this currently shows in UTC. Appended that to the timestamp for clarity.
    $expirationString = $expiresAt->format('F jS, Y \a\t g:i a \(e\)');
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->subject('[Questy] Verify Your Email Address')
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
    $this->mailer->send($msg);
  }

  public function createPasswordReset ($user, $resetPasswordURL, $expiresAt) {
    $username = $user->getUsername();
    $timezone = $user->getTimezone();
    $expiresAt = (new DateTimeImmutable('now +24 hours'))->format('F jS, Y \a\t g:i a \(e\)');
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($user->getEmail())
      ->subject('[Questy] Password Reset Request')
      ->htmlTemplate('emails/passwordReset.html.twig')
      ->textTemplate('emails/passwordReset.txt.twig')
      ->context([
          'username'=>$username,
          'resetURL'=>$resetPasswordURL,
          'timezone'=>$timezone,
          'datetimerequested'=>$this->currentDateTimeString,
          'datetimeexpires'=>$expiresAt
        ]);
    $this->mailer->send($msg);
  }

  public function notificationPasswordChange ($email,$changeTime) {
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->from($this->from_addr)
      ->to($email)
      ->subject('[Questy] Your Password Change')
      ->htmlTemplate('emails/generic.html.twig')
      ->textTemplate('emails/generic.txt.twig')
      ->context([
          'data'=>"Your Questy password was changed on $changeTime. No further action is required."
        ]);
    $this->mailer->send($msg);
  }

  public function reportSubmitted ($report) {
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to('reports@writingquests.org')
      ->subject('[Questy] New User Safety Report')
      ->htmlTemplate('emails/report.html.twig')
      ->textTemplate('emails/report.txt.twig')
      ->context(['report'=>$report->makeEmailObject(),'admin'=>true]);
    $this->mailer->send($msg);
  }

  public function reportReceipt ($report) {
    $report_details = $report->makeEmailObject();
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($report_details['reported_by_email'])
      ->subject('[Questy] New User Report')
      ->htmlTemplate('emails/report.html.twig')
      ->textTemplate('emails/report.txt.twig')
      ->context(['report'=>$report_details,'admin'=>false]);
    $this->mailer->send($msg);
  }

  public function newConnectionRequest ($connectedUser,$initiatingUser,$connectionId) {
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($connectedUser->getEmail())
      ->subject('[Questy] New Friend Request')
      ->htmlTemplate('emails/newFriendRequest.html.twig')
      ->textTemplate('emails/newFriendRequest.txt.twig')
      ->context([
        'username'=>$initiatingUser->getUsername(),
        'connectionId'=>$connectionId
      ]);
    $this->mailer->send($msg);
  }

  public function newDmReceived ($message, $toUser, $fromUser, $threadLink) {
    $subject = $message->getMessageSubject();
    $email = $toUser->getEmail();
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->subject("[Questy DM] $subject")
      ->htmlTemplate('emails/newDmReceived.html.twig')
      ->textTemplate('emails/newDmReceived.txt.twig')
      ->context([
          'thread' => $threadLink,
          'message' => ($message->getMessageContent()),
          'user' => $fromUser->getUsername()
        ]);
    $this->mailer->send($msg);
  }

  public function genericEmailNotification ($email,$subject,$messageContent) {
    $msg = (new TemplatedEmail())
      ->from(new Address($this->from_addr, $this->from_name))
      ->to($email)
      ->from($this->from_addr)
      ->to($email)
      ->subject("[Questy] $subject")
      ->htmlTemplate('emails/generic.html.twig')
      ->textTemplate('emails/generic.txt.twig')
      ->context([
          'data'=>$messageContent
        ]);
    $this->mailer->send($msg);
  }
}
