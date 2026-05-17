import { db, collection, addDoc, getDocs, query, where, serverTimestamp }
  from '../firebase-config.js';
import { escHtml, toast } from './utils.js';
import {
  buildClaimPayload,
  isValidNip,
  normalizeNip,
} from './business-profile.js';

let _bizId        = null;
let _bizName      = '';
let _bizVerified  = false;
let _openedAt     = 0;
let _mouseMoves   = 0;
let _keystrokes   = 0;
let _tracking     = false;
let _existingClaim = null;

// ─── LOCKOUT ──────────────────────────────────────────────────────────────────
// 2 validation failures → 5-hour block
// Any failure after the block period (even expired) → permanent block

const LOCK_KEY      = 'reclaim_lockout_v1';
const TEMP_BLOCK_MS = 5 * 60 * 60 * 1000; // 5 hours

function getLock() {
  try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || {}; } catch { return {}; }
}
function saveLock(data) {
  try { localStorage.setItem(LOCK_KEY, JSON.stringify(data)); } catch {}
}

// Returns { blocked: false } or { blocked: true, permanent: bool, remaining: ms }
function checkLock() {
  const lock = getLock();
  if (lock.permanent)    return { blocked: true, permanent: true };
  if (lock.blockedUntil) {
    const remaining = lock.blockedUntil - Date.now();
    if (remaining > 0)   return { blocked: true, permanent: false, remaining };
  }
  return { blocked: false };
}

// Called on every validation failure at submit time
function recordFailure() {
  const lock    = getLock();
  if (lock.permanent) return;

  const stillBlocked = lock.blockedUntil && lock.blockedUntil > Date.now();

  if (stillBlocked) {
    // Submitted during an active block → escalate to permanent
    saveLock({ permanent: true });
    return;
  }

  const attempts = (lock.attempts || 0) + 1;

  if (lock.hadBlock) {
    // Already served one 5-hour block → permanent on any new failure
    saveLock({ permanent: true });
  } else if (attempts >= 2) {
    // 2nd failure → 5-hour block
    saveLock({ attempts, blockedUntil: Date.now() + TEMP_BLOCK_MS, hadBlock: true });
  } else {
    saveLock({ ...lock, attempts });
  }
}

function fmtRemaining(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export function initReclaim(bizId, bizName, bizVerified = false) {
  _bizId       = bizId;
  _bizName     = bizName;
  _bizVerified = bizVerified;

  window.openReclaimModal  = openModal;
  window.closeReclaimModal = closeModal;
  window.submitReclaim     = submit;
  window.reclaimNipCheck   = nipCheck;
  window.reclaimMsgCount   = msgCount;

  // Hide the button only for the actual owner or if the salon is already verified
  const triggerBtn = document.getElementById('reclaimTrigger');
  if (!triggerBtn) return;

  const tryHide = () => {
    const user = window.App?.user;
    if (bizVerified)         { triggerBtn.style.display = 'none'; return; }
    if (user?.uid === bizId) { triggerBtn.style.display = 'none'; return; }
  };

  if (window.App?._ready) {
    tryHide();
  } else {
    const poll = setInterval(() => {
      if (window.App?._ready) { clearInterval(poll); tryHide(); }
    }, 100);
  }
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

async function openModal() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const modal = document.getElementById('reclaimModal');
  if (!modal || !modal.classList.contains('hidden')) return;

  // Check lockout before showing the form
  const lock = checkLock();
  if (lock.blocked) {
    modal.classList.remove('hidden');
    document.getElementById('reclaimStep1')?.classList.add('hidden');
    showLockScreen(lock);
    return;
  }

  _openedAt   = Date.now();
  _mouseMoves = 0;
  _keystrokes = 0;
  _tracking   = true;

  modal.classList.remove('hidden');
  document.getElementById('reclaimStep1').classList.remove('hidden');
  document.getElementById('reclaimStep2').classList.add('hidden');

  const errEl = document.getElementById('reclaimError');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }

  const emailInput = document.getElementById('reclaimEmail');
  if (emailInput) emailInput.value = user.email || '';

  const nipStatus = document.getElementById('reclaimNipStatus');
  if (nipStatus) nipStatus.textContent = '';

  const counter = document.getElementById('reclaimMsgCounter');
  if (counter) { counter.textContent = '0 / min. 80 znaków'; counter.style.color = ''; }

  const btn = document.getElementById('reclaimSubmitBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-icons">verified_user</span> Wyślij i zweryfikuj'; }

  document.addEventListener('mousemove', trackMouse);
  document.addEventListener('keydown',   trackKeys);

  await loadExistingClaim(user.uid);
}

function closeModal() {
  document.getElementById('reclaimModal')?.classList.add('hidden');
  stopTracking();
}

function stopTracking() {
  _tracking = false;
  document.removeEventListener('mousemove', trackMouse);
  document.removeEventListener('keydown',   trackKeys);
}

function trackMouse() { if (_tracking) _mouseMoves++; }
function trackKeys()  { if (_tracking) _keystrokes++; }

function showLockScreen(lock) {
  const step2 = document.getElementById('reclaimStep2');
  if (!step2) return;
  step2.classList.remove('hidden');

  if (lock.permanent) {
    step2.innerHTML = `
      <div class="reclaim-result reclaim-result--warn">
        <span class="material-icons reclaim-result-icon" style="color:#ef4444">block</span>
        <h4>Dostęp zablokowany</h4>
        <p>Twoje konto zostało trwale zablokowane od składania roszczeń z powodu wielokrotnych błędnych prób.
           Jeśli uważasz, że to pomyłka, skontaktuj się z nami bezpośrednio przez e-mail.</p>
      </div>`;
  } else {
    const remaining = fmtRemaining(lock.remaining);
    step2.innerHTML = `
      <div class="reclaim-result reclaim-result--warn">
        <span class="material-icons reclaim-result-icon" style="color:#f59e0b">timer</span>
        <h4>Tymczasowa blokada</h4>
        <p>Zbyt wiele błędnych prób. Możesz spróbować ponownie za <strong>${remaining}</strong>.</p>
        <p style="margin-top:.5rem;font-size:.8125rem">Upewnij się, że dane (numer telefonu, NIP) są poprawne przed kolejną próbą.</p>
      </div>`;
  }
}

async function loadExistingClaim(userId) {
  const box = document.getElementById('reclaimExistingStatus');
  if (!box) return;

  box.classList.add('hidden');
  box.innerHTML = '';
  _existingClaim = null;

  try {
    const snap = await getDocs(query(
      collection(db, 'claims'),
      where('userId', '==', userId),
      where('businessId', '==', _bizId)
    ));
    if (snap.empty) return;

    const claims = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    _existingClaim = claims[0];
    const active = ['pending', 'in_review', 'approved'].includes(_existingClaim.status);
    box.classList.remove('hidden');
    box.innerHTML = `
      <strong>${escHtml(claimStatusLabel(_existingClaim.status))}</strong>
      <span>Numer zgłoszenia: ${escHtml(_existingClaim.id)}. ${active
        ? 'Nie musisz wysyłać kolejnego formularza — mamy już Twoje zgłoszenie.'
        : 'Poprzednie zgłoszenie jest zamknięte, więc możesz wysłać poprawione dane.'}</span>
    `;

    const btn = document.getElementById('reclaimSubmitBtn');
    if (btn && active) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons">hourglass_top</span> Zgłoszenie już wysłane';
    }
  } catch {
    // Status is helpful, but it should never block a legitimate owner from sending.
  }
}

function claimStatusLabel(status) {
  return {
    pending: 'Zgłoszenie oczekuje na weryfikację',
    in_review: 'Zgłoszenie jest sprawdzane',
    approved: 'Zgłoszenie zaakceptowane',
    rejected: 'Zgłoszenie odrzucone',
    closed: 'Zgłoszenie zamknięte',
  }[status] || 'Zgłoszenie zapisane';
}

// ─── LIVE NIP CHECK ───────────────────────────────────────────────────────────

function nipCheck(val) {
  const statusEl = document.getElementById('reclaimNipStatus');
  if (!statusEl) return;

  const digits = normalizeNip(val);
  if (!digits) { statusEl.textContent = ''; return; }
  if (digits.length < 10) {
    statusEl.textContent = '…';
    statusEl.style.color = 'var(--zinc-400)';
    return;
  }

  const valid = isValidNip(digits);
  statusEl.textContent = valid ? '✓ Poprawny NIP' : '✗ Nieprawidłowy NIP';
  statusEl.style.color = valid ? '#22c55e' : '#ef4444';
}

// ─── CHAR COUNTER ─────────────────────────────────────────────────────────────

function msgCount(val) {
  const counter = document.getElementById('reclaimMsgCounter');
  if (!counter) return;
  const len = val.length;
  counter.textContent = `${len} / min. 80 znaków`;
  counter.style.color = len >= 80 ? '#22c55e' : 'var(--zinc-400)';
}

// ─── IP / VPN CHECK ───────────────────────────────────────────────────────────

async function checkIp() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res  = await fetch('https://ip-api.com/json/?fields=proxy,hosting,query', { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    return { proxy: data.proxy || data.hosting || false, ip: data.query };
  } catch {
    clearTimeout(timer);
    return { proxy: false, ip: null };
  }
}

// ─── ANTI-SPAM SCORE ─────────────────────────────────────────────────────────
// Score >= 100 → HUMAN  → show Discord
// Score 50-99  → BORDERLINE → save, manual review
// Score < 50   → BOT    → reject silently (fake success)

function scoreTimingFactor(elapsed) {
  if (elapsed >= 60) return 30;
  if (elapsed >= 20) return 20;
  if (elapsed >= 10) return 10;
  if (elapsed < 3)   return -60;
  return 0;
}

function scoreMouseFactor(moves) {
  if (moves > 50)  return 20;
  if (moves > 20)  return 15;
  if (moves > 5)   return 8;
  if (moves === 0) return -25;
  return 0;
}

function scoreKeysFactor(keys) {
  if (keys > 80) return 15;
  if (keys > 30) return 10;
  if (keys > 10) return 5;
  return -10;
}

function scoreMsgLength(len) {
  if (len >= 200) return 25;
  if (len >= 120) return 18;
  if (len >= 80)  return 10;
  return -20;
}

async function scoreUserFactor(user, name) {
  if (!user) return 0;
  let s = 15;
  if (user.emailVerified) s += 20;
  const createdAt = user.metadata?.creationTime;
  if (createdAt) {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    if      (ageMs > 7 * 86_400_000) s += 20;
    else if (ageMs > 86_400_000)     s += 10;
    else                             s -= 25;
  }
  if (user.photoURL) s += 10;
  if (name && _bizName && similarity(name.toLowerCase(), _bizName.toLowerCase()) > 0.85) s -= 20;
  return s;
}

async function calcScore(nip, phone, msg, name) {
  if (document.getElementById('reclaimHp')?.value) return -999;

  const elapsed = (Date.now() - _openedAt) / 1000;
  let score = scoreTimingFactor(elapsed)
            + scoreMouseFactor(_mouseMoves)
            + scoreKeysFactor(_keystrokes)
            + scoreMsgLength(msg.length);

  if (nip && isValidNip(nip)) score += 20;
  else if (nip) score -= 30;

  if (phone && /^\+?[\d\s\-]{9,15}$/.test(phone)) score += 10;

  score += await scoreUserFactor(window.App?.user, name);

  const { proxy } = await checkIp();
  if (proxy) score -= 40;

  return score;
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b)  return 1;
  const bigrams = (s) => new Set(Array.from({ length: s.length - 1 }, (_, i) => s.slice(i, i + 2)));
  const setA = bigrams(a), setB = bigrams(b);
  let intersection = 0;
  setA.forEach(g => { if (setB.has(g)) intersection++; });
  return (2 * intersection) / (setA.size + setB.size);
}

// ─── SUBMIT ───────────────────────────────────────────────────────────────────

async function submit() {
  stopTracking();

  const user = window.App?.user;
  if (!user) { toast('Zaloguj się', 'error'); return; }

  // Re-check lockout (someone might open devtools and try anyway)
  const lock = checkLock();
  if (lock.blocked) { showLockScreen(lock); return; }

  const get = (id) => (document.getElementById(id)?.value || '').trim();
  const name   = get('reclaimName');
  const phone  = get('reclaimPhone');
  const nip    = normalizeNip(get('reclaimNip'));
  const regon  = get('reclaimRegon');
  const social = get('reclaimSocial');
  const doc    = get('reclaimDoc');
  const msg    = get('reclaimMsg');
  const role   = get('reclaimRole') || 'owner';
  const action = get('reclaimAction') || 'claim_ownership';
  const consent = document.getElementById('reclaimConsent')?.checked || false;

  const errEl   = document.getElementById('reclaimError');
  const showErr = (txt, countFailure = false) => {
    if (!errEl) return;
    errEl.textContent = txt;
    errEl.style.display = 'flex';
    errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (countFailure) recordFailure();
    // If this failure triggered a block, show lock screen after a short delay
    const newLock = checkLock();
    if (newLock.blocked) {
      setTimeout(() => {
        document.getElementById('reclaimStep1')?.classList.add('hidden');
        showLockScreen(newLock);
      }, 2000);
    }
  };

  const built = buildClaimPayload({
    name,
    phone,
    nip,
    regon,
    socialLink: social,
    docLink: doc,
    message: msg,
    claimantRole: role,
    requestedAction: action,
    consent,
  }, {
    userId: user.uid,
    userEmail: user.email || '',
    businessId: _bizId,
    businessName: _bizName,
  });

  if (built.errors.length) {
    showErr(built.errors[0], built.errors[0].includes('NIP'));
    return;
  }

  const btn = document.getElementById('reclaimSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-icons" style="animation:spin 1s linear infinite">autorenew</span> Weryfikacja…'; }

  // ── Rate limit: 1 claim per user per salon ──
  try {
    const recent = await getDocs(query(
      collection(db, 'claims'),
      where('userId',     '==', user.uid),
      where('businessId', '==', _bizId)
    ));
    if (!recent.empty) {
      const claims = recent.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      const active = claims.find(c => ['pending', 'in_review', 'approved'].includes(c.status));
      if (active) {
        showErr('Już złożyłeś/aś aktywne zgłoszenie do tego salonu. Status znajdziesz nad formularzem.');
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-icons">hourglass_top</span> Zgłoszenie już wysłane'; }
        await loadExistingClaim(user.uid);
        return;
      }
    }
  } catch { /* sieć — kontynuuj */ }

  const score = await calcScore(nip, phone, msg, name);
  const scoreBand = score >= 100 ? 'high_trust' : score >= 50 ? 'manual_review' : 'silent_reject';
  const riskLevel = score >= 100 ? 'low' : score >= 50 ? 'medium' : 'high';
  let claimId = null;

  if (score >= 50) {
    try {
      claimId = await saveClaimDoc(built.payload, score, scoreBand, riskLevel);
    } catch (e) {
      const errElDirect = document.getElementById('reclaimError');
      if (errElDirect) { errElDirect.textContent = 'Błąd zapisu: ' + e.message; errElDirect.style.display = 'flex'; }
      if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-icons">verified_user</span> Wyślij i zweryfikuj'; }
      return;
    }
  }

  showResult(score, claimId);
}

async function saveClaimDoc(payload, score, scoreBand, riskLevel) {
  const ref = await addDoc(collection(db, 'claims'), {
    ...payload,
    score, scoreBand, riskLevel,
    businessVerifiedAtSubmit: _bizVerified,
    interaction: {
      openedMs: Math.max(0, Date.now() - _openedAt),
      mouseMoves: _mouseMoves,
      keystrokes: _keystrokes,
    },
    clientContext: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    },
    statusTimeline: [{ status: 'pending', label: 'Zgłoszenie przyjęte', atClient: new Date().toISOString() }],
    status: 'pending',
    statusUpdatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────

function showResult(score, claimId = null) {
  document.getElementById('reclaimStep1')?.classList.add('hidden');
  const step2 = document.getElementById('reclaimStep2');
  if (!step2) return;
  step2.classList.remove('hidden');

  if (score >= 100) {
    step2.innerHTML = `
      <div class="reclaim-result reclaim-result--ok">
        <span class="material-icons reclaim-result-icon">check_circle</span>
        <h4>Zgłoszenie przyjęte</h4>
        <p>Twoje dane wyglądają spójnie, więc zgłoszenie trafiło do szybkiej weryfikacji.</p>
        ${claimId ? `<p class="reclaim-disclaimer">Numer zgłoszenia: <strong>${escHtml(claimId)}</strong>. Przygotuj dowód własności, jeśli poprosimy o dodatkowe potwierdzenie.</p>` : ''}
      </div>`;
  } else if (score >= 50) {
    step2.innerHTML = `
      <div class="reclaim-result reclaim-result--warn">
        <span class="material-icons reclaim-result-icon">schedule</span>
        <h4>Zgłoszenie w trakcie weryfikacji</h4>
        <p>Zapisaliśmy Twoje zgłoszenie. Skontaktujemy się na adres <strong>${escHtml(window.App?.user?.email || '')}</strong> w ciągu 3–5 dni roboczych.</p>
        ${claimId ? `<p class="reclaim-disclaimer">Numer zgłoszenia: <strong>${escHtml(claimId)}</strong>.</p>` : ''}
      </div>`;
  } else {
    step2.innerHTML = `
      <div class="reclaim-result reclaim-result--warn">
        <span class="material-icons reclaim-result-icon">schedule</span>
        <h4>Zgłoszenie wysłane</h4>
        <p>Otrzymaliśmy Twoje zgłoszenie. Odezwiemy się wkrótce.</p>
      </div>`;
  }
}
