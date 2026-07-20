<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

/**
 * =========================================================
 * Lumina — Optimized Front Controller
 * Faster, cleaner, safer, easier to maintain
 * =========================================================
 */

/*
|--------------------------------------------------------------------------
| BASIC CONFIG
|--------------------------------------------------------------------------
*/

const APP_NAME = 'Lumina';

const VALID_PAGES = [
    'home',
    'explore',
    'business',
    'choice',
    'admin',
    'auth',
    'booking',
    'services',
    'employees',
    'gallery',
    'setup',
    'dashboard',
    'profile',
    'reviews',
    'offers',
    'notifications',
    'favorites',
    'map',
    'chat',
    'loyalty',
    'invoice',
    'referral',
    'marketplace',
    'superadmin'
];

const NO_FOOTER_PAGES = [
    'auth',
    'setup',
    'admin',
    'superadmin',
    'employees',
    'services',
    'dashboard',
    'booking'
];

/*
|--------------------------------------------------------------------------
| PAGE DETECTION
|--------------------------------------------------------------------------
*/

$page = $_GET['page'] ?? $_GET['url'] ?? 'home';
$page = trim((string)$page, '/');

if (!in_array($page, VALID_PAGES, true)) {
    http_response_code(404);
    $page = 'home';
}

$bizId     = trim((string)($_GET['id'] ?? ''));
$activeCat = trim((string)($_GET['cat'] ?? ''));

/*
|--------------------------------------------------------------------------
| TITLES
|--------------------------------------------------------------------------
*/

$titles = [
    'home'          => 'Lumina | Rezerwacje Beauty',
    'explore'       => 'Eksploruj Salony | Lumina',
    'business'      => 'Salon | Lumina',
    'choice'        => 'Dla Salonów | Lumina',
    'admin'         => 'Panel Właściciela | Lumina',
    'auth'          => 'Zaloguj się | Lumina',
    'booking'       => 'Rezerwacja | Lumina',
    'services'      => 'Usługi | Lumina',
    'employees'     => 'Pracownicy | Lumina',
    'gallery'       => 'Galeria | Lumina',
    'setup'         => 'Utwórz Profil | Lumina',
    'dashboard'     => 'Moje Wizyty | Lumina',
    'profile'       => 'Mój Profil | Lumina',
    'reviews'       => 'Opinie | Lumina',
    'offers'        => 'Promocje | Lumina',
    'notifications' => 'Powiadomienia | Lumina',
    'favorites'     => 'Ulubione | Lumina',
    'map'           => 'Mapa Salonów | Lumina',
    'chat'          => 'Wiadomości | Lumina',
    'loyalty'       => 'Lojalność | Lumina',
    'invoice'       => 'Płatności | Lumina',
    'referral'      => 'Polecenia | Lumina',
    'marketplace'   => 'Marketplace | Lumina',
    'superadmin'    => 'Super Admin | Lumina',
];

$title = $titles[$page] ?? APP_NAME;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function isActive(string $target, string $current): string
{
    return $target === $current ? 'active' : '';
}

function asset(string $path): string
{
    return lumina_asset($path);
}

function pageScript(string $page): ?array
{
    return match ($page) {

        'home' => [
            'module' => '/js/pages/home-page.js',
            'init'   => 'initHome()'
        ],

        'explore' => [
            'module' => '/js/pages/explore-page.js',
            'init'   => 'initExplore(' . json_encode($_GET['cat'] ?? '') . ')'
        ],

        'business' => [
            'module' => '/js/pages/business-page.js',
            'init'   => 'initBusiness(' . json_encode($_GET['id'] ?? '') . ')'
        ],

        'dashboard' => [
            'module' => '/js/pages/dashboard-page.js',
            'init'   => 'initDashboard()'
        ],

        'admin' => [
            'module' => '/js/pages/admin-page.js',
            'init'   => 'initAdmin()'
        ],

        'booking' => [
            'module' => '/js/pages/booking-page.js',
            'init'   => 'initBooking(' . json_encode($_GET['id'] ?? '') . ')'
        ],

        'services' => [
            'module' => '/js/pages/services-page.js',
            'init'   => 'initServices(' . json_encode($_GET['id'] ?? '') . ')'
        ],

        'employees' => [
            'module' => '/js/pages/employees-page.js',
            'init'   => 'initEmployees(' . json_encode($_GET['id'] ?? '') . ')'
        ],

        'gallery' => [
            'module' => '/js/pages/gallery-page.js',
            'init'   => 'initGalleryPage(' . json_encode($_GET['id'] ?? '') . ')'
        ],

        'superadmin' => [
            'module' => '/js/pages/superadmin-page.js',
            'init'   => 'initSuperadmin()'
        ],

        default => [
            'module' => "/js/pages/{$page}-page.js",
            'init'   => 'init' . ucfirst($page) . '()'
        ]
    };
}

/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
*/

$description = $page === 'home'
    ? 'Rezerwuj wizyty w najlepszych salonach beauty online.'
    : $title;

/*
|--------------------------------------------------------------------------
| HTML
|--------------------------------------------------------------------------
*/
?>
<!DOCTYPE html>
<html lang="pl">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title><?= e($title) ?></title>

<meta name="description" content="<?= e($description) ?>">
<meta name="theme-color" content="#4f46e5">

<meta property="og:type" content="website">
<meta property="og:title" content="<?= e($title) ?>">
<meta property="og:description" content="<?= e($description) ?>">

<link rel="manifest" href="/luminaphp/manifest.json">
<link rel="icon" href="/luminaphp/img/icon.svg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
>

<link rel="preload" href="<?= asset('/css/main.css') ?>" as="style">
<link rel="stylesheet" href="<?= asset('/css/main.css') ?>">

<?php foreach (lumina_stylesheets($page) as $sheet): ?>
<?= lumina_link_tag($sheet) ?>
<?php endforeach; ?>

<?php foreach (lumina_head_scripts($page) as $script): ?>
<?= lumina_script_tag($script) ?>
<?php endforeach; ?>

<script type="module" src="<?= asset('/js/app.js') ?>"></script>

</head>

<body>

<!-- ===================================================== -->
<!-- HEADER -->
<!-- ===================================================== -->

<header class="header">

    <div class="header-inner">

        <a href="/luminaphp/" class="logo">
            <span class="logo-icon">
                <span class="material-icons">auto_awesome</span>
            </span>
            Lumina
        </a>

        <nav class="header-nav">

            <a
                href="/luminaphp/?page=explore"
                class="<?= isActive('explore', $page) ?>"
            >
                Eksploruj
            </a>

            <a
                href="/luminaphp/?page=choice"
                class="<?= isActive('choice', $page) ?>"
            >
                Dla Salonów
            </a>

            <a
                href="/luminaphp/?page=map"
                class="<?= isActive('map', $page) ?>"
            >
                Mapa
            </a>

            <a
                href="/luminaphp/?page=offers"
                class="<?= isActive('offers', $page) ?>"
            >
                Promocje
            </a>

            <a
                href="/luminaphp/?page=marketplace"
                class="<?= isActive('marketplace', $page) ?>"
            >
                Marketplace
            </a>

        </nav>

        <div class="header-right">

            <button
                class="btn-icon"
                onclick="window.toggleDarkMode?.()"
                aria-label="Motyw"
            >
                <span class="material-icons">dark_mode</span>
            </button>

            <a
                href="/luminaphp/?page=auth"
                class="btn-login"
            >
                Zaloguj
            </a>

        </div>

    </div>

</header>

<!-- ===================================================== -->
<!-- MAIN -->
<!-- ===================================================== -->

<main id="lumina-main" class="<?= e(lumina_main_class($page)) ?>">

<?php

$pageFile = __DIR__ . '/pages/' . $page . '.php';

if (is_file($pageFile)) {
    require $pageFile;
} else {
    echo '<section class="container"><h1>404</h1></section>';
}

?>

</main>

<!-- ===================================================== -->
<!-- FOOTER -->
<!-- ===================================================== -->

<?php if (!in_array($page, NO_FOOTER_PAGES, true)): ?>

<?php include __DIR__ . '/includes/footer.php'; ?>

<?php endif; ?>

<!-- ===================================================== -->
<!-- GLOBAL JS -->
<!-- ===================================================== -->

<script type="module">

import { initBot } from '/luminaphp/js/modules/bot-ui.js';

initBot();

</script>

<?php
$config = pageScript($page);

if ($config):
?>

<script type="module">

import {
    <?= preg_replace('/\(.*/', '', $config['init']) ?>
} from '<?= asset($config['module']) ?>';

function boot()
{
    try {
        <?= $config['init'] ?>;
    } catch (e) {
        console.error('Init error:', e);
    }
}

if (window.App?._ready) {
    boot();
} else {
    window.addEventListener('app:ready', boot, { once: true });

    setTimeout(boot, 2500);
}

</script>

<?php endif; ?>

</body>
</html>
