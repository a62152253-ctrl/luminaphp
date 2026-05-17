<?php
require_once __DIR__ . '/bootstrap.php';

$page      = $_GET['page'] ?? 'home';
$bizId     = $_GET['id']   ?? '';
$activeCat = $_GET['cat']  ?? '';
$validPages = ['home','explore','business','choice','admin','auth','booking','services','employees','gallery','setup','dashboard',
  'profile','reviews','offers','notifications','favorites','map','chat','loyalty','invoice','referral'];
if (!in_array($page, $validPages)) $page = 'home';

$titles = [
  'home'       => 'Lumina | Rezerwacje Beauty',
  'explore'    => 'Eksploruj Salony | Lumina',
  'business'   => 'Salon | Lumina',
  'choice'     => 'Dla Salonów | Lumina',
  'admin'      => 'Panel Właściciela | Lumina',
  'auth'       => 'Zaloguj się | Lumina',
  'booking'    => 'Rezerwacja | Lumina',
  'services'   => 'Usługi | Lumina',
  'employees'  => 'Pracownicy | Lumina',
  'gallery'    => 'Galeria | Lumina',
  'setup'      => 'Utwórz profil salonu | Lumina',
  'dashboard'  => 'Moje Wizyty | Lumina',
  'profile'    => 'Mój profil | Lumina',
  'reviews'    => 'Opinie | Lumina',
  'offers'     => 'Promocje | Lumina',
  'notifications' => 'Powiadomienia | Lumina',
  'favorites'  => 'Ulubione | Lumina',
  'map'        => 'Mapa salonów | Lumina',
  'chat'       => 'Wiadomości | Lumina',
  'loyalty'    => 'Lojalność | Lumina',
  'invoice'    => 'Płatności | Lumina',
  'referral'   => 'Polecenia | Lumina',
];
$title = $titles[$page];
?>
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="<?= $page === 'home' ? 'Lumina — rezerwuj wizyty w salonach beauty online. Barber, fryzjer, kosmetyczka i więcej.' : htmlspecialchars($title) ?>">
  <meta name="theme-color" content="#4f46e5">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Lumina">
  <link rel="manifest" href="/luminaphp/manifest.json">
  <link rel="icon" href="/luminaphp/img/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/luminaphp/img/icon.svg">
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="Lumina">
  <meta property="og:title"       content="<?= htmlspecialchars($title) ?>">
  <meta property="og:description" content="<?= $page === 'home' ? 'Rezerwuj wizyty w najlepszych salonach beauty w Twojej okolicy.' : htmlspecialchars($title) ?>">
  <meta property="og:image"       content="/luminaphp/img/og-cover.jpg">
  <meta name="twitter:card"       content="summary_large_image">
  <meta name="twitter:title"      content="<?= htmlspecialchars($title) ?>">
  <title><?= htmlspecialchars($title) ?></title>
  <link rel="preload" href="/luminaphp/css/style.css" as="style">
  <link rel="preload" href="/luminaphp/js/app.js"     as="script" crossorigin>
  <?php if ($page === 'home'): ?>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebSite","name":"Lumina","url":"<?= (isset($_SERVER['HTTPS'])&&$_SERVER['HTTPS']==='on'?'https':'http').'://'.$_SERVER['HTTP_HOST'].'/luminaphp/' ?>","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"<?= (isset($_SERVER['HTTPS'])&&$_SERVER['HTTPS']==='on'?'https':'http').'://'.$_SERVER['HTTP_HOST'] ?>/luminaphp/?page=explore&q={search_term_string}"},"query-input":"required name=search_term_string"}}
  </script>
  <?php endif; ?>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/luminaphp/css/material-icons.css">
  <link rel="stylesheet" href="/luminaphp/css/style.css">
  <link rel="stylesheet" href="/luminaphp/css/premium.css">
  <link rel="stylesheet" href="/luminaphp/css/pro-theme.css">
  <?php if (in_array($page, ['admin','employees','services'])): ?>
  <link rel="stylesheet" href="/luminaphp/css/admin.css">
  <link rel="stylesheet" href="/luminaphp/css/admin-enhanced.css">
  <?php endif; ?>
  <?php if ($page === 'gallery'): ?>
  <link rel="stylesheet" href="/luminaphp/css/admin-enhanced.css">
  <?php endif; ?>
  <?php if ($page === 'auth' || $page === 'setup'): ?>
  <link rel="stylesheet" href="/luminaphp/css/auth.css">
  <?php endif; ?>
  <?php if ($page === 'dashboard'): ?>
  <link rel="stylesheet" href="/luminaphp/css/dashboard.css">
  <link rel="stylesheet" href="/luminaphp/css/dashboard-pro.css">
  <?php endif; ?>
  <?php if (in_array($page, ['business','booking'])): ?>
  <link rel="stylesheet" href="/luminaphp/css/business.css">
  <?php endif; ?>
  <?php if (in_array($page, ['explore','business','map'])): ?>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <?php endif; ?>
  <?php if (in_array($page, ['profile','reviews','offers','notifications','favorites','map','chat','loyalty','invoice','referral'])): ?>
  <link rel="stylesheet" href="/luminaphp/css/features.css">
  <?php endif; ?>
</head>
<body>

<!-- HEADER -->
<header class="header">
  <div class="header-inner">
    <a href="/luminaphp/" class="logo">
      <span class="logo-icon"><span class="material-icons" style="font-size:1.25rem">auto_awesome</span></span>
      Lumina
    </a>

    <nav class="header-nav">
      <a href="/luminaphp/?page=explore" <?= $page==='explore'?'class="active"':'' ?>>Eksploruj</a>
      <a href="/luminaphp/?page=choice" <?= $page==='choice'?'class="active"':'' ?>>Dla Salonów</a>
      <a href="/luminaphp/?page=map" <?= $page==='map'?'class="active"':'' ?>>Mapa</a>
      <a href="/luminaphp/?page=offers" <?= $page==='offers'?'class="active"':'' ?>>Promocje</a>
      <a href="/luminaphp/?page=dashboard" class="nav-dashboard hidden<?= $page==='dashboard'?' active':'' ?>" data-role="client">Moje Wizyty</a>
      <a href="/luminaphp/?page=admin" id="navBizPanel" class="hidden<?= $page==='admin'?' active':'' ?>" data-role="business">Panel Salonu</a>
      <a href="/luminaphp/?page=services" class="hidden<?= $page==='services'?' active':'' ?>" data-role="business" data-sub="services">Usługi</a>
      <a href="/luminaphp/?page=employees" class="hidden<?= $page==='employees'?' active':'' ?>" data-role="business" data-sub="employees">Pracownicy</a>
    </nav>

    <div class="header-right">
      <button class="btn-icon" onclick="window.toggleDarkMode()" aria-label="Zmień motyw" title="Zmień motyw (jasny/ciemny)">
        <span class="material-icons theme-toggle-icon">dark_mode</span>
      </button>
      <button class="hamburger-btn" id="mobileMenuBtn" onclick="openMobileNav()" aria-label="Menu">
        <span class="material-icons">menu</span>
      </button>
      <!-- Logged in -->
      <div id="userSection" class="hidden" style="align-items:center;gap:.75rem">
        <div style="position:relative">
          <button id="notifBtn" class="btn-icon" onclick="toggleNotifs()">
            <span class="material-icons">notifications</span>
            <span id="notifBadge" class="badge hidden">0</span>
          </button>
          <div id="notifDropdown" class="notif-dropdown">
            <div class="notif-header">
              <h3>Powiadomienia</h3>
              <button onclick="document.getElementById('notifDropdown').classList.remove('open')"
                style="color:var(--zinc-300);display:flex;align-items:center">
                <span class="material-icons" style="font-size:1.125rem">close</span>
              </button>
            </div>
            <div id="notifBody" class="notif-body"></div>
            <div class="notif-footer">
              <button class="notif-clear">Wyczyść wszystko</button>
            </div>
          </div>
        </div>

        <div class="divider-v"></div>

        <div style="position:relative" id="userMenuWrap">
          <button class="header-user-btn" id="headerUserBtn" onclick="window.toggleUserMenu()">
            <div class="user-info">
              <div class="user-status">Authenticated</div>
              <div id="userName" class="user-name">Użytkownik</div>
            </div>
            <img id="userAvatar" src="" alt="Avatar" class="user-avatar">
          </button>
          <div id="userMenu" class="user-menu">
            <a id="headerUserLink" href="#" class="user-menu-item">
              <span class="material-icons">calendar_today</span>
              Moje Wizyty
            </a>
            <a href="/luminaphp/?page=profile" class="user-menu-item">
              <span class="material-icons">person</span>
              Mój profil
            </a>
            <a href="/luminaphp/?page=favorites" class="user-menu-item nav-dashboard hidden" data-role="client">
              <span class="material-icons">favorite</span>
              Ulubione
            </a>
            <a href="/luminaphp/?page=chat" class="user-menu-item nav-dashboard hidden" data-role="client">
              <span class="material-icons">chat</span>
              Wiadomości
            </a>
            <a href="/luminaphp/?page=loyalty" class="user-menu-item nav-dashboard hidden" data-role="client">
              <span class="material-icons">emoji_events</span>
              Lojalność
            </a>
            <a href="/luminaphp/?page=referral" class="user-menu-item nav-dashboard hidden" data-role="client">
              <span class="material-icons">card_giftcard</span>
              Polecenia
            </a>
            <a href="/luminaphp/?page=notifications" class="user-menu-item">
              <span class="material-icons">notifications</span>
              Powiadomienia
            </a>
            <button class="user-menu-item" onclick="window.openProfileModal();window.closeUserMenu()">
              <span class="material-icons">manage_accounts</span>
              Edytuj profil
            </button>
            <div class="user-menu-sep"></div>
            <button class="user-menu-item user-menu-item--danger" onclick="logout()">
              <span class="material-icons">logout</span>
              Wyloguj
            </button>
          </div>
        </div>
      </div>

      <!-- Not logged in -->
      <a href="/luminaphp/?page=auth" id="loginBtn" class="btn-login">Zaloguj</a>
    </div>
  </div>
</header>

<!-- MOBILE NAV OVERLAY -->
<div id="mobileNavOverlay" class="mobile-nav-overlay" onclick="closeMobileNav()">
  <nav class="mobile-nav-drawer" onclick="event.stopPropagation()">
    <div class="mobile-nav-head">
      <span class="mobile-nav-logo">Lumina</span>
      <button class="mobile-nav-close" onclick="closeMobileNav()">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="mobile-nav-links">
      <a href="/luminaphp/?page=explore" class="mobile-nav-link <?= $page==='explore'?'active':'' ?>">
        <span class="material-icons">search</span>Eksploruj
      </a>
      <a href="/luminaphp/?page=choice" class="mobile-nav-link <?= $page==='choice'?'active':'' ?>">
        <span class="material-icons">store</span>Dla Salonów
      </a>
      <div class="mobile-nav-sep"></div>
      <a href="/luminaphp/?page=dashboard" class="mobile-nav-link nav-dashboard hidden<?= $page==='dashboard'?' active':'' ?>" data-role="client">
        <span class="material-icons">calendar_today</span>Moje Wizyty
      </a>
      <a href="/luminaphp/?page=admin" class="mobile-nav-link hidden<?= $page==='admin'?' active':'' ?>" data-role="business">
        <span class="material-icons">dashboard</span>Panel Salonu
      </a>
      <a href="/luminaphp/?page=services" class="mobile-nav-link hidden<?= $page==='services'?' active':'' ?>" data-role="business" data-sub="services">
        <span class="material-icons">spa</span>Usługi
      </a>
      <a href="/luminaphp/?page=employees" class="mobile-nav-link hidden<?= $page==='employees'?' active':'' ?>" data-role="business" data-sub="employees">
        <span class="material-icons">group</span>Pracownicy
      </a>
    </div>
  </nav>
</div>

<!-- PAGE CONTENT -->
<?php include __DIR__ . '/pages/' . $page . '.php'; ?>


<!-- Profile edit modal -->
<div id="profileModal" class="profile-overlay hidden">
  <div class="profile-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <span class="profile-modal-tag">Profil</span>
      <h2 class="profile-modal-title">Edytuj profil</h2>
      <button class="profile-modal-close" onclick="window.closeProfileModal()">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="profile-modal-body">
      <div class="profile-avatar-section">
        <div class="profile-avatar-wrap" onclick="document.getElementById('profilePhotoInput').click()" title="Zmień zdjęcie">
          <img id="profileAvatarPreview" src="" alt="Avatar" class="profile-avatar-img">
          <div class="profile-avatar-overlay">
            <span class="material-icons">photo_camera</span>
            <span>Zmień</span>
          </div>
        </div>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display:none"
          onchange="window.onProfilePhotoChange(this)">
        <p class="profile-avatar-hint">Kliknij aby zmienić zdjęcie</p>
      </div>
      <div class="auth-field">
        <label for="profileNickInput">Pseudonim / Imię</label>
        <input type="text" id="profileNickInput" class="auth-input" placeholder="Jak mamy Cię nazywać?">
      </div>
    </div>
    <div class="profile-modal-foot">
      <button class="profile-cancel-btn" onclick="window.closeProfileModal()">Anuluj</button>
      <button id="profileSaveBtn" class="profile-save-btn" onclick="window.saveProfile()">
        <span class="material-icons" style="font-size:1rem">save</span> Zapisz
      </button>
    </div>
  </div>
</div>

<!-- PWA: register service worker -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/luminaphp/sw.js', { scope: '/luminaphp/' }).catch(() => {});
}
</script>

<!-- Global orchestrator (auth, notifications, globals) -->
<script type="module" src="/luminaphp/js/app.js"></script>

<?php if ($page === 'auth'): ?>
<script type="module">
  import { initAuth } from '/luminaphp/js/pages/auth-page.js';
  function tryInit(n = 0) {
    if (window.App?._ready || n > 30) initAuth();
    else setTimeout(() => tryInit(n + 1), 100);
  }
  tryInit();
</script>

<?php elseif ($page === 'setup'): ?>
<script type="module">
  import { initSetup } from '/luminaphp/js/pages/setup-page.js';
  function tryInit(n = 0) {
    if (window.App?._ready || n > 30) initSetup();
    else setTimeout(() => tryInit(n + 1), 100);
  }
  tryInit();
</script>

<?php elseif ($page === 'home'): ?>
<script type="module">
  import { initHome } from '/luminaphp/js/pages/home-page.js';
  initHome();
</script>

<?php elseif ($page === 'explore'): ?>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLs=" crossorigin=""></script>
<script type="module">
  import { initExplore } from '/luminaphp/js/pages/explore-page.js';
  initExplore(<?= json_encode($activeCat) ?>);
</script>

<?php elseif ($page === 'business'): ?>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLs=" crossorigin=""></script>
<script type="module">
  import { initBusiness } from '/luminaphp/js/pages/business-page.js';
  initBusiness(<?= json_encode($bizId) ?>);
</script>

<?php elseif ($page === 'dashboard'): ?>
<script type="module">
  import { initDashboard } from '/luminaphp/js/pages/dashboard-page.js';
  function tryInit(n = 0) {
    if (window.App?._ready || n > 30) initDashboard();
    else setTimeout(() => tryInit(n + 1), 100);
  }
  tryInit();
</script>

<?php elseif ($page === 'admin'): ?>
<script type="module">
  import { initAdmin } from '/luminaphp/js/pages/admin-page.js';
  function tryInit(n = 0) {
    if (window.App?._ready || n > 30) initAdmin();
    else setTimeout(() => tryInit(n + 1), 100);
  }
  tryInit();
</script>

<?php elseif ($page === 'booking'): ?>
<script type="module">
  import { initBooking } from '/luminaphp/js/pages/booking-page.js';
  initBooking(<?= json_encode($bizId) ?>);
</script>

<?php elseif ($page === 'services'): ?>
<script type="module">
  import { initServices } from '/luminaphp/js/pages/services-page.js';
  initServices(<?= json_encode($bizId) ?>);
</script>

<?php elseif ($page === 'employees'): ?>
<script type="module">
  import { initEmployees } from '/luminaphp/js/pages/employees-page.js';
  initEmployees(<?= json_encode($bizId) ?>);
</script>

<?php elseif ($page === 'gallery'): ?>
<script type="module">
  import { initGalleryPage } from '/luminaphp/js/pages/gallery-page.js';
  initGalleryPage(<?= json_encode($bizId) ?>);
</script>

<?php elseif (in_array($page, ['profile','reviews','offers','notifications','favorites','map','chat','loyalty','invoice','referral'])): ?>
<script type="module">
  <?php
  $pageInits = [
    'profile' => 'initProfile', 'reviews' => 'initReviews', 'offers' => 'initOffers',
    'notifications' => 'initNotifications', 'favorites' => 'initFavorites', 'map' => 'initMap',
    'chat' => 'initChat', 'loyalty' => 'initLoyalty', 'invoice' => 'initInvoice', 'referral' => 'initReferral',
  ];
  $initFn = $pageInits[$page];
  ?>
  import { <?= $initFn ?> } from '/luminaphp/js/pages/<?= $page ?>-page.js';
  function tryInit(n = 0) {
    if (window.App?._ready || n > 30) {
      <?php if ($page === 'reviews'): ?>
      <?= $initFn ?>(<?= json_encode($bizId) ?>);
      <?php else: ?>
      <?= $initFn ?>();
      <?php endif; ?>
    } else setTimeout(() => tryInit(n + 1), 100);
  }
  tryInit();
</script>
<?php endif; ?>

<script>
function openMobileNav()  { document.getElementById('mobileNavOverlay').classList.add('open'); }
function closeMobileNav() { document.getElementById('mobileNavOverlay').classList.remove('open'); }
</script>
</body>
</html>
