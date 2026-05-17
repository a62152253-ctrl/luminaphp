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
  banner.innerHTML = `
    <motion-div class="cookie-banner-inner">
      <p><strong>Pliki cookie</strong> — używamy ich do działania serwisu, analityki i personalizacji (RODO).
        <a href="/luminaphp/?page=choice#privacy">Polityka prywatności</a></p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-ghost" id="cookiePrefsBtn">Ustawienia</button>
        <button type="button" class="btn btn-accent" id="cookieAcceptAll">Akceptuj wszystkie</button>
        <button type="button" class="btn btn-ghost" id="cookieDeleteData">Usuń moje dane</button>
      </div>
      <div id="cookiePrefsPanel" class="cookie-prefs hidden">
        <label><input type="checkbox" checked disabled> Niezbędne</label>
        <label><input type="checkbox" id="cookieAnalytics" checked> Analityka</label>
        <label><input type="checkbox" id="cookieMarketing"> Marketing</label>
        <button type="button" class="btn btn-primary btn-sm" id="cookieSavePrefs">Zapisz preferencje</button>
      </div>
    </motion-div>`;
  banner.innerHTML = banner.innerHTML.replace(/<\/?motion-div[^>]*>/g, m => m.includes('/') ? '</div>' : '<div');
  document.body.appendChild(banner);

  document.getElementById('cookieAcceptAll')?.addEventListener('click', acceptAll);
  document.getElementById('cookiePrefsBtn')?.addEventListener('click', () => {
    document.getElementById('cookiePrefsPanel')?.classList.toggle('hidden');
  });
  document.getElementById('cookieSavePrefs')?.addEventListener('click', () => savePreferences());
  document.getElementById('cookieDeleteData')?.addEventListener('click', requestDataDeletion);
}

export function acceptAll() {
  savePreferences({ essential: true, analytics: true, marketing: true });
}

export function savePreferences(prefs) {
  const consent = prefs || {
    essential: true,
    analytics: document.getElementById('cookieAnalytics')?.checked ?? false,
    marketing: document.getElementById('cookieMarketing')?.checked ?? false,
    ts: Date.now(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  document.getElementById('cookieConsentBanner')?.remove();
  if (consent.analytics) import('./analytics.js').then(m => m.initAnalytics?.());
}

export function revokeConsent() {
  localStorage.removeItem(CONSENT_KEY);
  showBanner();
}

function requestDataDeletion() {
  if (confirm('Czy na pewno chcesz złożyć wniosek o usunięcie danych? Skontaktujemy się z Tobą e-mailem.')) {
    localStorage.setItem('lumina_delete_request', JSON.stringify({ ts: Date.now() }));
    alert('Wniosek zapisany. Obsługa: privacy@lumina.app');
  }
}

export function initCookieConsent() {
  if (!getConsent()) showBanner();
}
