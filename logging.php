<?php

declare(strict_types=1);

require_once __DIR__ . '/functions/http.php';

/**
 * Centralized logging configuration and helpers for Lumina.
 * Reads LOG_LEVEL, LOG_CHANNEL, LOG_SLACK_WEBHOOK_URL from environment.
 */

define('LOG_DIR', __DIR__ . '/storage/logs');

if (!is_dir(LOG_DIR) && !mkdir(LOG_DIR, 0750, true) && !is_dir(LOG_DIR)) {
    error_log('Unable to create log directory: ' . LOG_DIR);
}

$logLevel = strtolower($_ENV['LOG_LEVEL'] ?? 'warning');
$logChannel = $_ENV['LOG_CHANNEL'] ?? 'single';
$slackWebhook = $_ENV['LOG_SLACK_WEBHOOK_URL'] ?? '';
$sentryDsn = $_ENV['SENTRY_DSN'] ?? '';

// Optional Sentry integration
if ($sentryDsn && class_exists('Sentry\\Sentry')) {
    \Sentry\Sentry::init(['dsn' => $sentryDsn]);
}

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

if (!isset($levelPriority[$logLevel])) {
    $logLevel = 'warning';
}

function lumina_log(string $level, string $message, array $context = []): void
{
    global $logLevel, $logChannel, $slackWebhook, $levelPriority;

    $level = strtolower($level);
    if (!isset($levelPriority[$level])) {
        $level = 'warning';
    }

    if (($levelPriority[$level] ?? 0) < ($levelPriority[$logLevel] ?? 3)) {
        return;
    }

    $timestamp = date('Y-m-d H:i:s');
    $contextStr = empty($context) ? '' : ' ' . lumina_safe_json_encode($context);
    $line = "[{$timestamp}] [{$level}] {$message}{$contextStr}" . PHP_EOL;

    $file = match ($logChannel) {
        'daily'  => LOG_DIR . '/lumina-' . date('Y-m-d') . '.log',
        'single' => LOG_DIR . '/lumina.log',
        default  => LOG_DIR . '/lumina.log',
    };

    if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log(trim($line));
    }

    if (in_array($level, ['error', 'critical', 'alert', 'emergency'], true) && $slackWebhook) {
        lumina_notify_slack($slackWebhook, "[{$level}] {$message}", $context);
    }
}

function lumina_notify_slack(string $webhook, string $text, array $context = []): void
{
    if (!function_exists('curl_init')) {
        return;
    }

    $payload = lumina_safe_json_encode([
        'text' => '*Lumina Error* ' . $text,
        'attachments' => empty($context) ? [] : [[
            'color'  => 'danger',
            'text'   => lumina_safe_json_encode($context, JSON_PRETTY_PRINT),
            'footer' => gethostname(),
            'ts'     => time(),
        ]],
    ]);

    $ch = curl_init($webhook);
    if ($ch === false) {
        return;
    }
    
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
    ]);
    
    try {
        curl_exec($ch);
    } catch (Throwable $e) {
        // Silently fail - don't break the app if Slack notification fails
    } finally {
        curl_close($ch);
    }
}

// Handlers are registered in error-handling.php (loaded after this file) so they
// have access to render_error_page(). Do not register handlers here to avoid them
// being silently replaced.
