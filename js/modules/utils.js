export function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

  const close = () => overlay.remove();
  const cancel = () => { close(); onCancel?.(); };
  overlay.querySelector('.confirm-cancel').addEventListener('click', cancel);
  overlay.querySelector('.confirm-ok').addEventListener('click', () => { close(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) cancel(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { document.removeEventListener('keydown', esc); cancel(); }
  });
  document.body.appendChild(overlay);
  overlay.querySelector('.confirm-ok').focus();
}

export function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function formatTimestamp(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
  return new Intl.DateTimeFormat('pl', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' }).format(d);
}

export function formatDatePl(dateStr) {
  if (!dateStr) return '';
  const safe = String(dateStr).includes('T') ? dateStr : dateStr + 'T12:00:00';
  return new Intl.DateTimeFormat('pl', { day:'2-digit', month:'long', year:'numeric' }).format(new Date(safe));
}

export function statusLabel(s) {
  return {
    pending:         'Oczekująca',
    zaplanowana:     'Zaplanowana',
    potwierdzona:    'Potwierdzona',
    confirmed:       'Potwierdzona',
    'w trakcie':     'W trakcie',
    zakończona:      'Zakończona',
    completed:       'Zakończona',
    cancelled:       'Anulowana',
    anulowana:       'Anulowana',
    'nie przyszedł': 'Nie przyszedł',
  }[s] || s || '—';
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
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand('copy');
  el.remove();
  return Promise.resolve(ok);
}

export function formatPhone(phone) {
  const d = String(phone ?? '').replace(/\D/g, '');
  if (d.length === 9) return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6)}`;
  if (d.length === 11 && d.startsWith('48')) return `+48 ${d.slice(2,5)} ${d.slice(5,8)} ${d.slice(8)}`;
  return phone || '';
}

export function pluralize(n, one, few, many) {
  const abs = Math.abs(n);
  if (abs === 1) return `${n} ${one}`;
  if (abs >= 2 && abs <= 4) return `${n} ${few}`;
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
