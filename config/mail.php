<?php

declare(strict_types=1);

return [
    'driver'     => $_ENV['MAIL_DRIVER'] ?? 'smtp',
    'host'       => $_ENV['MAIL_HOST'] ?? 'smtp.mailtrap.io',
    'port'       => (int)($_ENV['MAIL_PORT'] ?? 587),
    'username'   => $_ENV['MAIL_USERNAME'] ?? '',
    'password'   => $_ENV['MAIL_PASSWORD'] ?? '',
    'encryption' => $_ENV['MAIL_ENCRYPTION'] ?? 'tls',

    'from' => [
        'address' => $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@lumina.app',
        'name'    => $_ENV['MAIL_FROM_NAME'] ?? 'Lumina',
    ],

    'templates' => [
        'welcome'          => 'emails/welcome',
        'reset_password'   => 'emails/reset_password',
        'verify_email'     => 'emails/verify_email',
        'notification'     => 'emails/notification',
        'premium_welcome'  => 'emails/premium_welcome',
    ],

    'queue' => [
        'enabled'  => filter_var($_ENV['MAIL_QUEUE_ENABLED'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'name'     => 'emails',
        'delay'    => 0,
        'retries'  => 3,
    ],
];
