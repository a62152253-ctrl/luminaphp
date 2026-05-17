const DICTS = {
  pl: {
    'nav.explore': 'Eksploruj',
    'nav.dashboard': 'Moje Wizyty',
    'nav.favorites': 'Ulubione',
    'nav.chat': 'Wiadomości',
    'nav.loyalty': 'Lojalność',
    'nav.profile': 'Profil',
    'booking.title': 'Rezerwacja',
    'booking.confirm': 'Potwierdź',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.loading': 'Ładowanie…',
    'offline.banner': 'Brak połączenia z internetem',
    'cookie.title': 'Pliki cookie',
    'cookie.accept': 'Akceptuj wszystkie',
    'payment.trial': '1 dzień za darmo',
    'payment.monthly': '2 $ / miesiąc',
    'payment.yearly': '15 $ / rok',
  },
  en: {
    'nav.explore': 'Explore',
    'nav.dashboard': 'My Appointments',
    'nav.favorites': 'Favorites',
    'nav.chat': 'Messages',
    'nav.loyalty': 'Loyalty',
    'nav.profile': 'Profile',
    'booking.title': 'Booking',
    'booking.confirm': 'Confirm',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading…',
    'offline.banner': 'No internet connection',
    'cookie.title': 'Cookies',
    'cookie.accept': 'Accept all',
    'payment.trial': '1 day free',
    'payment.monthly': '$2 / month',
    'payment.yearly': '$15 / year',
  },
};

let _locale = 'pl';
let _strings = DICTS.pl;

export function detectLanguage() {
  const saved = localStorage.getItem('lumina_locale');
  if (saved && DICTS[saved]) return saved;
  const browser = (navigator.language || 'pl').slice(0, 2);
  return DICTS[browser] ? browser : 'pl';
}

export async function loadLocale(lang) {
  _locale = lang || detectLanguage();
  _strings = DICTS[_locale] || DICTS.pl;
  document.documentElement.lang = _locale;
  applyTranslations();
  return _locale;
}

export function t(key, fallback = '') {
  return _strings[key] ?? fallback ?? key;
}

export function getLocale() { return _locale; }

export async function switchLanguage(lang) {
  if (!DICTS[lang]) return;
  localStorage.setItem('lumina_locale', lang);
  await loadLocale(lang);
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.tagName === 'INPUT' && el.placeholder !== undefined) el.placeholder = val;
    else el.textContent = val;
  });
}

export function initLanguageSwitcher() {
  loadLocale(detectLanguage());
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });
}
