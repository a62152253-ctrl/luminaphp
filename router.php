<?php

declare(strict_types=1);

require_once __DIR__ . '/functions/http.php';

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$local = lumina_normalize_request_path((string) ($_SERVER['REQUEST_URI'] ?? '/'));

if (str_contains($local, '..') || str_contains($local, '\\')) {
    lumina_json_response(['error' => 'Forbidden'], 403);
}

$file = __DIR__ . $local;

$mime = [
    'css' => 'text/css; charset=UTF-8',
    'js' => 'application/javascript; charset=UTF-8',
    'mjs' => 'application/javascript; charset=UTF-8',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'avif' => 'image/avif',
    'svg' => 'image/svg+xml',
    'ico' => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf' => 'font/ttf',
    'json' => 'application/json',
    'webmanifest' => 'application/manifest+json',
    'map' => 'application/json',
    'pdf' => 'application/pdf',
    'mp4' => 'video/mp4',
    'webm' => 'video/webm',
    'mp3' => 'audio/mpeg',
];

$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

if (in_array($method, ['GET', 'HEAD'], true) && is_file($file) && isset($mime[$ext])) {
    $root = realpath(__DIR__);
    $realFile = realpath($file);

    if ($root === false || $realFile === false) {
        lumina_json_response(['error' => 'Not Found'], 404);
    }

    if (!str_starts_with($realFile, $root . DIRECTORY_SEPARATOR) && $realFile !== $root) {
        lumina_json_response(['error' => 'Forbidden'], 403);
    }

    $mtime = filemtime($realFile);
    $size = filesize($realFile);
    if ($mtime === false || $size === false) {
        lumina_json_response(['error' => 'Not Found'], 404);
    }

    $etag = '"' . dechex($mtime) . '-' . dechex($size) . '"';

    header('Content-Type: ' . $mime[$ext]);
    header('X-Content-Type-Options: nosniff');
    header('ETag: ' . $etag);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s \G\M\T', $mtime));
    header('Content-Length: ' . $size);

    $immutable = in_array($ext, ['woff', 'woff2', 'ttf', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'ico'], true);
    $maxAge = $immutable ? 31536000 : 3600;
    $directive = $immutable
        ? "public, max-age={$maxAge}, immutable"
        : "public, max-age={$maxAge}, must-revalidate";
    header('Cache-Control: ' . $directive);

    $ifNoneMatch = (string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '');
    $ifModSince = (string) ($_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '');
    if ($ifNoneMatch === $etag || ($ifNoneMatch === '' && strtotime($ifModSince) >= $mtime)) {
        http_response_code(304);
        exit;
    }

    if ($method === 'HEAD') {
        exit;
    }

    readfile($realFile);
    exit;
}

require __DIR__ . '/index.php';
