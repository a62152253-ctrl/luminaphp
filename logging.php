<?php

declare(strict_types=1);

/**
 * Centralized logging configuration and helpers for Lumina.
 * Reads LOG_LEVEL, LOG_CHANNEL, LOG_SLACK_WEBHOOK_URL from environment.
 */

define('LOG_DIR', __DIR__ . '/storage/logs');

if (!is_dir(LOG_DIR)) {
    mkdir(LOG_DIR, 0750, true);
}

$logLevel = strtolower($_ENV['LOG_LEVEL'] ?? 'warning');
$logChannel = $_ENV['LOG_CHANNEL'] ?? 'single';
$slackWebhook = $_ENV['LOG_SLACK_WEBHOOK_URL'] ?? '';
$sentryDsn = $_ENV['SENTRY_DSN'] ?? '';

$levelPriority = [
    'debug'     => 0,
    'info'      => 1,
    'notice'    => 2,
    'warning'   => 3,
    'error'     => 4,
    'critical'  => 5,
    'alert'     => 6,
    'emergency' => 7,
];

function lumina_log(string $level, string $message, array $context = []): void
{
    global $logLevel, $logChannel, $slackWebhook, $levelPriority;

    if (($levelPriority[$level] ?? 0) < ($levelPriority[$logLevel] ?? 3)) {
        return;
    }

    $timestamp = date('Y-m-d H:i:s');
    $contextStr = empty($context) ? '' : ' ' . json_encode($context, JSON_UNESCAPED_UNICODE);
    $line = "[{$timestamp}] [{$level}] {$message}{$contextStr}" . PHP_EOL;

    $file = match ($logChannel) {
        'daily'  => LOG_DIR . '/lumina-' . date('Y-m-d') . '.log',
        'single' => LOG_DIR . '/lumina.log',
        default  => LOG_DIR . '/lumina.log',
    };

    file_put_contents($file, $line, FILE_APPEND | LOCK_EX);

    if (in_array($level, ['error', 'critical', 'alert', 'emergency'], true) && $slackWebhook) {
        lumina_notify_slack($slackWebhook, "[{$level}] {$message}", $context);
    }
}

function lumina_notify_slack(string $webhook, string $text, array $context = []): void
{
    $payload = json_encode([
        'text' => '*Lumina Error* ' . $text,
        'attachments' => empty($context) ? [] : [[
            'color'  => 'danger',
            'text'   => json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            'footer' => gethostname(),
            'ts'     => time(),
        ]],
    ]);

    $ch = curl_init($webhook);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

set_error_handler(function (int $errno, string $errstr, string $errfile, int $errline): bool {
    $level = match ($errno) {
        E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR => 'error',
        E_WARNING, E_CORE_WARNING, E_COMPILE_WARNING, E_USER_WARNING => 'warning',
        E_NOTICE, E_USER_NOTICE, E_DEPRECATED, E_USER_DEPRECATED => 'notice',
        default => 'debug',
    };
    lumina_log($level, $errstr, ['file' => $errfile, 'line' => $errline, 'code' => $errno]);
    return false;
});

set_exception_handler(function (Throwable $e): void {
    lumina_log('critical', $e->getMessage(), [
        'exception' => get_class($e),
        'file'      => $e->getFile(),
        'line'      => $e->getLine(),
        'trace'     => $e->getTraceAsString(),
    ]);
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Internal Server Error']);
    }
    exit(1);
});
