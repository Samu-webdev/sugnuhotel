<?php

// Autorise le frontend Angular (servi sur un port différent, ex: http://localhost:4200)
// à appeler cette API. Ajustez "allowed_origins" avec l'URL de votre frontend en production.
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:4200'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    // false car on utilise des tokens Bearer (localStorage), pas des cookies de session
    'supports_credentials' => false,
];
