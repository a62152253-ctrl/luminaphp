<?php
$uriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$local   = preg_replace('#^/luminaphp#', '', $uriPath);
$file    = __DIR__ . $local;

$mime = [
  'css'  => 'text/css; charset=UTF-8',
  'js'   => 'application/javascript; charset=UTF-8',
  'png'  => 'image/png',
  'jpg'  => 'image/jpeg',
  'jpeg' => 'image/jpeg',
  'gif'  => 'image/gif',
  'svg'  => 'image/svg+xml',
  'ico'  => 'image/x-icon',
  'woff' => 'font/woff',
  'woff2'=> 'font/woff2',
  'ttf'  => 'font/ttf',
  'json' => 'application/json',
  'map'  => 'application/json',
];

$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

// Serve static assets directly — no bootstrap needed
if (is_file($file) && isset($mime[$ext])) {
  header('Content-Type: ' . $mime[$ext]);
  readfile($file);
  exit;
}

// PHP request — bootstrap loads .env, session, headers, logging
require __DIR__ . '/index.php';
