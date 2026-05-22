// admin/waitlist.js — Lista oczekujących
import { db, collection, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

let _bizId;

export async function initWaitlist(bizId) {
  _bizId = bizId;
  await renderWaitlist();
  window.waitlistNotify = notifyClient;
  window.waitlistRemove = removeEntry;
}

async function renderWaitlist() {
  const el = document.getElementById('waitlistEntries');
  if (!el) return;

  let entries = [];
  try {
    const q = query(
      collection(db, 'waitlist'),
      where('businessId', '==', _bizId)
    );
    const snap = await getDocs(q);
    entries = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
  } catch(e) {}

  const badge = document.getElementById('waitlistBadge');
  if (badge) {
    badge.textContent = entries.length;
    badge.classList.toggle('hidden', !entries.length);
  }
  const countEl = document.getElementById('waitlistCountBadge');
  if (countEl) countEl.textContent = entries.length + ' wpisów';

  if (!entries.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">queue</span>
      <p>Lista oczekujących jest pusta.</p>
      <p style="font-size:.75rem;color:var(--zinc-400)">Klienci trafiają tu po kliknięciu „Lista oczekujących" w panelu klienta.</p>
    </div>`;
    return;
  }

  el.innerHTML = `<div class="waitlist-grid">${entries.map(e => waitlistCard(e)).join('')}</div>`;
}

function waitlistCard(e) {
  const createdDate = e.createdAt?.toDate?.()?.toLocaleDateString('pl-PL') || '—';
  const prefDate    = e.preferredDate
    ? formatDate(e.preferredDate)
    : '—';
  const statusHtml  = e.notified
    ? `<span class="wl-badge wl-notified"><span class="material-icons" style="font-size:.75rem">check_circle</span> Powiadomiony</span>`
    : `<span class="wl-badge wl-waiting"><span class="material-icons" style="font-size:.75rem">schedule</span> Oczekuje</span>`;

  return `<div class="waitlist-card">
    <div class="wl-card-header">
      <div class="wl-avatar">${esc(e.clientName?.[0] || '?')}</div>
      <div class="wl-card-info">
        <div class="wl-name">${esc(e.clientName || 'Klient')}</div>
        <div class="wl-meta">
          <span class="material-icons" style="font-size:.875rem">content_cut</span>
          ${esc(e.salon || e.service || '—')}
          ${e.preferredDate ? ` · <span class="material-icons" style="font-size:.875rem">event</span> ${prefDate}` : ''}
        </div>
      </div>
      ${statusHtml}
    </div>
    ${e.note ? `<div class="wl-note">"${esc(e.note)}"</div>` : ''}
    <div class="wl-footer">
      <span class="wl-date"><span class="material-icons" style="font-size:.75rem;vertical-align:middle">add_circle_outline</span> Dodano ${createdDate}</span>
      <div class="wl-actions">
        ${!e.notified ? `<button class="btn btn-accent btn-sm" onclick="waitlistNotify('${e.id}')">
          <span class="material-icons">notifications_active</span> Powiadom
        </button>` : `<button class="btn btn-ghost btn-sm" onclick="waitlistNotify('${e.id}')">
          <span class="material-icons">refresh</span> Powiadom ponownie
        </button>`}
        <button class="btn btn-ghost btn-sm" style="color:#ef4444" onclick="waitlistRemove('${e.id}')">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>
  </div>`;
}

async function notifyClient(id) {
  try {
    await updateDoc(doc(db, 'waitlist', id), {
      notified: true,
      notifiedAt: new Date(),
    });
    toast('Klient oznaczony jako powiadomiony');
    await renderWaitlist();
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

async function removeEntry(id) {
  if (!confirm('Usunąć wpis z listy oczekujących?')) return;
  try {
    await deleteDoc(doc(db, 'waitlist', id));
    toast('Wpis usunięty');
    await renderWaitlist();
  } catch(e) { toast('Błąd', 'error'); }
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}
const esc = s => String(s ?? '').replace(/</g, '&lt;');
