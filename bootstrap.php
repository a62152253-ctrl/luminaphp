<?php

declare(strict_types=1);

// ─── 1. Load .env ────────────────────────────────────────────────────────────

(static function (): void {
    $envFile = __DIR__ . '/.env';
    if (!is_file($envFile)) {
        return;
    }
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);
        // Strip surrounding quotes
        if (strlen($value) >= 2 && $value[0] === '"' && $value[-1] === '"') {
            $value = stripslashes(substr($value, 1, -1));
        } elseif (strlen($value) >= 2 && $value[0] === "'" && $value[-1] === "'") {
            $value = substr($value, 1, -1);
        }
        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }
})();

// ─── 2. Timezone ─────────────────────────────────────────────────────────────

date_default_timezone_set($_ENV['TZ'] ?? 'UTC');

// ─── 3. Storage directories ───────────────────────────────────────────────────

foreach (['storage/logs', 'storage/cache', 'storage/uploads'] as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0750, true);
    }
}

// ─── 4. Logging & error handling ─────────────────────────────────────────────

require_once __DIR__ . '/logging.php';
require_once __DIR__ . '/error-handling.php';

// ─── 5. Session ───────────────────────────────────────────────────────────────

if (session_status() === PHP_SESSION_NONE) {
    $secure   = filter_var($_ENV['SESSION_SECURE']   ?? false, FILTER_VALIDATE_BOOLEAN);
    $httponly = filter_var($_ENV['SESSION_HTTPONLY']  ?? true,  FILTER_VALIDATE_BOOLEAN);
    $samesite = $_ENV['SESSION_SAMESITE'] ?? 'Lax';
    $lifetime = (int)($_ENV['SESSION_LIFETIME'] ?? 3600);

    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => $httponly,
        'samesite' => $samesite,
    ]);
    session_name('lumina_session');
    session_start();

    // Rotate session ID periodically
    if (!isset($_SESSION['_started'])) {
        $_SESSION['_started'] = time();
    } elseif (time() - $_SESSION['_started'] > $lifetime / 2) {
        session_regenerate_id(true);
        $_SESSION['_started'] = time();
    }
}

// ─── 6. Security headers ──────────────────────────────────────────────────────

if (filter_var($_ENV['SECURITY_HEADERS_ENABLED'] ?? true, FILTER_VALIDATE_BOOLEAN)) {
    $csp         = $_ENV['CONTENT_SECURITY_POLICY']
        ?? "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;";
    $frameOpts   = $_ENV['X_FRAME_OPTIONS'] ?? 'SAMEORIGIN';

    header('X-Content-Type-Options: nosniff');
    header('X-XSS-Protection: 1; mode=block');
    header("X-Frame-Options: {$frameOpts}");
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header("Content-Security-Policy: {$csp}");
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    header_remove('X-Powered-By');
}

// ─── 7. CORS ─────────────────────────────────────────────────────────────────

(static function (): void {
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = array_filter(array_map(
        'trim',
        explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? '')
    ));
    if ($origin && in_array($origin, $allowed, true)) {
        $methods = $_ENV['CORS_ALLOWED_METHODS'] ?? 'GET,POST,PUT,DELETE,OPTIONS';
        $headers = $_ENV['CORS_ALLOWED_HEADERS'] ?? 'Content-Type,Authorization,X-CSRF-Token';
        header("Access-Control-Allow-Origin: {$origin}");
        header("Access-Control-Allow-Methods: {$methods}");
        header("Access-Control-Allow-Headers: {$headers}");
        header('Access-Control-Allow-Credentials: true');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
})();

// ─── 8. Database helper ───────────────────────────────────────────────────────

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $host    = $_ENV['DB_HOST'] ?? 'localhost';
    $port    = $_ENV['DB_PORT'] ?? '3306';
    $name    = $_ENV['DB_NAME'] ?? '';
    $user    = $_ENV['DB_USER'] ?? 'root';
    $pass    = $_ENV['DB_PASS'] ?? '';
    $dsn     = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

// ─── 9. Config helper ─────────────────────────────────────────────────────────

function config(string $key): mixed
{
    static $configs = [];
    [$file, $subKey] = array_pad(explode('.', $key, 2), 2, null);
    if (!isset($configs[$file])) {
        $path = __DIR__ . "/config/{$file}.php";
        $configs[$file] = is_file($path) ? require $path : [];
    }
    if ($subKey === null) {
        return $configs[$file];
    }
    $parts  = explode('.', $subKey);
    $result = $configs[$file];
    foreach ($parts as $part) {
        if (!is_array($result) || !array_key_exists($part, $result)) {
            return null;
        }
        $result = $result[$part];
    }
    return $result;
}

lumina_log('debug', 'Bootstrap complete', ['env' => $_ENV['APP_ENV'] ?? 'production']);
