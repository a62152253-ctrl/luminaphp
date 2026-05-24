export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g, '&#39;');
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(amount ?? 0);
}

export function toast(msg, type = '', duration = 4000) {
  const icon = type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info';
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.setAttribute('role', 'alert');
  el.innerHTML = `<span class="material-icons">${icon}</span><span>${escHtml(msg)}</span><button class="toast-close" aria-label="Zamknij"><span class="material-icons">close</span></button>`;

  const dismiss = () => {
    el.classList.add('toast--out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    clearTimeout(timer);
  };

  el.addEventListener('click', dismiss);
  document.body.appendChild(el);
  const timer = setTimeout(dismiss, duration);
}

export function confirmAction(message, onConfirm, onCancel = null) {
  const existing = document.getElementById('lumina-confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'lumina-confirm-overlay';
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-dialog" role="alertdialog" aria-modal="true">
      <div class="confirm-icon"><span class="material-icons">warning_amber</span></div>
      <p class="confirm-message">${escHtml(message)}</p>
      <div class="confirm-actions">
        <button class="confirm-cancel">Anuluj</button>
        <button class="confirm-ok">Potwierdź</button>
      </div>
    </div>`;

  let cleaned = false;
  let escHandler = null;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (escHandler) document.removeEventListener('keydown', escHandler);
  };

  const close = () => {
    cleanup();
    overlay.remove();
  };
  const cancel = () => { close(); onCancel?.(); };
  overlay.querySelector('.confirm-cancel').addEventListener('click', cancel);
  overlay.querySelector('.confirm-ok').addEventListener('click', () => { close(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) cancel(); });
  escHandler = e => { if (e.key === 'Escape') cancel(); };
  document.addEventListener('keydown', escHandler);
  document.body.appendChild(overlay);
  overlay.querySelector('.confirm-ok').focus();
}

export function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function onAppReady(callback, { timeoutMs = 0 } = {}) {
  if (window.App?._ready) {
    callback();
    return () => {};
  }

  let done = false;
  let timeoutId = null;

  const cleanup = () => {
    if (done) return;
    done = true;
    window.removeEventListener('app:ready', run);
    if (timeoutId) clearTimeout(timeoutId);
  };

  const run = () => {
    if (done) return;
    cleanup();
    callback();
  };

  window.addEventListener('app:ready', run, { once: true });
  if (timeoutMs > 0) {
    timeoutId = setTimeout(run, timeoutMs);
  }

  return cleanup;
}

export function waitForGlobal(getter, callback, { intervalMs = 100, timeoutMs = 0 } = {}) {
  const resolve = typeof getter === 'function'
    ? getter
    : () => window[getter];

  const initial = resolve();
  if (initial) {
    callback(initial);
    return () => {};
  }

  let stopped = false;
  let timeoutId = null;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
  };

  const intervalId = setInterval(() => {
    const value = resolve();
    if (!value) return;
    cleanup();
    callback(value);
  }, intervalMs);

  if (timeoutMs > 0) {
    timeoutId = setTimeout(cleanup, timeoutMs);
  }

  return cleanup;
}

const APPOINTMENT_STATUS_LABELS = {
  pending: 'Oczekuj\u0105ca',
  zaplanowana: 'Zaplanowana',
  potwierdzona: 'Potwierdzona',
  confirmed: 'Potwierdzona',
  'w trakcie': 'W trakcie',
  zako\u0144czona: 'Zako\u0144czona',
  completed: 'Zako\u0144czona',
  cancelled: 'Anulowana',
  anulowana: 'Anulowana',
  'nie przyszed\u0142': 'Nie przyszed\u0142',
};

const APPOINTMENT_CANCELLED = new Set(['cancelled', 'anulowana']);
const APPOINTMENT_REVENUE = new Set(['confirmed', 'potwierdzona', 'completed', 'zako\u0144czona']);
const APPOINTMENT_BADGE_CLASSES = {
  pending: 'badge-pending',
  zaplanowana: 'badge-planned',
  potwierdzona: 'badge-confirmed',
  confirmed: 'badge-confirmed',
  'w trakcie': 'badge-inprogress',
  zako\u0144czona: 'badge-done',
  completed: 'badge-done',
  cancelled: 'badge-cancelled',
  anulowana: 'badge-cancelled',
  'nie przyszed\u0142': 'badge-noshow',
};
const APPOINTMENT_DOT_COLORS = {
  zaplanowana: '#6366f1',
  pending: '#6366f1',
  potwierdzona: '#22c55e',
  confirmed: '#22c55e',
  'w trakcie': '#f59e0b',
  zako\u0144czona: '#94a3b8',
  completed: '#94a3b8',
  'nie przyszed\u0142': '#ef4444',
  anulowana: '#cbd5e1',
  cancelled: '#cbd5e1',
};

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function normalizeAppointmentStatus(status) {
  return String(status ?? '').trim().toLowerCase();
}

export function formatDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-');
}

export function shiftDateKey(days, baseDate = new Date()) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return formatDateKey(next);
}

export function parseDateKey(dateStr, timeStr = '00:00') {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const [hh, mm] = String(timeStr || '00:00').split(':').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
}

export function getDateTimeValue(dateStr, timeStr = '00:00') {
  return parseDateKey(dateStr, timeStr)?.getTime() ?? 0;
}

export function getDateKeyWeekday(dateStr) {
  return parseDateKey(dateStr)?.getDay() ?? 0;
}

export function appointmentTimestamp(appt) {
  return getDateTimeValue(appt?.date, appt?.time);
}

export function compareAppointmentsAsc(a, b) {
  return appointmentTimestamp(a) - appointmentTimestamp(b);
}

export function compareAppointmentsDesc(a, b) {
  return appointmentTimestamp(b) - appointmentTimestamp(a);
}

export function isCancelledStatus(status) {
  return APPOINTMENT_CANCELLED.has(normalizeAppointmentStatus(status));
}

export function isRevenueStatus(status) {
  return APPOINTMENT_REVENUE.has(normalizeAppointmentStatus(status));
}

export function appointmentStatusLabel(status) {
  const key = normalizeAppointmentStatus(status);
  return APPOINTMENT_STATUS_LABELS[key] || status || 'â€”';
}

export function statusBadgeClass(status) {
  return APPOINTMENT_BADGE_CLASSES[normalizeAppointmentStatus(status)] || 'badge-pending';
}

export function statusDotColor(status) {
  return APPOINTMENT_DOT_COLORS[normalizeAppointmentStatus(status)] || '#6366f1';
}

export function formatTimestamp(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
  return new Intl.DateTimeFormat('pl', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' }).format(d);
}

export function formatDatePl(dateStr) {
  if (!dateStr) return '';
  const safe = String(dateStr).includes('T') ? dateStr : dateStr + 'T12:00:00';
  const date = new Date(safe);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pl', { day:'2-digit', month:'long', year:'numeric' }).format(date);
}

export function statusLabel(s) {
  return appointmentStatusLabel(s);
}

export function getCurrentPage() {
  return new URLSearchParams(location.search).get('page') || 'home';
}

export function getBizId() {
  return new URLSearchParams(location.search).get('id') || '';
}

export function spinner(margin = '3rem auto') {
  return `<div class="spinner" style="margin:${margin}"></div>`;
}

export function emptyState(icon, title, sub, action = '') {
  return `<div class="empty-state">
    <div class="empty-state-icon"><span class="material-icons">${icon}</span></div>
    <h3>${title}</h3><p>${sub}</p>${action}
  </div>`;
}

export function throttle(fn, ms) {
  let last = 0;
  return (...a) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...a); }
  };
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const active = document.activeElement;
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', 'readonly');
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, el.value.length);
    const ok = document.execCommand('copy');
    el.remove();
    active?.focus?.();
    return Promise.resolve(ok);
  } catch {
    return Promise.resolve(false);
  }
}

export function formatPhone(phone) {
  const d = String(phone ?? '').replace(/\D/g, '');
  if (d.length === 9) return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6)}`;
  if (d.length === 11 && d.startsWith('48')) return `+48 ${d.slice(2,5)} ${d.slice(5,8)} ${d.slice(8)}`;
  return phone || '';
}

export function pluralize(n, one, few, many) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}

export function truncate(str, max = 120) {
  if (!str || str.length <= max) return str || '';
  return str.slice(0, max).trimEnd() + '…';
}

export function getInitials(name) {
  return (name || '?').split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function formatDuration(minutes) {
  if (!minutes || minutes < 1) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}min`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export function parseMinutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function smoothScrollTo(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function localStore(key, value) {
  try {
    if (value === undefined) {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch(_) { return null; }
}
