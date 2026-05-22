const CONSENT_KEY = 'lumina_cookie_consent';

export function getConsent() {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); }
  catch { return null; }
}

export function showBanner() {
  if (getConsent() || document.getElementById('cookieConsentBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'cookieConsentBanner';
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Zgoda na pliki cookie');
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-top">
        <div class="cookie-banner-icon">
          <span class="material-icons" aria-hidden="true">cookie</span>
        </div>
        <div class="cookie-banner-text">
          <strong>Pliki cookie</strong>
          <p>Używamy ich do działania serwisu, analityki i personalizacji (RODO).
            <a href="/luminaphp/?page=choice#privacy">Polityka prywatności</a></p>
        </div>
      </div>

      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-ghost btn-sm" id="cookiePrefsBtn" aria-expanded="false" aria-controls="cookiePrefsPanel">
          <span class="material-icons" aria-hidden="true">tune</span> Ustawienia
        </button>
        <button type="button" class="btn btn-accent btn-sm" id="cookieAcceptAll">
          Akceptuj wszystkie
        </button>
        <button type="button" class="cookie-banner-delete" id="cookieDeleteData">
          Usuń moje dane
        </button>
      </div>

      <div id="cookiePrefsPanel" class="cookie-prefs hidden" role="region" aria-label="Ustawienia kategorii cookie">
        <div class="cookie-prefs-grid">
          <div class="cookie-pref-item">
            <label>Niezbędne <input type="checkbox" checked disabled aria-label="Niezbędne pliki cookie (wymagane)"></label>
            <small>Wymagane do działania serwisu</small>
          </div>
          <div class="cookie-pref-item">
            <label>Analityka <input type="checkbox" id="cookieAnalytics" checked aria-label="Analityka"></label>
            <small>Pomaga nam ulepszać serwis</small>
          </div>
          <div class="cookie-pref-item">
            <label>Marketing <input type="checkbox" id="cookieMarketing" aria-label="Marketing"></label>
            <small>Spersonalizowane treści</small>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="cookieSavePrefs">
          <span class="material-icons" aria-hidden="true">check</span> Zapisz wybór
        </button>
      </div>
    </div>`;

  document.body.appendChild(banner);

  banner.querySelector('#cookieAcceptAll').addEventListener('click', acceptAll);
  banner.querySelector('#cookieSavePrefs').addEventListener('click', () => savePreferences());
  banner.querySelector('#cookieDeleteData').addEventListener('click', showDeleteModal);
  banner.querySelector('#cookiePrefsBtn').addEventListener('click', () => {
    const panel = banner.querySelector('#cookiePrefsPanel');
    const btn   = banner.querySelector('#cookiePrefsBtn');
    const open  = panel.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', open);
  });
}

function dismissBanner() {
  const banner = document.getElementById('cookieConsentBanner');
  if (!banner) return;
  banner.style.animation = 'cookieSlideDown .3s ease forwards';
  setTimeout(() => banner.remove(), 300);
}

export function acceptAll() {
  savePreferences({ essential: true, analytics: true, marketing: true, ts: Date.now() });
}

export function savePreferences(prefs) {
  const consent = prefs || {
    essential: true,
    analytics: document.getElementById('cookieAnalytics')?.checked ?? false,
    marketing: document.getElementById('cookieMarketing')?.checked ?? false,
    ts: Date.now(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  dismissBanner();
  if (consent.analytics) import('./analytics.js').then(m => m.initAnalytics?.()).catch(() => {});
}

export function revokeConsent() {
  localStorage.removeItem(CONSENT_KEY);
  showBanner();
}

function showDeleteModal() {
  if (document.getElementById('cookieDeleteModal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cookieDeleteModal';
  overlay.className = 'profile-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:10001;padding:1rem';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'deleteModalTitle');
  overlay.innerHTML = `
    <div class="profile-modal" style="max-width:420px;width:100%">
      <div class="profile-modal-head">
        <h2 id="deleteModalTitle" style="font-size:1rem">Usuń moje dane</h2>
        <button class="profile-modal-close" id="deleteModalClose" aria-label="Zamknij">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="profile-modal-body" style="padding:1.25rem 1.5rem">
        <p style="font-size:.875rem;color:var(--text-muted);line-height:1.6">
          Złożysz wniosek o trwałe usunięcie Twoich danych osobowych zgodnie z RODO (art. 17).<br><br>
          Odpiszemy na adres e-mail przypisany do Twojego konta w ciągu <strong>72 godzin</strong>.
        </p>
      </div>
      <div class="profile-modal-foot">
        <button class="profile-cancel-btn" id="deleteModalCancel">Anuluj</button>
        <button class="btn btn-sm" id="deleteModalConfirm"
          style="background:#dc2626;color:#fff;border:none;display:flex;align-items:center;gap:.375rem">
          <span class="material-icons" style="font-size:1rem">delete_forever</span> Wyślij wniosek
        </button>
      </div>
    </div>`;

  const close = () => overlay.remove();
  overlay.querySelector('#deleteModalClose').addEventListener('click', close);
  overlay.querySelector('#deleteModalCancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#deleteModalConfirm').addEventListener('click', () => {
    localStorage.setItem('lumina_delete_request', JSON.stringify({ ts: Date.now() }));
    close();
    _showToast('Wniosek zapisany — odpiszemy w ciągu 72 h');
  });

  document.body.appendChild(overlay);
  overlay.querySelector('#deleteModalClose').focus();
}

function _showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast success';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);z-index:10002;white-space:nowrap';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

export function initCookieConsent() {
  if (!getConsent()) showBanner();
}
