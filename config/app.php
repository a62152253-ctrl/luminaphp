<?php

declare(strict_types=1);

return [
    'name'    => 'Lumina',
    'version' => '1.0.0',
    'env'     => $_ENV['APP_ENV'] ?? 'production',
    'debug'   => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'url'     => $_ENV['APP_URL'] ?? 'http://localhost',
    'timezone' => $_ENV['TZ'] ?? 'UTC',
    'locale'  => 'pl',

    'session' => [
        'lifetime'  => (int)($_ENV['SESSION_LIFETIME'] ?? 3600),
        'secure'    => filter_var($_ENV['SESSION_SECURE'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'httponly'  => filter_var($_ENV['SESSION_HTTPONLY'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'samesite'  => $_ENV['SESSION_SAMESITE'] ?? 'Strict',
        'name'      => 'lumina_session',
    ],

    'cors' => [
        'origins' => explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? ''),
        'methods' => explode(',', $_ENV['CORS_ALLOWED_METHODS'] ?? 'GET,POST'),
        'headers' => explode(',', $_ENV['CORS_ALLOWED_HEADERS'] ?? 'Content-Type,Authorization'),
    ],

    'security' => [
        'headers_enabled'    => filter_var($_ENV['SECURITY_HEADERS_ENABLED'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'csp'                => $_ENV['CONTENT_SECURITY_POLICY'] ?? "default-src 'self'",
        'x_frame_options'    => $_ENV['X_FRAME_OPTIONS'] ?? 'DENY',
        'enable_2fa'         => filter_var($_ENV['ENABLE_2FA'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'enable_csrf'        => filter_var($_ENV['ENABLE_CSRF_PROTECTION'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'enable_rate_limit'  => filter_var($_ENV['ENABLE_RATE_LIMITING'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'enable_req_signing' => filter_var($_ENV['ENABLE_REQUEST_SIGNING'] ?? false, FILTER_VALIDATE_BOOLEAN),
    ],

    'upload' => [
        'max_size'      => (int)($_ENV['UPLOAD_MAX_SIZE'] ?? 10485760),
        'allowed_types' => explode(',', $_ENV['UPLOAD_ALLOWED_TYPES'] ?? 'jpg,jpeg,png'),
        'temp_dir'      => $_ENV['UPLOAD_TEMP_DIR'] ?? sys_get_temp_dir(),
    ],

    'jwt' => [
        'secret'  => $_ENV['JWT_SECRET'] ?? '',
        'ttl'     => 3600,
        'refresh' => 86400,
    ],

    'admin' => [
        'email' => $_ENV['ADMIN_EMAIL'] ?? '',
    ],
];
