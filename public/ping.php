<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/functions/http.php';

lumina_json_response([
    'status' => 'ok',
    'ts' => time(),
]);
