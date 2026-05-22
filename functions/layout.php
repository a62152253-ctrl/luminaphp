<?php

declare(strict_types=1);

/** Base path for static assets (no trailing slash). */
function lumina_base(): string
{
    return '/luminaphp';
}

/** Versioned asset URL for cache busting. */
function lumina_asset(string $path): string
{
    $path = '/' . ltrim($path, '/');
    $file = __DIR__ . '/..' . $path;
    $v    = is_file($file) ? (string) filemtime($file) : '1';
    return lumina_base() . $path . '?v=' . $v;
}

/** Pages with full-bleed hero (no top padding on main). */
function lumina_flush_pages(): array
{
    return ['home', 'auth', 'setup', 'choice', 'explore', 'map', 'business', 'booking'];
}

/** CSS bundles per route — keeps HTTP requests minimal. */
function lumina_stylesheets(string $page): array
{
    // Single consolidated bundle. Original files remain available.
    $sheets = [
        lumina_asset('/css/main.css'),
    ];

    // Keep external libraries separate (Leaflet, Swiper, Flatpickr for admin).
    if (in_array($page, ['explore', 'business', 'map'], true)) {
        $sheets[] = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    }

    if ($page === 'home') {
        $sheets[] = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
    }

    foreach (lumina_admin_cdn_styles($page) as $cdn) {
        $sheets[] = $cdn;
    }

    return $sheets;
}

/** External scripts loaded in head (defer). */
function lumina_head_scripts(string $page): array
{
    if (!in_array($page, ['admin', 'employees', 'services'], true)) {
        return [];
    }
    return [
        'https://cdn.jsdelivr.net/npm/apexcharts',
        'https://cdn.jsdelivr.net/npm/flatpickr',
        'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/pl.js',
    ];
}

/** Admin-only CDN styles */
function lumina_admin_cdn_styles(string $page): array
{
    if (!in_array($page, ['admin', 'employees', 'services'], true)) {
        return [];
    }
    return ['https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'];
}

function lumina_link_tag(string $href): string
{
    $cross = str_starts_with($href, 'http') ? ' crossorigin' : '';
    return '<link rel="stylesheet" href="' . htmlspecialchars($href, ENT_QUOTES, 'UTF-8') . '"' . $cross . '>';
}

function lumina_main_class(string $page): string
{
    $classes = ['lumina-main', 'lumina-main--' . preg_replace('/[^a-z0-9_-]/', '', $page)];
    if (in_array($page, lumina_flush_pages(), true)) {
        $classes[] = 'lumina-main--flush';
    }
    return implode(' ', $classes);
}
