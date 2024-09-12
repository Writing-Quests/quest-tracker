<?php

use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    if($context['APP_ENV'] === 'dev') {
        header('Access-Control-Allow-Origin: http://frontend.quest-tracker.lndo.site');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: POST, PUT, GET, DELETE');
        header('Access-Control-Allow-Credentials: true');
    }
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
