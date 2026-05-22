<?php
$uriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$local   = preg_replace('#^/luminaphp#', '', $uriPath);

// Path traversal protection
if (str_contains($local, '..') || str_contains($local, '\\')) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$file    = __DIR__ . $local;

$mime = [
  'css'  => 'text/css; charset=UTF-8',
  'js'   => 'application/javascript; charset=UTF-8',
  'mjs'  => 'application/javascript; charset=UTF-8',
  'png'  => 'image/png',
  'jpg'  => 'image/jpeg',
  'jpeg' => 'image/jpeg',
  'gif'  => 'image/gif',
  'webp' => 'image/webp',
  'avif' => 'image/avif',
  'svg'  => 'image/svg+xml',
  'ico'  => 'image/x-icon',
  'woff' => 'font/woff',
  'woff2'=> 'font/woff2',
  'ttf'  => 'font/ttf',
  'json' => 'application/json',
  'map'  => 'application/json',
  'pdf'  => 'application/pdf',
  'mp4'  => 'video/mp4',
  'webm' => 'video/webm',
  'mp3'  => 'audio/mpeg',
];

$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

// Serve static assets directly — no bootstrap needed
if (is_file($file) && isset($mime[$ext])) {
  $mtime = filemtime($file);
  $etag  = '"' . dechex($mtime) . '-' . dechex(filesize($file)) . '"';

  header('Content-Type: ' . $mime[$ext]);
  header('X-Content-Type-Options: nosniff');
  header('ETag: ' . $etag);
  header('Last-Modified: ' . gmdate('D, d M Y H:i:s \G\M\T', $mtime));

  // Immutable fonts/images get a long TTL; JS/CSS get revalidation
  $immutable = in_array($ext, ['woff', 'woff2', 'ttf', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'ico'], true);
  $maxAge    = $immutable ? 31536000 : 3600;
  $directive = $immutable ? "public, max-age={$maxAge}, immutable" : "public, max-age={$maxAge}, must-revalidate";
  header('Cache-Control: ' . $directive);

  // Conditional GET — 304 if content unchanged
  $ifNoneMatch  = $_SERVER['HTTP_IF_NONE_MATCH']  ?? '';
  $ifModSince   = $_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '';
  if ($ifNoneMatch === $etag || ($ifNoneMatch === '' && strtotime($ifModSince) >= $mtime)) {
    http_response_code(304);
    exit;
  }

  readfile($file);
  exit;
}

// PHP request — bootstrap loads .env, session, headers, logging
require __DIR__ . '/index.php';
