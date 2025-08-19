<?php

namespace App\Controller;

use App\Entity\Connection;
use App\Entity\FeedEntry;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\Doctrine\Orm\Paginator;

final class FeedEntryController extends AbstractController
{
  public function __construct(Security $security, EntityManagerInterface $entityManager) 
  {
    $this->security = $security;
    $this->entityManager = $entityManager;
  }

  
  #[Route('/api/feed', name: 'connection_feed', methods: ['GET'])]
  public function connection_feed(Request $request): JsonResponse|null
  {
    /* I'm building this to mimic the return we get from API Platform; when I solve the paginator problem,we would then be able to slip back into using that.
     * The two items we're recreating are: 
     * hydra:totalItems -> what it says on the tin
     * hydra:view, which contains the page information (in addition to @id and @type, whcih i'm not bothering with right now)
     *     @id -> current page
     *     @type -> the real one has "hydra:PartialCollectionView; I'm gonna us "fakeHydraCollectionView" in case we need to know
     *     hydra:first -> first page
     *     hydra:last -> last page
     *     hydra:next -> next page
     * 
     * I hate this beeteedubs, and I think I may even have an idea of what went wrong, but at least it stops blocking moving past it. - Ashes
    */
    try {
      $page = (int)$request->query->get('page');
    } catch (Exception $err) {
      $page = 1;
    }
    $user = $this->security->getUser();
    if (!$user) {
      return null;
    } else {
      $user_id = $user->getId();
      $mutual = $this->entityManager->getRepository(Connection::class)->getUserMutuals($user_id);
      $following = $this->entityManager->getRepository(Connection::class)->getUserFollowing($user_id);
      $feed_connections = [...$mutual,...$following];
      $buddy_ids = [];
      foreach ($feed_connections as $conn) {
        if ($conn["initiating_user_id"] != $user_id) {
          array_push($buddy_ids,$conn["initiating_user_id"]);
        } else {
          array_push($buddy_ids, $conn["connected_user_id"]);
        }
      }
      $feed_page = $this->entityManager->getRepository(FeedEntry::class)->getFullUserFeed($buddy_ids,$page);
      $manual_page_info = $this->entityManager->getRepository(FeedEntry::class)->getManualPageInfo($buddy_ids);
      $res = ['hydra:member' => $feed_page, 'hydra:totalItems' => $manual_page_info['totalItems']];
      if ($manual_page_info['pages'] > 1) {
        $this_url = "/api/feed?page=";
        $res['hydra:view'] = [
          '@id' => $this_url . $page,
          '@type' => 'fakeHydraCollectionView',
          'hydra:first' => $this_url . "1",
          'hydra:last' => $this_url . $manual_page_info['pages']
        ];
        if ((int)$page != $manual_page_info['pages']) {
          $res['hydra:view'] += ['hydra:next' => $this_url . (int)$page + 1];
        }
        if ((int)$page != 1) {
          $res['hydra:view'] += ['hydra:previous' => $this_url . (int)$page - 1];
        }
      }
      return $this->json($res);
    }
  }
}
