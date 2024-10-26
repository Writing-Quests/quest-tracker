<?php

namespace App\Identifier;

use Exception;

use Sqids\Sqids;

use ApiPlatform\Api\UriVariableTransformerInterface;
use ApiPlatform\Exception\InvalidUriVariableException;

use App\Entity\Project;
use App\Entity\ProjectGoal;

//final class Sqid
//{
    //public int $value;

    //public function _construct(int $value) {
        //$this->value = $value;
    //}
//}

final class SqidsUriTransformer implements UriVariableTransformerInterface
{
    /**
     * Transforms a uri variable value.
     *
     * @param mixed $value   The uri variable value to transform
     * @param array $types   The guessed type behind the uri variable
     * @param array $context Options available to the transformer
     *
     * @throws InvalidUriVariableException Occurs when the uriVariable could not be transformed
     */
     public function transform($value, array $types, array $context = []): int
     {
         $className = $context['operation']->getUriVariables()['id']->getFromClass();
         if($className === Project::class) {
             $alphabet = $_ENV['SQIDS_ALPHABET_PROJECTS'];
         } else if ($className === ProjectGoal::class) {
             $alphabet = $_ENV['SQIDS_ALPHABET_PROJECT_GOALS'];
         }
         $sqids = new Sqids(minLength: 8, alphabet: $alphabet);
         try {
             $decoded = $sqids->decode($value);
             if(!isset($decoded[0])) {
                 throw new Exception('Invalid sqid');
             }
             return $decoded[0];
         } catch (Exception $e) {
             throw new InvaliduriVariableException($e->getMessage());
         }
     }

    /**
     * Checks whether the given uri variable is supported for transformation by this transformer.
     *
     * @param mixed $value   The uri variable value to transform
     * @param array $types   The types to which the data should be transformed
     * @param array $context Options available to the transformer
     */
    public function supportsTransformation($value, array $types, array $context = []): bool
    {
        try {
            $className = $context['operation']->getUriVariables()['id']->getFromClass();
            return ($className === Project::class || $className === ProjectGoal::class);
        } catch (Exception $e) {
            return false;
        }
    }
}
