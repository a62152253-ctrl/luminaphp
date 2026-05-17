// admin/clients.js — CRM Klientów
import { db, collection, getDocs, addDoc, updateDoc, doc, query, where, setDoc, getDoc }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

let _bizId, _appts;
let _clients  = [];
let _selected = null;

export async function initClients(bizId, appts) {
  _bizId = bizId;
  _appts = appts;
  await loadClients();
  renderClientList(_clients);
  initSearch();
  window.clientSelectRow = selectClient;
  window.clientSaveNote  = saveNote;
  window.clientSetTag    = setTag;
}

async function loadClients() {
  // Build client list from appointments + merge with stored client docs
  const map = {};
  _appts.forEach(a => {
    const key = a.clientPhone || a.userId || a.clientName;
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        key, name: a.clientName || a.userName || 'Klient',
        phone: a.clientPhone || '', email: a.clientEmail || '',
        appts: [], spent: 0, tags: [], notes: ''
      };
    }
    map[key].appts.push(a);
    if (['confirmed','zakończona','completed'].includes(a.status)) {
      map[key].spent += Number(a.price) || 0;
    }
  });

  // Load stored notes/tags from Firestore clients collection
  try {
    const q = query(collection(db, 'clients'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    snap.docs.forEach(d => {
      const data = d.data();
      const key  = data.phone || data.key;
      if (map[key]) {
        map[key].docId = d.id;
        map[key].tags  = data.tags || [];
        map[key].notes = data.notes || '';
        if (data.name) map[key].name = data.name;
      }
    });
  } catch(e) {}

  _clients = Object.values(map).sort((a, b) => b.appts.length - a.appts.length);
}

function renderClientList(clients) {
  const el = document.getElementById('clientsList');
  if (!el) return;

  if (!clients.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">people</span>
      <p>Brak klientów. Pojawią się po pierwszych rezerwacjach.</p></div>`;
    return;
  }

  el.innerHTML = `
    <div class="clients-layout">
      <div class="clients-list-col">
        ${clients.map(c => clientRow(c)).join('')}
      </div>
      <div class="clients-detail-col" id="clientDetail">
        <div class="biz-empty" style="margin-top:4rem">
          <span class="material-icons">person</span>
          <p>Wybierz klienta z listy</p>
        </div>
      </div>
    </div>`;
}

function clientRow(c) {
  const tagHtml = c.tags.map(t => `<span class="client-tag client-tag-${t}">${tagLabel(t)}</span>`).join('');
  const lastAppt = [...c.appts].sort((a,b) => b.date > a.date ? 1 : -1)[0];
  return `<div class="client-row ${_selected?.key === c.key ? 'active' : ''}"
    onclick="clientSelectRow('${esc(c.key)}')">
    <div class="client-row-avatar">${esc(c.name[0] || '?')}</div>
    <div class="client-row-info">
      <div class="client-row-name">${esc(c.name)} ${tagHtml}</div>
      <div class="client-row-meta">${c.appts.length} wizyt · ${c.spent} zł · ${lastAppt ? formatDate(lastAppt.date) : ''}</div>
    </div>
  </div>`;
}

function selectClient(key) {
  _selected = _clients.find(c => c.key === key);
  if (!_selected) return;

  // Re-render list to highlight selection
  document.querySelectorAll('.client-row').forEach(r => r.classList.remove('active'));
  document.querySelector(`.client-row[onclick*="${CSS.escape(key)}"]`)?.classList.add('active');

  renderClientDetail(_selected);
}

function renderClientDetail(c) {
  const el = document.getElementById('clientDetail');
  if (!el) return;

  const completed = c.appts.filter(a => ['confirmed','zakończona','completed'].includes(a.status));
  const avgGap    = calcAvgGap(c.appts);
  const sorted    = [...c.appts].sort((a,b) => b.date > a.date ? 1 : -1);

  el.innerHTML = `
    <div class="client-detail-header">
      <div class="client-detail-avatar">${esc(c.name[0] || '?')}</div>
      <div>
        <h3 class="client-detail-name">${esc(c.name)}</h3>
        <div class="client-detail-contact">
          ${c.phone ? `<span class="material-icons" style="font-size:1rem">phone</span> ${esc(c.phone)}` : ''}
          ${c.email ? `<span class="material-icons" style="font-size:1rem;margin-left:.75rem">email</span> ${esc(c.email)}` : ''}
        </div>
      </div>
    </div>

    <div class="client-tags-row">
      <button class="client-tag-btn ${c.tags.includes('vip')?'active':''}"
        onclick="clientSetTag('${esc(c.key)}','vip')">
        <span class="material-icons" style="font-size:.875rem">star</span> VIP
      </button>
      <button class="client-tag-btn ${c.tags.includes('problematic')?'active red':''}"
        onclick="clientSetTag('${esc(c.key)}','problematic')">
        <span class="material-icons" style="font-size:.875rem">warning</span> Problematyczny
      </button>
    </div>

    <div class="client-stats-grid">
      <div class="client-stat"><div class="client-stat-val">${c.appts.length}</div><div class="client-stat-label">Wizyt łącznie</div></div>
      <div class="client-stat"><div class="client-stat-val">${completed.length}</div><div class="client-stat-label">Zakończonych</div></div>
      <div class="client-stat"><div class="client-stat-val">${c.spent} zł</div><div class="client-stat-label">Wydał łącznie</div></div>
      <div class="client-stat"><div class="client-stat-val">${avgGap}</div><div class="client-stat-label">Śr. co ile dni</div></div>
    </div>

    <div class="client-notes-section">
      <label style="font-size:.6875rem;font-weight:700;color:var(--zinc-500);text-transform:uppercase;letter-spacing:.08em">Notatki</label>
      <textarea id="clientNoteArea" class="settings-input" rows="3"
        placeholder="Prywatne notatki o kliencie...">${esc(c.notes)}</textarea>
      <button class="btn btn-accent" style="margin-top:.5rem;padding:.5rem 1rem;font-size:.75rem"
        onclick="clientSaveNote('${esc(c.key)}')">Zapisz notatki</button>
    </div>

    <div class="client-history-section">
      <h4 style="font-size:.875rem;font-weight:700;color:var(--zinc-700);margin-bottom:1rem">Historia wizyt</h4>
      ${sorted.slice(0,10).map(a => `
        <div class="client-hist-row">
          <div class="client-hist-date">${formatDate(a.date)} ${a.time||''}</div>
          <div class="client-hist-svc">${esc(a.serviceName||a.service||'—')}</div>
          <div class="client-hist-price">${a.price ? a.price+' zł' : ''}</div>
          <span class="biz-status-badge ${statusColor(a.status)}">${statusLabel(a.status)}</span>
        </div>`).join('')}
    </div>`;
}

async function saveNote(key) {
  const c    = _clients.find(x => x.key === key);
  if (!c) return;
  const note = document.getElementById('clientNoteArea')?.value || '';
  c.notes = note;
  try {
    if (c.docId) {
      await updateDoc(doc(db, 'clients', c.docId), { notes: note });
    } else {
      const ref = await addDoc(collection(db, 'clients'), {
        businessId: _bizId, key, name: c.name, phone: c.phone,
        email: c.email, tags: c.tags, notes: note
      });
      c.docId = ref.id;
    }
    toast('Notatka zapisana');
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

async function setTag(key, tag) {
  const c = _clients.find(x => x.key === key);
  if (!c) return;
  const idx = c.tags.indexOf(tag);
  if (idx === -1) c.tags.push(tag); else c.tags.splice(idx, 1);
  try {
    if (c.docId) {
      await updateDoc(doc(db, 'clients', c.docId), { tags: c.tags });
    } else {
      const ref = await addDoc(collection(db, 'clients'), {
        businessId: _bizId, key, name: c.name, phone: c.phone,
        email: c.email, tags: c.tags, notes: c.notes
      });
      c.docId = ref.id;
    }
    renderClientDetail(c);
    toast(idx === -1 ? 'Tag dodany' : 'Tag usunięty');
  } catch(e) { toast('Błąd', 'error'); }
}

function initSearch() {
  const inp = document.getElementById('clientSearch');
  if (!inp) return;
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase();
    const filtered = _clients.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q));
    const col = document.querySelector('.clients-list-col');
    if (col) col.innerHTML = filtered.map(c => clientRow(c)).join('');
  });
}

// helpers
function calcAvgGap(appts) {
  const dates = appts.map(a => a.date).filter(Boolean).sort();
  if (dates.length < 2) return '—';
  let total = 0;
  for (let i = 1; i < dates.length; i++) {
    total += (new Date(dates[i]) - new Date(dates[i-1])) / 86400000;
  }
  return Math.round(total / (dates.length - 1)) + ' dni';
}
function tagLabel(t) {
  return { vip: 'VIP', problematic: 'Problematyczny' }[t] || t;
}
function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}
const esc = s => String(s ?? '').replace(/</g, '&lt;');
function statusColor(s) {
  const m = { pending:'badge-pending', zaplanowana:'badge-planned', potwierdzona:'badge-confirmed',
    confirmed:'badge-confirmed', 'w trakcie':'badge-inprogress', zakończona:'badge-done',
    completed:'badge-done', cancelled:'badge-cancelled', anulowana:'badge-cancelled',
    'nie przyszedł':'badge-noshow' };
  return m[s] || 'badge-pending';
}
function statusLabel(s) {
  const m = { pending:'Oczekująca', zaplanowana:'Zaplanowana', potwierdzona:'Potwierdzona',
    confirmed:'Potwierdzona', 'w trakcie':'W trakcie', zakończona:'Zakończona',
    completed:'Zakończona', cancelled:'Anulowana', anulowana:'Anulowana',
    'nie przyszedł':'Nie przyszedł' };
  return m[s] || s || '—';
}
