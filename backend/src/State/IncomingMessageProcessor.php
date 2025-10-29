<?php

namespace App\State;

use App\Entity\MessageThread;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Mailer\MailerInterface;


class IncomingMessageProcessor implements ProcessorInterface
{
   public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
        private ProcessorInterface $removeProcessor,
        private TokenStorageInterface $token_storage,
        private EntityManagerInterface $entityManager,
        private RequestStack $requestStack,
        private MailerInterface $mailer
    )
    {
    }
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
      //$user = $this->token_storage->getToken()->getUser();
      if (!$data->getMessageThread()) {
        $threadSubject = $this->requestStack->getCurrentRequest()->getPayload()->get('subject');
        $thread = (new MessageThread)
          ->setSenderUserId($data->getFromUserId())
          ->setReceivingUserId($data->getToUserId())
          ->setSubject($threadSubject);
        $this->entityManager->persist($thread);
        $data->setMessageThread($thread);
      } else {
        $thread = $data->getMessageThread();
      }
      $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);
      // once a new message has been sent, drop it into everyone's inbox
      $thread->setInRecipientInbox(true);
      $thread->setInSenderInbox(true);
      $this->entityManager->flush();
      return $result;
    }
}
