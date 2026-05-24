<?php

declare(strict_types=1);

if (!function_exists('lumina_env_bool')) {
    function lumina_env_bool(mixed $value, bool $default = false): bool
    {
        if ($value === null || $value === '') {
            return $default;
        }

        $parsed = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return $parsed ?? $default;
    }
}

if (!function_exists('lumina_is_https')) {
    function lumina_is_https(): bool
    {
        $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
        if (in_array($https, ['on', '1'], true)) {
            return true;
        }

        $forwardedProto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
        if (str_contains($forwardedProto, 'https')) {
            return true;
        }

        $requestScheme = strtolower((string) ($_SERVER['REQUEST_SCHEME'] ?? ''));
        if ($requestScheme === 'https') {
            return true;
        }

        return (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
    }
}

if (!function_exists('lumina_safe_json_encode')) {
    function lumina_safe_json_encode(mixed $value, int $flags = 0): string
    {
        $json = json_encode(
            $value,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | $flags
        );

        if (is_string($json)) {
            return $json;
        }

        $fallback = json_encode([
            'error' => 'JSON encoding failed',
            'reason' => json_last_error_msg(),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return is_string($fallback)
            ? $fallback
            : '{"error":"JSON encoding failed"}';
    }
}

if (!function_exists('lumina_json_response')) {
    function lumina_json_response(array $payload, int $status = 200, array $headers = []): never
    {
        if (!headers_sent()) {
            http_response_code($status);
            header('Content-Type: application/json; charset=utf-8');
            header('Cache-Control: no-store');
            header('X-Content-Type-Options: nosniff');

            foreach ($headers as $name => $value) {
                header($name . ': ' . $value);
            }
        }

        echo lumina_safe_json_encode($payload);
        exit;
    }
}

if (!function_exists('lumina_request_wants_json')) {
    function lumina_request_wants_json(): bool
    {
        $accept = strtolower((string) ($_SERVER['HTTP_ACCEPT'] ?? ''));
        $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
        $requestedWith = strtolower((string) ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''));
        $path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);

        return str_contains($accept, 'application/json')
            || str_contains($contentType, 'application/json')
            || $requestedWith === 'xmlhttprequest'
            || str_starts_with($path, '/api/')
            || str_starts_with($path, '/luminaphp/api/');
    }
}

if (!function_exists('lumina_parse_csv_env')) {
    function lumina_parse_csv_env(string $value): array
    {
        $items = array_map('trim', explode(',', $value));
        $items = array_filter($items, static fn (string $item): bool => $item !== '');

        return array_values(array_unique($items));
    }
}

if (!function_exists('lumina_normalize_request_path')) {
    function lumina_normalize_request_path(string $requestUri, string $basePath = '/luminaphp'): string
    {
        $path = (string) parse_url($requestUri, PHP_URL_PATH);
        $path = rawurldecode($path);

        if ($basePath !== '' && str_starts_with($path, $basePath)) {
            $path = substr($path, strlen($basePath));
        }

        $path = '/' . ltrim($path, '/');
        $path = preg_replace('#/+#', '/', $path) ?? '/';

        return $path !== '' ? $path : '/';
    }
}
