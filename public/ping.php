<?php
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
echo json_encode(['status' => 'ok', 'ts' => time()]);
