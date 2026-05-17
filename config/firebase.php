<?php

declare(strict_types=1);

return [
    'project_id'     => $_ENV['FIREBASE_PROJECT_ID'] ?? '',
    'private_key'    => $_ENV['FIREBASE_PRIVATE_KEY'] ?? '',
    'client_email'   => $_ENV['FIREBASE_CLIENT_EMAIL'] ?? '',
    'storage_bucket' => $_ENV['FIREBASE_STORAGE_BUCKET'] ?? '',

    'database_url' => 'https://' . ($_ENV['FIREBASE_PROJECT_ID'] ?? '') . '-default-rtdb.firebaseio.com',

    'credentials_file' => $_ENV['FIREBASE_CREDENTIALS_FILE'] ?? null,

    'cache' => [
        'enabled' => true,
        'ttl'     => 3600,
    ],

    'auth' => [
        'session_cookie_name'     => '__session',
        'session_cookie_lifetime' => 3600,
        'verify_session_cookies'  => true,
    ],

    'storage' => [
        'bucket'    => $_ENV['FIREBASE_STORAGE_BUCKET'] ?? '',
        'max_size'  => 104857600,
        'cache_ttl' => 86400,
    ],
];
