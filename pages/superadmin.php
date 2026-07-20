<?php
/* Super Admin Panel — PHP session gate */

// ── Auth check ───────────────────────────────────────────────────────────────
$cfg = require __DIR__ . '/../config/superadmin.php';
$expectedToken = hash('sha256', $cfg['username_sha256'] . session_id());
$isAuthed = isset($_SESSION['_sa_auth']) && hash_equals($expectedToken, $_SESSION['_sa_auth']);

// ── CSRF token for login form ─────────────────────────────────────────────────
if (!$isAuthed) {
    if (empty($_SESSION['_sa_csrf'])) {
        $_SESSION['_sa_csrf'] = bin2hex(random_bytes(32));
    }
    $csrfToken = $_SESSION['_sa_csrf'];
}
?>

<?php if (!$isAuthed): ?>
<!-- ===== LOGIN GATE ===== -->
<div class="sa-login-wrap">
  <div class="sa-login-card">
    <div class="sa-login-logo">
      <span class="material-icons">admin_panel_settings</span>
    </div>
    <h1 class="sa-login-title">Super Admin</h1>
    <p class="sa-login-sub">Dostęp tylko dla administratorów platformy.</p>

    <div class="sa-login-error hidden" id="saLoginError"></div>

    <div class="sa-login-fields">
      <div class="sa-login-field">
        <label for="saUsername">Nazwa użytkownika</label>
        <input id="saUsername" type="text" class="sa-login-input" autocomplete="username"
          placeholder="Wpisz nazwę użytkownika">
      </div>
      <div class="sa-login-field">
        <label for="saPassword">Hasło</label>
        <div class="sa-login-pw-wrap">
          <input id="saPassword" type="password" class="sa-login-input" autocomplete="current-password"
            placeholder="••••••••">
          <button type="button" class="sa-login-eye" id="saToggleEye" aria-label="Pokaż hasło">
            <span class="material-icons">visibility</span>
          </button>
        </div>
      </div>
    </div>

    <button class="sa-login-btn" id="saLoginBtn">
      <span class="material-icons">lock_open</span> Zaloguj się
    </button>

    <input type="hidden" id="saCsrfToken" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">
  </div>
</div>

<style>
.sa-login-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
}
.sa-login-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 64px rgba(0,0,0,.5);
}
.sa-login-logo {
  width: 3.5rem; height: 3.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(99,102,241,.4);
}
.sa-login-logo .material-icons { font-size: 1.75rem; color: #fff; }
.sa-login-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0; }
.sa-login-sub { font-size: .8125rem; color: rgba(255,255,255,.45); margin: 0; text-align: center; }
.sa-login-error {
  width: 100%;
  padding: .625rem .875rem;
  background: rgba(239,68,68,.12);
  border: 1px solid rgba(239,68,68,.3);
  border-radius: .5rem;
  color: #fca5a5;
  font-size: .8125rem;
  text-align: center;
}
.sa-login-error.hidden { display: none; }
.sa-login-fields { width: 100%; display: flex; flex-direction: column; gap: .875rem; }
.sa-login-field { display: flex; flex-direction: column; gap: .375rem; }
.sa-login-field label { font-size: .8125rem; font-weight: 600; color: rgba(255,255,255,.7); }
.sa-login-input {
  width: 100%; box-sizing: border-box;
  padding: .625rem .875rem;
  background: rgba(255,255,255,.06);
  border: 1.5px solid rgba(255,255,255,.1);
  border-radius: .625rem;
  color: #fff;
  font-size: .9375rem;
  outline: none;
  transition: border-color .15s;
}
.sa-login-input:focus { border-color: #6366f1; }
.sa-login-input::placeholder { color: rgba(255,255,255,.25); }
.sa-login-pw-wrap { position: relative; }
.sa-login-pw-wrap .sa-login-input { padding-right: 2.75rem; }
.sa-login-eye {
  position: absolute; right: .625rem; top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,.4); padding: .25rem;
  line-height: 1;
}
.sa-login-eye .material-icons { font-size: 1.1rem; }
.sa-login-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; border-radius: .75rem;
  color: #fff; font-size: .9375rem; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(99,102,241,.35);
  transition: opacity .15s, transform .1s;
}
.sa-login-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.sa-login-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
</style>

<script>
(function() {
  const usernameEl = document.getElementById('saUsername');
  const passwordEl = document.getElementById('saPassword');
  const btnEl      = document.getElementById('saLoginBtn');
  const errEl      = document.getElementById('saLoginError');
  const csrf       = document.getElementById('saCsrfToken').value;

  document.getElementById('saToggleEye').addEventListener('click', () => {
    const isHidden = passwordEl.type === 'password';
    passwordEl.type = isHidden ? 'text' : 'password';
    document.querySelector('#saToggleEye .material-icons').textContent =
      isHidden ? 'visibility_off' : 'visibility';
  });

  function showErr(msg) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }

  async function doLogin() {
    const username = usernameEl.value;
    const password = passwordEl.value;
    if (!username || !password) { showErr('Uzupełnij wszystkie pola.'); return; }

    btnEl.disabled = true;
    btnEl.textContent = 'Logowanie…';
    errEl.classList.add('hidden');

    const body = new URLSearchParams({ action: 'login', username, password, _csrf: csrf });
    try {
      const res = await fetch('/luminaphp/api/superadmin-auth.php', { method: 'POST', body });
      const json = await res.json();
      if (json.ok) {
        window.location.reload();
      } else {
        showErr(json.error || 'Błąd logowania.');
        btnEl.disabled = false;
        btnEl.innerHTML = '<span class="material-icons">lock_open</span> Zaloguj się';
      }
    } catch {
      showErr('Błąd sieci. Spróbuj ponownie.');
      btnEl.disabled = false;
      btnEl.innerHTML = '<span class="material-icons">lock_open</span> Zaloguj się';
    }
  }

  btnEl.addEventListener('click', doLogin);
  [usernameEl, passwordEl].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
})();
</script>

<?php else: ?>
<!-- ===== SUPER ADMIN PANEL ===== -->
<div class="sa-layout" id="saLayout">

  <!-- SIDEBAR -->
  <aside class="sa-sidebar" id="saSidebar">
    <div class="sa-sidebar-brand">
      <div class="sa-sidebar-logo">
        <span class="material-icons">admin_panel_settings</span>
      </div>
      <div>
        <div class="sa-sidebar-name">Super Admin</div>
        <div class="sa-sidebar-sub">Lumina Platform</div>
      </div>
    </div>

    <nav class="sa-nav">
      <a href="#" class="sa-nav-link active" data-satab="overview">
        <span class="material-icons">dashboard</span>
        <span>Przegląd</span>
      </a>
      <a href="#" class="sa-nav-link" data-satab="users">
        <span class="material-icons">people</span>
        <span>Użytkownicy</span>
        <span class="sa-nav-badge" id="saBadgeUsers">—</span>
      </a>
      <a href="#" class="sa-nav-link" data-satab="businesses">
        <span class="material-icons">storefront</span>
        <span>Salony</span>
        <span class="sa-nav-badge" id="saBadgeBusinesses">—</span>
      </a>
      <a href="#" class="sa-nav-link" data-satab="appointments">
        <span class="material-icons">event</span>
        <span>Wizyty</span>
        <span class="sa-nav-badge" id="saBadgeAppts">—</span>
      </a>
      <a href="#" class="sa-nav-link" data-satab="marketplace">
        <span class="material-icons">local_offer</span>
        <span>Marketplace</span>
      </a>
      <div class="sa-nav-sep"></div>
      <a href="#" class="sa-nav-link" data-satab="sysinfo">
        <span class="material-icons">memory</span>
        <span>System</span>
      </a>
      <a href="#" class="sa-nav-link sa-nav-logout" id="saLogoutBtn">
        <span class="material-icons">logout</span>
        <span>Wyloguj</span>
      </a>
    </nav>
  </aside>

  <!-- MAIN -->
  <main class="sa-main" id="saMain">

    <!-- OVERVIEW TAB -->
    <div class="sa-tab active" data-satab="overview">
      <div class="sa-page-header">
        <div>
          <h2>Przegląd platformy</h2>
        </div>
        <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
          <button type="button" class="btn btn-ghost btn-sm">Szybkie filtry</button>
          <button type="button" class="btn btn-ghost btn-sm">Wszystkie działania</button>
          <span class="sa-refresh-btn" id="saRefreshBtn" title="Odśwież dane">
            <span class="material-icons">refresh</span>
          </span>
        </div>
      </div>
      <div class="sa-kpi-grid" id="saKpiGrid">
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon sa-kpi-indigo"><span class="material-icons">people</span></div>
          <div><div class="sa-kpi-val" id="kpiUsers">—</div><div class="sa-kpi-label">Użytkownicy</div></div>
        </div>
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon sa-kpi-emerald"><span class="material-icons">storefront</span></div>
          <div><div class="sa-kpi-val" id="kpiBusinesses">—</div><div class="sa-kpi-label">Salony</div></div>
        </div>
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon sa-kpi-amber"><span class="material-icons">event_available</span></div>
          <div><div class="sa-kpi-val" id="kpiAppts">—</div><div class="sa-kpi-label">Wizyty</div></div>
        </div>
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon sa-kpi-rose"><span class="material-icons">verified</span></div>
          <div><div class="sa-kpi-val" id="kpiVerified">—</div><div class="sa-kpi-label">Zweryfikowane</div></div>
        </div>
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon sa-kpi-violet"><span class="material-icons">person</span></div>
          <div><div class="sa-kpi-val" id="kpiClients">—</div><div class="sa-kpi-label">Klienci</div></div>
        </div>
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon sa-kpi-sky"><span class="material-icons">public</span></div>
          <div><div class="sa-kpi-val" id="kpiPublished">—</div><div class="sa-kpi-label">Opublikowane</div></div>
        </div>
      </div>

      <div class="sa-two-col">
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">history</span> Ostatnie rejestracje</div>
          <div id="saRecentUsers"><div class="sa-spinner"></div></div>
        </div>
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">storefront</span> Ostatnie salony</div>
          <div id="saRecentBusinesses"><div class="sa-spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- USERS TAB -->
    <div class="sa-tab hidden" data-satab="users">
      <div class="sa-page-header">
        <h2>Użytkownicy</h2>
        <div class="sa-search-wrap">
          <span class="material-icons sa-search-icon">search</span>
          <input type="search" class="sa-search-input" id="saUserSearch" placeholder="Szukaj po e-mailu lub imieniu…">
        </div>
      </div>
      <div class="sa-filter-row">
        <button class="sa-filter-btn active" data-urole="">Wszyscy</button>
        <button class="sa-filter-btn" data-urole="client">Klienci</button>
        <button class="sa-filter-btn" data-urole="business">Właściciele</button>
      </div>
      <div class="sa-table-wrap" id="saUsersTable"><div class="sa-spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- BUSINESSES TAB -->
    <div class="sa-tab hidden" data-satab="businesses">
      <div class="sa-page-header">
        <h2>Salony</h2>
        <div class="sa-search-wrap">
          <span class="material-icons sa-search-icon">search</span>
          <input type="search" class="sa-search-input" id="saBizSearch" placeholder="Szukaj po nazwie lub mieście…">
        </div>
      </div>
      <div class="sa-filter-row">
        <button class="sa-filter-btn active" data-bfilter="">Wszystkie</button>
        <button class="sa-filter-btn" data-bfilter="published">Opublikowane</button>
        <button class="sa-filter-btn" data-bfilter="draft">Robocze</button>
        <button class="sa-filter-btn" data-bfilter="verified">Zweryfikowane</button>
      </div>
      <div class="sa-table-wrap" id="saBusinessesTable"><div class="sa-spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- APPOINTMENTS TAB -->
    <div class="sa-tab hidden" data-satab="appointments">
      <div class="sa-page-header">
        <h2>Wizyty</h2>
        <div class="sa-search-wrap">
          <span class="material-icons sa-search-icon">search</span>
          <input type="search" class="sa-search-input" id="saApptSearch" placeholder="Szukaj po kliencie lub salonie…">
        </div>
      </div>
      <div class="sa-filter-row">
        <button class="sa-filter-btn active" data-astatus="">Wszystkie</button>
        <button class="sa-filter-btn" data-astatus="zaplanowana">Zaplanowane</button>
        <button class="sa-filter-btn" data-astatus="potwierdzona">Potwierdzone</button>
        <button class="sa-filter-btn" data-astatus="zakończona">Zakończone</button>
        <button class="sa-filter-btn" data-astatus="anulowana">Anulowane</button>
      </div>
      <div class="sa-table-wrap" id="saApptsTable"><div class="sa-spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- MARKETPLACE TAB -->
    <div class="sa-tab hidden" data-satab="marketplace">
      <div class="sa-page-header"><h2>Marketplace — oferty globalne</h2></div>
      <div class="sa-two-col">
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">bolt</span> Flash Deals</div>
          <div id="saFlashDeals"><div class="sa-spinner"></div></div>
        </div>
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">local_offer</span> Promocje</div>
          <div id="saPromos"><div class="sa-spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- SYSTEM TAB -->
    <div class="sa-tab hidden" data-satab="sysinfo">
      <div class="sa-page-header"><h2>Informacje systemowe</h2></div>
      <div class="sa-sysinfo-grid">
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">dns</span> Środowisko PHP</div>
          <table class="sa-info-table">
            <tr><td>Wersja PHP</td><td><?= phpversion() ?></td></tr>
            <tr><td>Środowisko</td><td><?= htmlspecialchars($_ENV['APP_ENV'] ?? 'production', ENT_QUOTES, 'UTF-8') ?></td></tr>
            <tr><td>Strefa czasowa</td><td><?= htmlspecialchars(date_default_timezone_get(), ENT_QUOTES, 'UTF-8') ?></td></tr>
            <tr><td>Czas serwera</td><td><?= date('Y-m-d H:i:s') ?></td></tr>
            <tr><td>Memory limit</td><td><?= ini_get('memory_limit') ?></td></tr>
            <tr><td>Max execution</td><td><?= ini_get('max_execution_time') ?>s</td></tr>
          </table>
        </div>
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">storage</span> Przechowywanie</div>
          <table class="sa-info-table">
            <tr><td>Upload max</td><td><?= ini_get('upload_max_filesize') ?></td></tr>
            <tr><td>Post max</td><td><?= ini_get('post_max_size') ?></td></tr>
            <tr><td>Session driver</td><td><?= ini_get('session.save_handler') ?></td></tr>
            <tr><td>Session lifetime</td><td><?= htmlspecialchars($_ENV['SESSION_LIFETIME'] ?? '3600', ENT_QUOTES, 'UTF-8') ?>s</td></tr>
            <tr><td>HTTPS</td><td><?= lumina_is_https() ? 'Tak' : 'Nie' ?></td></tr>
            <tr><td>OPcache</td><td><?= function_exists('opcache_get_status') ? 'Dostępny' : 'Niedostępny' ?></td></tr>
          </table>
        </div>
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">settings</span> Konfiguracja aplikacji</div>
          <table class="sa-info-table">
            <tr><td>APP_ENV</td><td><?= htmlspecialchars($_ENV['APP_ENV'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td></tr>
            <tr><td>DB_HOST</td><td><?= htmlspecialchars($_ENV['DB_HOST'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td></tr>
            <tr><td>DB_NAME</td><td><?= htmlspecialchars($_ENV['DB_NAME'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td></tr>
            <tr><td>CORS origins</td><td><?= htmlspecialchars($_ENV['CORS_ALLOWED_ORIGINS'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td></tr>
            <tr><td>CSP enabled</td><td><?= ($_ENV['SECURITY_HEADERS_ENABLED'] ?? 'true') === 'false' ? 'Nie' : 'Tak' ?></td></tr>
            <tr><td>TZ</td><td><?= htmlspecialchars($_ENV['TZ'] ?? 'UTC', ENT_QUOTES, 'UTF-8') ?></td></tr>
          </table>
        </div>
        <div class="sa-panel">
          <div class="sa-panel-hdr"><span class="material-icons">extension</span> PHP Extensions</div>
          <div class="sa-ext-grid">
            <?php foreach (['pdo', 'pdo_mysql', 'mbstring', 'openssl', 'curl', 'json', 'zip', 'gd', 'intl', 'sodium'] as $ext): ?>
            <div class="sa-ext-chip <?= extension_loaded($ext) ? 'sa-ext-ok' : 'sa-ext-no' ?>">
              <span class="material-icons"><?= extension_loaded($ext) ? 'check_circle' : 'cancel' ?></span>
              <?= $ext ?>
            </div>
            <?php endforeach; ?>
          </div>
        </div>
      </div>
    </div>

  </main>
</div>

<style>
/* ── Layout ── */
.sa-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #0b0b1a;
}

/* ── Sidebar ── */
.sa-sidebar {
  width: 15rem;
  flex-shrink: 0;
  background: rgba(255,255,255,.025);
  border-right: 1px solid rgba(255,255,255,.06);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
.sa-sidebar-brand {
  display: flex;
  align-items: center;
  gap: .875rem;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,.06);
  margin-bottom: 1rem;
}
.sa-sidebar-logo {
  width: 2.5rem; height: 2.5rem;
  border-radius: .625rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sa-sidebar-logo .material-icons { font-size: 1.25rem; color: #fff; }
.sa-sidebar-name { font-size: .9375rem; font-weight: 700; color: #fff; line-height: 1.2; }
.sa-sidebar-sub  { font-size: .6875rem; color: rgba(255,255,255,.35); }

.sa-nav { display: flex; flex-direction: column; gap: .125rem; padding: 0 .75rem; flex: 1; }
.sa-nav-link {
  display: flex; align-items: center; gap: .75rem;
  padding: .625rem .75rem;
  border-radius: .5rem;
  color: rgba(255,255,255,.55);
  text-decoration: none;
  font-size: .875rem; font-weight: 500;
  transition: background .15s, color .15s;
  position: relative;
}
.sa-nav-link .material-icons { font-size: 1.125rem; flex-shrink: 0; }
.sa-nav-link:hover { background: rgba(255,255,255,.05); color: rgba(255,255,255,.85); }
.sa-nav-link.active { background: rgba(99,102,241,.15); color: #a5b4fc; }
.sa-nav-badge {
  margin-left: auto;
  background: rgba(99,102,241,.25);
  color: #a5b4fc;
  font-size: .6875rem; font-weight: 700;
  padding: .125rem .4rem;
  border-radius: .375rem;
  min-width: 1.5rem; text-align: center;
}
.sa-nav-sep { height: 1px; background: rgba(255,255,255,.06); margin: .75rem 0; }
.sa-nav-logout { color: rgba(239,68,68,.7) !important; margin-top: auto; }
.sa-nav-logout:hover { background: rgba(239,68,68,.08) !important; color: #fca5a5 !important; }

/* ── Main ── */
.sa-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  min-width: 0;
}
.sa-tab { display: block; }
.sa-tab.hidden { display: none; }

.sa-page-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.5rem;
}
.sa-page-header h2 {
  font-size: 1.375rem; font-weight: 700; color: #fff; margin: 0;
  flex: 1;
}
.sa-refresh-btn {
  width: 2rem; height: 2rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: .5rem;
  background: rgba(255,255,255,.06);
  cursor: pointer;
  color: rgba(255,255,255,.5);
  transition: background .15s, color .15s;
}
.sa-refresh-btn:hover { background: rgba(255,255,255,.1); color: #fff; }
.sa-refresh-btn .material-icons { font-size: 1.125rem; }

/* ── KPI Grid ── */
.sa-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.sa-kpi-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: .875rem;
  padding: 1.25rem;
  display: flex; align-items: center; gap: 1rem;
}
.sa-kpi-icon {
  width: 2.5rem; height: 2.5rem;
  border-radius: .625rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sa-kpi-icon .material-icons { font-size: 1.25rem; color: #fff; }
.sa-kpi-indigo  { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.sa-kpi-emerald { background: linear-gradient(135deg, #10b981, #059669); }
.sa-kpi-amber   { background: linear-gradient(135deg, #f59e0b, #d97706); }
.sa-kpi-rose    { background: linear-gradient(135deg, #f43f5e, #e11d48); }
.sa-kpi-violet  { background: linear-gradient(135deg, #a855f7, #9333ea); }
.sa-kpi-sky     { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
.sa-kpi-val   { font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1.1; }
.sa-kpi-label { font-size: .75rem; color: rgba(255,255,255,.4); }

/* ── Panels ── */
.sa-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 900px) { .sa-two-col { grid-template-columns: 1fr; } }

.sa-panel {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: .875rem;
  padding: 1.25rem;
}
.sa-panel-hdr {
  display: flex; align-items: center; gap: .5rem;
  font-size: .875rem; font-weight: 600; color: rgba(255,255,255,.7);
  margin-bottom: 1rem;
  padding-bottom: .75rem;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.sa-panel-hdr .material-icons { font-size: 1rem; }

/* ── Filter row ── */
.sa-filter-row {
  display: flex; gap: .5rem; flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.sa-filter-btn {
  padding: .375rem .875rem;
  border-radius: .5rem;
  border: 1.5px solid rgba(255,255,255,.1);
  background: transparent;
  color: rgba(255,255,255,.5);
  font-size: .8125rem; font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}
.sa-filter-btn:hover { border-color: rgba(255,255,255,.2); color: rgba(255,255,255,.75); }
.sa-filter-btn.active { border-color: #6366f1; background: rgba(99,102,241,.15); color: #a5b4fc; }

/* ── Search ── */
.sa-search-wrap { position: relative; }
.sa-search-icon {
  position: absolute; left: .625rem; top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,.35); font-size: 1rem;
  pointer-events: none;
}
.sa-search-input {
  padding: .5rem .875rem .5rem 2.125rem;
  background: rgba(255,255,255,.06);
  border: 1.5px solid rgba(255,255,255,.1);
  border-radius: .625rem;
  color: #fff;
  font-size: .875rem;
  outline: none;
  width: 18rem;
  transition: border-color .15s;
}
.sa-search-input:focus { border-color: #6366f1; }
.sa-search-input::placeholder { color: rgba(255,255,255,.25); }

/* ── Table ── */
.sa-table-wrap { overflow-x: auto; }
.sa-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .8125rem;
}
.sa-table th {
  text-align: left;
  padding: .625rem .875rem;
  color: rgba(255,255,255,.4);
  font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid rgba(255,255,255,.07);
  white-space: nowrap;
}
.sa-table td {
  padding: .75rem .875rem;
  color: rgba(255,255,255,.8);
  border-bottom: 1px solid rgba(255,255,255,.04);
  vertical-align: middle;
}
.sa-table tr:hover td { background: rgba(255,255,255,.025); }
.sa-table tr:last-child td { border-bottom: none; }

/* ── Badges ── */
.sa-badge {
  display: inline-flex; align-items: center;
  padding: .2rem .5rem;
  border-radius: .375rem;
  font-size: .6875rem; font-weight: 700; text-transform: uppercase;
}
.sa-badge-client   { background: rgba(99,102,241,.15); color: #a5b4fc; }
.sa-badge-business { background: rgba(16,185,129,.15); color: #6ee7b7; }
.sa-badge-ok       { background: rgba(16,185,129,.15); color: #6ee7b7; }
.sa-badge-warn     { background: rgba(245,158,11,.15); color: #fcd34d; }
.sa-badge-err      { background: rgba(239,68,68,.15);  color: #fca5a5; }
.sa-badge-gray     { background: rgba(255,255,255,.08); color: rgba(255,255,255,.5); }

/* ── System info ── */
.sa-sysinfo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.25rem;
}
.sa-info-table { width: 100%; border-collapse: collapse; font-size: .8125rem; }
.sa-info-table td {
  padding: .5rem 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
  color: rgba(255,255,255,.7);
}
.sa-info-table td:first-child { color: rgba(255,255,255,.35); width: 45%; }
.sa-info-table tr:last-child td { border: none; }

.sa-ext-grid { display: flex; flex-wrap: wrap; gap: .5rem; }
.sa-ext-chip {
  display: flex; align-items: center; gap: .35rem;
  padding: .3rem .625rem;
  border-radius: .375rem;
  font-size: .75rem; font-weight: 600;
}
.sa-ext-chip .material-icons { font-size: .875rem; }
.sa-ext-ok { background: rgba(16,185,129,.12); color: #6ee7b7; }
.sa-ext-no { background: rgba(239,68,68,.12);  color: #fca5a5; }

/* ── Misc ── */
.sa-spinner {
  width: 1.75rem; height: 1.75rem;
  border: 2.5px solid rgba(255,255,255,.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin: 1.5rem auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

.sa-empty {
  text-align: center;
  padding: 2rem;
  color: rgba(255,255,255,.3);
  font-size: .875rem;
}

.sa-user-row-avatar {
  width: 2rem; height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  vertical-align: middle;
}

.sa-action-btn {
  padding: .25rem .625rem;
  border-radius: .375rem;
  border: 1.5px solid rgba(255,255,255,.12);
  background: transparent;
  color: rgba(255,255,255,.6);
  font-size: .75rem; font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}
.sa-action-btn:hover { border-color: #6366f1; color: #a5b4fc; background: rgba(99,102,241,.1); }
.sa-action-btn.danger:hover { border-color: #ef4444; color: #fca5a5; background: rgba(239,68,68,.1); }
</style>

<?php endif; ?>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
