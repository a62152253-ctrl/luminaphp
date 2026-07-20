<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$action = trim((string)($_POST['action'] ?? ''));

// ── Logout ──────────────────────────────────────────────────────────────────
if ($action === 'logout') {
    unset($_SESSION['_sa_auth'], $_SESSION['_sa_csrf']);
    session_regenerate_id(true);
    echo json_encode(['ok' => true]);
    exit;
}

// ── Login ───────────────────────────────────────────────────────────────────
if ($action === 'login') {
    $csrfInput = trim((string)($_POST['_csrf'] ?? ''));
    $csrfStored = $_SESSION['_sa_csrf'] ?? '';

    if ($csrfStored === '' || !hash_equals($csrfStored, $csrfInput)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Nieprawidłowy token CSRF.']);
        exit;
    }

    $username = (string)($_POST['username'] ?? '');
    $password = (string)($_POST['password'] ?? '');

    $cfg = require __DIR__ . '/../config/superadmin.php';

    $usernameMatch = hash_equals(
        $cfg['username_sha256'],
        hash('sha256', $username)
    );
    $passwordMatch = password_verify($password, $cfg['password_hash']);

    // Constant-time: always verify both to prevent timing attacks
    if (!$usernameMatch || !$passwordMatch) {
        // Artificial delay to slow brute-force
        usleep(random_int(200_000, 500_000));
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Nieprawidłowe dane logowania.']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['_sa_auth'] = hash('sha256', $cfg['username_sha256'] . session_id());
    unset($_SESSION['_sa_csrf']);

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action.']);
