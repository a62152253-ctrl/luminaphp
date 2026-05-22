<?php
/**
 * Lumina Bot — NLP API
 * - Proxies HuggingFace free Inference API for sentence embeddings (pl-PL support)
 * - Caches results in SQLite (no repeat calls for same text)
 * - Polish word frequency lookup from WordBase50k class
 *
 * Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
 * FREE tier — no API key required for community models
 */

declare(strict_types=1);

require_once __DIR__ . '/WordBase50k.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// Same-origin only
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host   = $_SERVER['HTTP_HOST'] ?? '';
if ($origin && parse_url($origin, PHP_URL_HOST) === $host) {
    header("Access-Control-Allow-Origin: $origin");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── SQLite setup (for embeddings only) ─────────────────────────────
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0750, true);
}
$dbPath = $dataDir . '/bot_cache.sqlite';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA journal_mode=WAL");
    $pdo->exec("CREATE TABLE IF NOT EXISTS embeddings (
        hash      TEXT PRIMARY KEY,
        text      TEXT,
        embedding TEXT NOT NULL,
        hits      INTEGER DEFAULT 0,
        created   INTEGER NOT NULL
    )");
} catch (Exception $e) {
    json_err('DB error: ' . $e->getMessage()); exit;
}

// ── WordBase50k setup ───────────────────────────────────────────────
$wordBase = new WordBase50k();
$wordBase->load();

// ── Router ────────────────────────────────────────────────────────
$action = $_GET['action'] ?? '';

match ($action) {
    'embed'          => actionEmbed($pdo),
    'embed_bulk'     => actionEmbedBulk($pdo),
    'wordfreq'       => actionWordFreq($wordBase),
    'wordfreq_bulk'  => actionWordFreqBulk($wordBase),
    'search'         => actionSearch($wordBase),
    'spell'          => actionSpell($wordBase),
    'corpus_stop'    => actionCorpusStop($wordBase),
    'lexicon'        => actionLexicon(),
    'app'            => actionApp(),
    'stats'          => actionStats($pdo, $wordBase),
    'cache_clear'    => actionCacheClear($pdo),
    default          => json_out(['error' => 'Unknown action',
        'available' => ['embed','embed_bulk','wordfreq','wordfreq_bulk','search','spell',
            'corpus_stop','lexicon','app','stats','cache_clear']])
};

// ── Actions ───────────────────────────────────────────────────────

function actionEmbed(PDO $pdo): void {
    $text = trim($_GET['text'] ?? '');
    if (!$text || mb_strlen($text) > 2000) {
        json_err(!$text ? 'Missing text' : 'Text too long (max 2000 chars)');
        return;
    }

    $hash = sha1($text);

    // Cache hit
    $stmt = $pdo->prepare("SELECT embedding FROM embeddings WHERE hash = ?");
    $stmt->execute([$hash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $pdo->prepare("UPDATE embeddings SET hits = hits + 1 WHERE hash = ?")->execute([$hash]);
        json_out(['embedding' => json_decode($row['embedding'], true), 'cached' => true]);
        return;
    }

    $embedding = callHuggingFace($text);
    if ($embedding === null) {
        json_out(['embedding' => null, 'error' => 'HuggingFace unavailable', 'cached' => false]);
        return;
    }

    $pdo->prepare("INSERT OR REPLACE INTO embeddings (hash, text, embedding, hits, created) VALUES (?,?,?,0,?)")
        ->execute([$hash, mb_substr($text, 0, 200), json_encode($embedding), time()]);

    json_out(['embedding' => $embedding, 'cached' => false]);
}

function actionEmbedBulk(PDO $pdo): void {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    $texts = $body['texts'] ?? [];

    if (!is_array($texts) || count($texts) > 50) {
        json_err('texts must be array, max 50'); return;
    }

    $results = [];
    foreach ($texts as $text) {
        $text = trim((string)$text);
        if (!$text) { $results[] = null; continue; }

        $hash = sha1($text);
        $stmt = $pdo->prepare("SELECT embedding FROM embeddings WHERE hash = ?");
        $stmt->execute([$hash]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $results[] = ['embedding' => json_decode($row['embedding'], true), 'cached' => true];
        } else {
            $emb = callHuggingFace($text);
            if ($emb !== null) {
                $pdo->prepare("INSERT OR REPLACE INTO embeddings (hash,text,embedding,hits,created) VALUES(?,?,?,0,?)")
                    ->execute([$hash, mb_substr($text,0,200), json_encode($emb), time()]);
                $results[] = ['embedding' => $emb, 'cached' => false];
            } else {
                $results[] = ['embedding' => null, 'error' => 'unavailable'];
            }
            usleep(120000); // 120ms between HF calls
        }
    }
    json_out(['results' => $results]);
}

function actionWordFreq(WordBase50k $wordBase): void {
    $word = mb_strtolower(trim($_GET['word'] ?? ''));
    if (!$word) { json_err('Missing word'); return; }
    $freq = $wordBase->getFrequency($word);
    json_out(['word' => $word, 'freq' => $freq, 'known' => $freq > 0]);
}

function actionSearch(WordBase50k $wordBase): void {
    $prefix = mb_strtolower(trim($_GET['prefix'] ?? ''));
    $limit  = min(30, max(1, (int)($_GET['limit'] ?? 20)));
    if (!$prefix) { json_out(['words' => []]); return; }
    $results = $wordBase->searchByPrefix($prefix, $limit);
    json_out(['words' => $results]);
}

function actionCorpusStop(WordBase50k $wordBase): void {
    $min = max(1, (int)($_GET['min'] ?? 100_000));
    $words = $wordBase->getWordsAboveFrequency($min);
    json_out(['min_freq' => $min, 'count' => count($words), 'words' => $words]);
}

function actionSpell(WordBase50k $wordBase): void {
    $text = trim($_GET['text'] ?? '');
    if (!$text) { json_err('Missing text'); return; }
    if (mb_strlen($text) > 500) { json_err('Text too long'); return; }
    $result = $wordBase->correctText($text);
    json_out($result);
}

function actionWordFreqBulk(WordBase50k $wordBase): void {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    $words = $body['words'] ?? [];
    if (!is_array($words) || count($words) > 40) {
        json_err('words must be array, max 40');
        return;
    }
    $out = [];
    foreach ($words as $w) {
        $w = mb_strtolower(trim((string)$w));
        $out[$w] = $w !== '' ? $wordBase->getFrequency($w) : 0;
    }
    json_out(['frequencies' => $out]);
}

function actionApp(): void {
    $path = __DIR__ . '/../data/bot-app.json';
    if (!is_readable($path)) {
        json_err('App knowledge not found');
        return;
    }
    $data = json_decode(file_get_contents($path), true);
    if (!is_array($data)) {
        json_err('Invalid app JSON');
        return;
    }
    header('Cache-Control: public, max-age=3600');
    json_out($data);
}

function actionLexicon(): void {
    $path = __DIR__ . '/../data/bot-words.json';
    if (!is_readable($path)) {
        json_err('Lexicon file not found');
        return;
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_err('Invalid lexicon JSON');
        return;
    }
    json_out($data);
}

function actionStats(PDO $pdo, WordBase50k $wordBase): void {
    $words = $wordBase->count();
    $embs  = (int)$pdo->query("SELECT COUNT(*) FROM embeddings")->fetchColumn();
    $hits  = (int)$pdo->query("SELECT COALESCE(SUM(hits),0) FROM embeddings")->fetchColumn();
    json_out([
        'words_in_db'        => $words,
        'wordbase_loaded'    => $wordBase->isLoaded(),
        'wordbase_path'      => basename($wordBase->getDataPath()),
        'cached_embeddings'  => $embs,
        'cache_hits'         => $hits,
        'model'              => 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    ]);
}

function actionCacheClear(PDO $pdo): void {
    $secret = $_ENV['BOT_ADMIN_SECRET'] ?? '';
    if (!$secret || ($_GET['secret'] ?? '') !== $secret) {
        http_response_code(403);
        json_out(['error' => 'Forbidden']);
        return;
    }
    $pdo->exec("DELETE FROM embeddings");
    json_out(['status' => 'cache cleared']);
}

// ── HuggingFace helper ────────────────────────────────────────────

function callHuggingFace(string $text): ?array {
    $url = 'https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
    $raw = null;

    if (!function_exists('curl_init')) {
        // Fallback: file_get_contents
        $ctx = stream_context_create(['http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\nUser-Agent: LuminaBot/2.0\r\n",
            'content' => json_encode(['inputs' => $text]),
            'timeout' => 25,
            'ignore_errors' => true,
        ]]);
        $raw = @file_get_contents($url, false, $ctx) ?: null;
    } else {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode(['inputs' => $text]),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'User-Agent: LuminaBot/2.0'],
            CURLOPT_TIMEOUT        => 25,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $response = curl_exec($ch);
        $code     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code !== 503) {
            $raw = $response ?: null; // 503 = model loading — leave $raw null
        }
    }

    if (!$raw) {
        return null;
    }
    $data = json_decode($raw, true);
    if (!$data || !is_array($data)) {
        return null;
    }

    // sentence-transformers returns [[vec]] for single input
    return (isset($data[0]) && is_array($data[0]))
        ? (is_array($data[0][0]) ? $data[0][0] : $data[0])
        : null;
}

// ── Helpers ───────────────────────────────────────────────────────

function json_out(array $data): void {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
function json_err(string $msg): void {
    http_response_code(400);
    echo json_encode(['error' => $msg]);
}
