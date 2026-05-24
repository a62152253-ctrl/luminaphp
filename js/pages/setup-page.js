// setup-page.js — onboarding profilu salonu
import { db, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from '../firebase-config.js';
import { toast } from '../modules/utils.js';
import { getUserLocation, geocodeAddress, reverseGeocode } from '../modules/geo.js';
import {
  buildBusinessProfile,
  cleanText,
  isValidNip,
  normalizeHours,
  normalizeNip,
  normalizeUrl,
} from '../modules/business-profile.js';

export async function initSetup() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
  if (window.App?.role !== 'business') { window.location.href = '/luminaphp/'; return; }

  const bizId = window.App?.userDoc?.businessId || user.uid;
  try {
    const snap = await getDoc(doc(db, 'businesses', bizId));
    if (snap.exists()) {
      if (snap.data().profileComplete) { window.location.href = '/luminaphp/?page=admin'; return; }
      prefillSetupForm(snap.data());
    }
  } catch(e) { console.error('initSetup:', e); }

  window.setupFinish       = () => finishSetup(bizId);
  window.setupUseGPS       = () => useGPS();
  window.setupValidateStep = validateStep;
  window.setupNipCheck     = setupNipCheck;
  window.setupDescCount    = setupDescCount;
  window.setupNormalizeUrl = normalizeUrlInput;

  ['setupName','setupCategory','setupCity','setupAddress','setupPhoto','setupOwnerConsent'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateLaunchChecklist);
    document.getElementById(id)?.addEventListener('change', updateLaunchChecklist);
  });
}

function prefillSetupForm(d) {
  const nameEl = document.getElementById('setupName');
  const catEl  = document.getElementById('setupCategory');
  if (nameEl && d.name) nameEl.value = d.name;
  if (catEl && d.category) {
    for (const opt of catEl.options) {
      if (opt.text === d.category) { opt.selected = true; break; }
    }
  }
  setValue('setupDesc', d.description || '');
  setValue('setupPhone', d.phone || '');
  setValue('setupNip', d.nip || '');
  setValue('setupWebsite', d.website || '');
  setValue('setupCity', d.city || '');
  setValue('setupAddress', d.address || '');
  setValue('setupPostal', d.postal || '');
  setValue('setupPhoto', d.photoURL || '');
  if (d.lat && d.lng) { setValue('setupLat', d.lat); setValue('setupLng', d.lng); }
  fillHours(d.hours || {});
  setupDescCount(d.description || '');
  setupNipCheck(d.nip || '');
  updateLaunchChecklist();
}

// ─── GPS BUTTON ───────────────────────────────────────────────────────────────

function setGpsBtn(btn, state) {
  if (!btn) return;
  const states = {
    loading:  { disabled: true,  html: '<span class="material-icons" style="animation:spin 1s linear infinite">sync</span> Pobieranie…' },
    geocoding:{ disabled: true,  html: '<span class="material-icons" style="animation:spin 1s linear infinite">sync</span> Pobieranie adresu…' },
    idle:     { disabled: false, html: '<span class="material-icons">my_location</span> Użyj lokalizacji GPS' },
    done:     { disabled: false, html: '<span class="material-icons">check_circle</span> Lokalizacja GPS zapisana' },
  };
  const s = states[state];
  btn.disabled = s.disabled;
  btn.innerHTML = s.html;
  if (state === 'done') btn.classList.add('geo-btn-success');
}

async function useGPS() {
  const btn = document.getElementById('setupGpsBtn');
  setGpsBtn(btn, 'loading');

  const loc = await getUserLocation();
  if (!loc) {
    toast('Brak dostępu do lokalizacji. Adres zostanie użyty do geokodowania.', 'error');
    setGpsBtn(btn, 'idle');
    return;
  }

  document.getElementById('setupLat').value = loc.lat;
  document.getElementById('setupLng').value = loc.lng;
  setLocationStatus('GPS zapisany. Adres i współrzędne będą częścią profilu salonu.', true);

  setGpsBtn(btn, 'geocoding');
  const addr = await reverseGeocode(loc.lat, loc.lng);
  if (addr) {
    const cityEl    = document.getElementById('setupCity');
    const addressEl = document.getElementById('setupAddress');
    const postalEl  = document.getElementById('setupPostal');
    if (cityEl    && addr.city)    { cityEl.value    = addr.city;    highlight(cityEl);    }
    if (addressEl && addr.address) { addressEl.value = addr.address; highlight(addressEl); }
    if (postalEl  && addr.postal)  { postalEl.value  = addr.postal;  highlight(postalEl);  }
  }

  setGpsBtn(btn, 'done');
  toast('Lokalizacja i adres uzupełnione');
  updateLaunchChecklist();
}

function highlight(el) {
  el.style.transition = 'background .3s';
  el.style.background = '#dcfce7';
  setTimeout(() => { el.style.background = ''; }, 1500);
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function showSetupErr(btn, msg) {
  if (btn) { btn.disabled = false; btn.textContent = 'Utwórz profil i wejdź do panelu'; }
  document.getElementById('setupErrorMsg').textContent = msg;
  document.getElementById('setupError')?.classList.add('show');
}

function validateStep(step) {
  const name = cleanText(document.getElementById('setupName')?.value, 80);
  const category = document.getElementById('setupCategory')?.value || '';
  const nip = normalizeNip(document.getElementById('setupNip')?.value);
  const city = cleanText(document.getElementById('setupCity')?.value, 64);
  const address = cleanText(document.getElementById('setupAddress')?.value, 120);

  if (step === 1) {
    if (!name) { window.setupShowError?.('Podaj nazwę salonu.'); return false; }
    if (!category) { window.setupShowError?.('Wybierz branżę.'); return false; }
  }

  if (step === 2) {
    if (!city) { window.setupShowError?.('Podaj miasto.'); return false; }
    if (!address || !/\d/.test(address)) { window.setupShowError?.('Podaj pełny adres z numerem budynku.'); return false; }
  }

  if (step === 3) {
    const { errors } = collectHours();
    if (errors.length) { window.setupShowError?.(errors[0]); return false; }
  }

  updateLaunchChecklist();
  return true;
}

function setupNipCheck(value) {
  const status = document.getElementById('setupNipStatus');
  if (!status) return;

  const nip = normalizeNip(value);
  if (!nip) {
    status.textContent = '';
    return;
  }

  if (nip.length < 10) {
    status.textContent = 'Wpisz 10 cyfr';
    status.style.color = 'var(--zinc-400)';
    return;
  }

  const valid = isValidNip(nip);
  status.textContent = valid ? 'Poprawny NIP' : 'Błędny NIP';
  status.style.color = valid ? '#16a34a' : '#dc2626';
  updateLaunchChecklist();
}

function setupDescCount(value) {
  const counter = document.getElementById('setupDescCounter');
  if (!counter) return;
  const len = cleanText(value, 700).length;
  counter.textContent = `${len} / rekomendowane min. 80 znaków`;
  counter.style.color = len >= 80 ? '#16a34a' : 'var(--zinc-400)';
  updateLaunchChecklist();
}

function normalizeUrlInput(input) {
  if (!input?.value) return;
  const url = normalizeUrl(input.value);
  if (url) input.value = url;
  updateLaunchChecklist();
}

function collectHours() {
  return normalizeHours((i) => ({
    closed: document.getElementById(`shClosed_${i}`)?.checked || false,
    open: document.getElementById(`shOpen_${i}`)?.value || '09:00',
    close: document.getElementById(`shClose_${i}`)?.value || '18:00',
  }));
}

function fillHourRow(row, i) {
  const closed = document.getElementById(`shClosed_${i}`);
  const open   = document.getElementById(`shOpen_${i}`);
  const close  = document.getElementById(`shClose_${i}`);
  const times  = document.getElementById(`shTimes_${i}`);
  if (closed && typeof row.closed === 'boolean') closed.checked = row.closed;
  if (open && row.open)   open.value  = row.open;
  if (close && row.close) close.value = row.close;
  if (times && closed)    times.style.opacity = closed.checked ? '.3' : '1';
}

function fillHours(hours) {
  for (let i = 0; i < 7; i++) { fillHourRow(hours[i] || {}, i); }
}

function updateLaunchChecklist() {
  const nip = normalizeNip(document.getElementById('setupNip')?.value);
  const identity = !!cleanText(document.getElementById('setupName')?.value, 80)
    && !!document.getElementById('setupCategory')?.value;
  const location = !!cleanText(document.getElementById('setupCity')?.value, 64)
    && /\d/.test(cleanText(document.getElementById('setupAddress')?.value, 120));
  const content = cleanText(document.getElementById('setupDesc')?.value, 700).length >= 80
    || !!normalizeUrl(document.getElementById('setupPhoto')?.value);

  setChecklistState('identity', identity);
  setChecklistState('location', location);
  setChecklistState('content', content);
}

function setChecklistState(key, done) {
  const row = document.querySelector(`[data-check="${key}"]`);
  if (!row) return;
  row.classList.toggle('complete', done);
  const icon = row.querySelector('.material-icons');
  if (icon) icon.textContent = done ? 'check_circle' : 'radio_button_unchecked';
}

async function checkNipUnique(nip, bizId) {
  try {
    const nipSnap = await getDocs(query(collection(db, 'businesses'), where('nip', '==', nip)));
    const takenBy = nipSnap.docs.find(d => d.id !== bizId);
    return takenBy ? 'Salon z tym NIP jest już zarejestrowany w systemie.' : null;
  } catch(e) { return null; }
}

function setLocationStatus(text, ok = false) {
  const el = document.getElementById('setupLocationStatus');
  if (!el) return;
  el.innerHTML = `<span class="material-icons">${ok ? 'check_circle' : 'pin_drop'}</span><span>${text}</span>`;
  el.style.borderColor = ok ? '#bbf7d0' : '';
  el.style.background = ok ? '#f0fdf4' : '';
}

// ─── FINISH ───────────────────────────────────────────────────────────────────

async function finishSetup(bizId) {
  const btn = document.getElementById('setupFinishBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Zapisywanie…'; }

  const name     = document.getElementById('setupName')?.value.trim()               || '';
  const category = document.getElementById('setupCategory')?.value                   || '';
  const desc     = document.getElementById('setupDesc')?.value.trim()                || '';
  const phone    = document.getElementById('setupPhone')?.value.trim()               || '';
  const nipRaw   = (document.getElementById('setupNip')?.value || '').replace(/\D/g, '');
  const nip      = (nipRaw && isValidNip(nipRaw)) ? nipRaw : '';
  const website  = document.getElementById('setupWebsite')?.value.trim()             || '';
  const city     = document.getElementById('setupCity')?.value.trim()                || '';
  const address  = document.getElementById('setupAddress')?.value.trim()             || '';
  const postal   = document.getElementById('setupPostal')?.value.trim()              || '';
  const photoURL = document.getElementById('setupPhoto')?.value.trim()               || '';
  const consent  = document.getElementById('setupOwnerConsent')?.checked || false;

  if (!consent) {
    showSetupErr(btn, 'Potwierdź, że masz prawo utworzyć profil tego salonu.');
    return;
  }

  const { hours, errors: hourErrors } = collectHours();
  if (hourErrors.length) {
    showSetupErr(btn, hourErrors[0]);
    return;
  }

  if (nip) {
    if (btn) btn.textContent = 'Weryfikacja NIP…';
    const nipErr = await checkNipUnique(nip, bizId);
    if (nipErr) { showSetupErr(btn, nipErr); return; }
  }

  let lat = parseFloat(document.getElementById('setupLat')?.value) || null;
  let lng = parseFloat(document.getElementById('setupLng')?.value) || null;

  if ((!lat || !lng) && city && address) {
    if (btn) btn.textContent = 'Geokodowanie adresu…';
    const coords = await geocodeAddress(city, address);
    if (coords) {
      lat = coords.lat; lng = coords.lng;
      setLocationStatus('Adres został zgeokodowany i zapisany w profilu.', true);
    } else {
      setLocationStatus('Nie udało się ustalić współrzędnych. Profil nadal zapisze adres tekstowy.', false);
    }
  }

  const built = buildBusinessProfile({
    name, category, description: desc, phone, nip, website,
    city, address, postal, photoURL, lat, lng,
  }, {
    profileComplete: true,
    onboardingStatus: 'submitted',
    verificationStatus: 'unverified',
    isPublished: true,
  });

  if (built.errors.length) {
    showSetupErr(btn, built.errors[0]);
    return;
  }

  try {
    const data = {
      ...built.data,
      hours,
      ownerId: window.App?.user?.uid || bizId,
      ownerEmail: window.App?.user?.email || '',
      setupConsent: true,
      setupSubmittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'businesses', bizId), data, { merge: true });
    toast('Profil salonu utworzony i gotowy do działania!', 'success');
    window.location.href = '/luminaphp/?page=admin';
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Utwórz profil i wejdź do panelu'; }
    document.getElementById('setupErrorMsg').textContent = 'Błąd zapisu: ' + e.message;
    document.getElementById('setupError')?.classList.add('show');
  }
}
