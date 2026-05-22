<?php

declare(strict_types=1);

/**
 * Centralised error and exception handling for Lumina.
 * Include this file once at the application bootstrap (index.php).
 */

$appDebug = filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN);
$appEnv   = $_ENV['APP_ENV'] ?? 'production';

ini_set('display_errors', $appDebug ? '1' : '0');
ini_set('display_startup_errors', $appDebug ? '1' : '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/storage/logs/error.log');
error_reporting(E_ALL);

if (function_exists('lumina_log')) {
    set_error_handler(function (int $errno, string $errstr, string $errfile, int $errline): bool {
        if (!($errno & error_reporting())) {
            return false;
        }
        $level = match (true) {
            in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true) => 'error',
            in_array($errno, [E_WARNING, E_CORE_WARNING, E_COMPILE_WARNING, E_USER_WARNING], true) => 'warning',
            default => 'notice',
        };
        lumina_log($level, $errstr, ['file' => $errfile, 'line' => $errline]);
        return $level !== 'notice';
    });

    set_exception_handler(function (Throwable $e) use ($appDebug): void {
        lumina_log('critical', $e->getMessage(), [
            'exception' => get_class($e),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
            'trace'     => $e->getTraceAsString(),
        ]);
        render_error_page(500, $appDebug ? $e : null);
    });
}

register_shutdown_function(function () use ($appDebug): void {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (function_exists('lumina_log')) {
            lumina_log('emergency', $error['message'], [
                'type' => $error['type'],
                'file' => $error['file'],
                'line' => $error['line'],
            ]);
        }
        render_error_page(500, null);
    }
});

function render_error_page(int $code, ?Throwable $e = null): void
{
    if (headers_sent()) {
        return;
    }
    http_response_code($code);
    
    // Security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 0');
    header('Referrer-Policy: strict-origin-when-cross-origin');

    $isJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
           || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json');

    if ($isJson) {
        header('Content-Type: application/json; charset=utf-8');
        $body = ['error' => http_response_phrase($code), 'status' => $code];
        if ($e) {
            $body['message'] = $e->getMessage();
            $body['trace']   = $e->getTrace();
        }
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        exit;
    }

    $messages = [
        400 => 'Bad Request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Page Not Found',
        429 => 'Too Many Requests',
        500 => 'Internal Server Error',
    ];

    $title = $messages[$code] ?? 'Error';
    $detail = $e ? htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8') : '';

    echo <<<HTML
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Lumina — {$title}</title>
        <style>
            body { font-family: system-ui, sans-serif; background: #0f0f1a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; max-width: 480px; padding: 2rem; }
            h1 { font-size: 5rem; margin: 0; color: #7c3aed; }
            h2 { font-size: 1.5rem; margin: .5rem 0 1rem; }
            p { color: #94a3b8; }
            a { color: #7c3aed; }
        </style>
    </head>
    <body>
        <div class="box">
            <h1>{$code}</h1>
            <h2>{$title}</h2>
            <p>{$detail}</p>
            <p><a href="/">Back to Home</a></p>
        </div>
    </body>
    </html>
    HTML;

    exit;
}

function http_response_phrase(int $code): string
{
    return match ($code) {
        400 => 'Bad Request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Not Found',
        422 => 'Unprocessable Entity',
        429 => 'Too Many Requests',
        500 => 'Internal Server Error',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        default => 'Error',
    };
}
