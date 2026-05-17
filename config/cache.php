<?php

declare(strict_types=1);

return [
    'default' => $_ENV['CACHE_DRIVER'] ?? 'redis',

    'stores' => [
        'redis' => [
            'driver'   => 'redis',
            'host'     => $_ENV['REDIS_HOST'] ?? '127.0.0.1',
            'port'     => (int)($_ENV['REDIS_PORT'] ?? 6379),
            'password' => $_ENV['REDIS_PASSWORD'] ?? null,
            'database' => (int)($_ENV['REDIS_DB'] ?? 0),
            'prefix'   => 'lumina:',
            'timeout'  => 5,
        ],

        'file' => [
            'driver' => 'file',
            'path'   => __DIR__ . '/../storage/cache',
        ],

        'array' => [
            'driver'   => 'array',
            'serialize' => false,
        ],
    ],

    'ttl' => [
        'default'       => 3600,
        'short'         => 300,
        'long'          => 86400,
        'session'       => (int)($_ENV['SESSION_LIFETIME'] ?? 3600),
        'user_profile'  => 900,
        'anime_list'    => 1800,
        'recommendations' => 3600,
    ],

    'prefix' => 'lumina',
];
