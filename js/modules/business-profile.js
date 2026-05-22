export const BUSINESS_CATEGORIES = [
  'Barber',
  'Fryzjer',
  'Paznokcie',
  'Masaż',
  'Kosmetyczka',
  'Brwi i Rzęsy',
  'Fizjoterapia',
  'Inne',
];

const MAX = {
  name: 80,
  city: 64,
  address: 120,
  postal: 12,
  description: 700,
  phone: 24,
  website: 180,
  url: 220,
  claimMessage: 1200,
  personName: 90,
};

export function cleanText(value, max = 160) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function normalizeNip(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

export function normalizeRegon(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 14);
}

export function normalizePhone(value) {
  return String(value ?? '')
    .replace(/[^\d+\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX.phone);
}

export function normalizeUrl(value) {
  const raw = cleanText(value, MAX.url);
  if (!raw) return '';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.hash = '';
    return url.toString().slice(0, MAX.url);
  } catch {
    return '';
  }
}

export function isValidNip(nip) {
  const digits = normalizeNip(nip);
  if (!/^\d{10}$/.test(digits)) return false;

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, weight, index) => acc + weight * Number(digits[index]), 0);
  return (sum % 11) === Number(digits[9]);
}

export function isValidRegon(regon) {
  const digits = normalizeRegon(regon);
  if (!digits) return true;
  if (!/^\d{9}(\d{5})?$/.test(digits)) return false;

  const weights9 = [8, 9, 2, 3, 4, 5, 6, 7];
  const sum9 = weights9.reduce((acc, weight, index) => acc + weight * Number(digits[index]), 0);
  const check9 = sum9 % 11 === 10 ? 0 : sum9 % 11;
  if (check9 !== Number(digits[8])) return false;

  if (digits.length === 9) return true;

  const weights14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
  const sum14 = weights14.reduce((acc, weight, index) => acc + weight * Number(digits[index]), 0);
  const check14 = sum14 % 11 === 10 ? 0 : sum14 % 11;
  return check14 === Number(digits[13]);
}

export function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  return /^\+?[\d\s-]{9,24}$/.test(normalized) && normalized.replace(/\D/g, '').length >= 9;
}

export function isValidPostal(postal) {
  const value = cleanText(postal, MAX.postal);
  return !value || /^\d{2}-?\d{3}$/.test(value);
}

export function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value ?? ''));
}

export function timeToMinutes(value) {
  if (!isValidTime(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function normalizeHours(readDay) {
  const hours = {};
  const errors = [];

  for (let i = 0; i < 7; i++) {
    const row = readDay(i) || {};
    const closed = !!row.closed;
    const open = isValidTime(row.open) ? row.open : '09:00';
    const close = isValidTime(row.close) ? row.close : '18:00';

    if (!closed && timeToMinutes(open) >= timeToMinutes(close)) {
      errors.push(`Godzina zamknięcia musi być późniejsza niż otwarcia: dzień ${i + 1}.`);
    }

    hours[i] = { closed, open, close };
  }

  return { hours, errors };
}

export function buildBusinessSlug(name, city = '') {
  const source = `${name}-${city}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

  return slug || `salon-${Date.now()}`;
}

export function buildSearchKeywords(...parts) {
  const text = parts
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const tokens = text.match(/[a-z0-9]{2,}/g) || [];
  return [...new Set(tokens)].slice(0, 40);
}

export function scoreBusinessProfile(data) {
  const checks = [
    !!data.name,
    !!data.category,
    !!data.city,
    !!data.address,
    !!data.nip,
    !!data.phone,
    !!data.description && data.description.length >= 80,
    !!data.photoURL,
    !!data.website,
    !!data.lat && !!data.lng,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function buildBusinessProfile(input, options = {}) {
  const errors = [];
  const name = cleanText(input.name, MAX.name);
  const category = cleanText(input.category, 48);
  const description = cleanText(input.description, MAX.description);
  const phone = normalizePhone(input.phone);
  const nip = normalizeNip(input.nip);
  const website = normalizeUrl(input.website);
  const city = cleanText(input.city, MAX.city);
  const address = cleanText(input.address, MAX.address);
  const postal = cleanText(input.postal, MAX.postal);
  const photoURL = normalizeUrl(input.photoURL);

  if (name.length < 2) errors.push('Podaj nazwę salonu.');
  if (!BUSINESS_CATEGORIES.includes(category)) errors.push('Wybierz prawidłową branżę.');
  if (!city) errors.push('Podaj miasto.');
  if (!address || !/\d/.test(address)) errors.push('Podaj pełny adres z numerem budynku.');
  if (nip && !isValidNip(nip)) errors.push('Podaj prawidłowy NIP.');
  if (phone && !isValidPhone(phone)) errors.push('Podaj prawidłowy numer telefonu.');
  if (!isValidPostal(postal)) errors.push('Podaj kod pocztowy w formacie 00-000.');
  if (input.website && !website) errors.push('Podaj prawidłowy adres strony www.');
  if (input.photoURL && !photoURL) errors.push('Podaj prawidłowy URL zdjęcia.');

  const lat = Number(input.lat);
  const lng = Number(input.lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const base = {
    name,
    category,
    description,
    phone,
    nip,
    website,
    city,
    address,
    postal,
    photoURL,
    slug: buildBusinessSlug(name, city),
    searchKeywords: buildSearchKeywords(name, category, city, address),
    profileComplete: !!options.profileComplete,
    isPublished: options.isPublished ?? true,
    verificationStatus: options.verificationStatus || 'unverified',
    onboardingStatus: options.onboardingStatus || 'draft',
  };

  if (hasCoords) {
    base.lat = lat;
    base.lng = lng;
  }

  base.profileQualityScore = scoreBusinessProfile(base);

  return { data: base, errors };
}

export function buildClaimPayload(input, context = {}) {
  const errors = [];
  const claimantName = cleanText(input.name, MAX.personName);
  const phone = normalizePhone(input.phone);
  const nip = normalizeNip(input.nip);
  const regon = normalizeRegon(input.regon);
  const socialLink = normalizeUrl(input.socialLink);
  const docLink = normalizeUrl(input.docLink);
  const message = cleanText(input.message, MAX.claimMessage);
  const requestedAction = cleanText(input.requestedAction || 'claim_ownership', 40);
  const claimantRole = cleanText(input.claimantRole || 'owner', 40);

  if (!claimantName) errors.push('Podaj imię i nazwisko.');
  if (!isValidPhone(phone)) errors.push('Podaj prawidłowy numer telefonu.');
  if (!isValidNip(nip)) errors.push('Podaj prawidłowy NIP firmy.');
  if (!isValidRegon(regon)) errors.push('Podaj prawidłowy REGON albo zostaw pole puste.');
  if (input.socialLink && !socialLink) errors.push('Podaj prawidłowy link do strony lub social media.');
  if (input.docLink && !docLink) errors.push('Podaj prawidłowy link do dokumentu.');
  if (message.length < 80) errors.push('Opis musi mieć minimum 80 znaków.');
  if (!input.consent) errors.push('Potwierdź, że masz prawo reprezentować ten salon.');

  const payload = {
    userId: context.userId || '',
    userEmail: context.userEmail || '',
    userName: claimantName,
    userPhone: phone,
    businessId: context.businessId || '',
    businessName: cleanText(context.businessName, MAX.name),
    nip,
    regon: regon || null,
    socialLink: socialLink || null,
    docLink: docLink || null,
    message,
    claimantRole,
    requestedAction,
    status: 'pending',
    statusLabel: 'Oczekuje na weryfikację',
    source: 'business_reclaim_modal',
    consent: true,
    normalizedBusinessName: cleanText(context.businessName, MAX.name).toLowerCase(),
    evidenceCount: [regon, socialLink, docLink].filter(Boolean).length,
  };

  return { payload, errors };
}
