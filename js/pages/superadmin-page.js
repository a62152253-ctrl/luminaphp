import { db, collection, getDocs, query, orderBy, limit,
         doc, updateDoc, deleteDoc, where }
  from '../firebase-config.js';

// ── State ──────────────────────────────────────────────────────────────────
let _users       = [];
let _businesses  = [];
let _appts       = [];
let _loaded      = {};

// ── Init ───────────────────────────────────────────────────────────────────
export async function initSuperadmin() {
  initNav();
  initLogout();

  document.getElementById('saRefreshBtn')?.addEventListener('click', () => {
    _loaded = {};
    _users = []; _businesses = []; _appts = [];
    loadOverview();
  });

  await loadOverview();
}

// ── Navigation ─────────────────────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.sa-nav-link[data-satab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.dataset.satab;
      if (tab) switchTab(tab);
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.sa-nav-link[data-satab]').forEach(l =>
    l.classList.toggle('active', l.dataset.satab === tab));
  document.querySelectorAll('.sa-tab[data-satab]').forEach(t =>
    t.classList.toggle('hidden', t.dataset.satab !== tab));

  if (_loaded[tab]) return;
  _loaded[tab] = true;

  switch (tab) {
    case 'overview':     loadOverview();     break;
    case 'users':        loadUsersTab();     break;
    case 'businesses':   loadBizTab();       break;
    case 'appointments': loadApptsTab();     break;
    case 'marketplace':  loadMarketTab();    break;
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────
function initLogout() {
  document.getElementById('saLogoutBtn')?.addEventListener('click', async e => {
    e.preventDefault();
    try {
      const res = await fetch('/luminaphp/api/superadmin-auth.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'logout' }),
      });
      const json = await res.json();
      if (json.ok) window.location.reload();
    } catch { window.location.reload(); }
  });
}

// ── Data loaders ───────────────────────────────────────────────────────────
async function fetchAll(colName, ...constraints) {
  try {
    const q = constraints.length
      ? query(collection(db, colName), ...constraints)
      : collection(db, colName);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.warn(`fetchAll(${colName}):`, e?.message);
    return [];
  }
}

async function ensureUsers() {
  if (!_users.length) _users = await fetchAll('users');
}
async function ensureBusinesses() {
  if (!_businesses.length) _businesses = await fetchAll('businesses');
}
async function ensureAppts() {
  if (!_appts.length) _appts = await fetchAll('appointments');
}

// ── Overview ───────────────────────────────────────────────────────────────
async function loadOverview() {
  await Promise.all([ensureUsers(), ensureBusinesses(), ensureAppts()]);

  const clients    = _users.filter(u => u.role === 'client');
  const bizOwners  = _users.filter(u => u.role === 'business');
  const verified   = _businesses.filter(b => b.verificationStatus === 'verified');
  const published  = _businesses.filter(b => b.isPublished);

  setText('kpiUsers',      _users.length);
  setText('kpiBusinesses', _businesses.length);
  setText('kpiAppts',      _appts.length);
  setText('kpiVerified',   verified.length);
  setText('kpiClients',    clients.length);
  setText('kpiPublished',  published.length);

  setBadge('saBadgeUsers',      _users.length);
  setBadge('saBadgeBusinesses', _businesses.length);
  setBadge('saBadgeAppts',      _appts.length);

  // Recent users (last 8 by createdAt)
  const recentUsers = [..._users]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 8);

  const ruEl = document.getElementById('saRecentUsers');
  if (ruEl) ruEl.innerHTML = recentUsers.length
    ? recentUsers.map(u => `
        <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <img src="${u.photoURL || avatarUrl(u.displayName)}" class="sa-user-row-avatar"
            onerror="this.src='${avatarUrl(u.displayName)}'">
          <div style="flex:1;min-width:0">
            <div style="color:#fff;font-size:.8125rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${esc(u.displayName || '—')}
            </div>
            <div style="color:rgba(255,255,255,.4);font-size:.75rem">${esc(u.email || '—')}</div>
          </div>
          <span class="sa-badge ${u.role === 'business' ? 'sa-badge-business' : 'sa-badge-client'}">
            ${u.role === 'business' ? 'Salon' : 'Klient'}
          </span>
        </div>`).join('')
    : '<div class="sa-empty">Brak użytkowników</div>';

  // Recent businesses (last 6)
  const recentBiz = [..._businesses]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 6);

  const rbEl = document.getElementById('saRecentBusinesses');
  if (rbEl) rbEl.innerHTML = recentBiz.length
    ? recentBiz.map(b => `
        <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="width:2rem;height:2rem;border-radius:.5rem;background:rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="material-icons" style="font-size:1rem;color:#a5b4fc">storefront</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="color:#fff;font-size:.8125rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${esc(b.name || '—')}
            </div>
            <div style="color:rgba(255,255,255,.4);font-size:.75rem">${esc(b.city || '—')} · ${esc(b.category || '—')}</div>
          </div>
          <span class="sa-badge ${b.isPublished ? 'sa-badge-ok' : 'sa-badge-gray'}">
            ${b.isPublished ? 'Live' : 'Robocze'}
          </span>
        </div>`).join('')
    : '<div class="sa-empty">Brak salonów</div>';
}

// ── Users Tab ──────────────────────────────────────────────────────────────
async function loadUsersTab() {
  await ensureUsers();
  renderUsersTable(_users, '', '');

  const searchEl = document.getElementById('saUserSearch');
  searchEl?.addEventListener('input', () => {
    const role = document.querySelector('.sa-filter-btn.active[data-urole]')?.dataset.urole ?? '';
    renderUsersTable(_users, searchEl.value, role);
  });

  document.querySelectorAll('.sa-filter-btn[data-urole]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sa-filter-btn[data-urole]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderUsersTable(_users, searchEl?.value ?? '', btn.dataset.urole);
    });
  });
}

function renderUsersTable(users, search, role) {
  const q = search.toLowerCase();
  let filtered = users.filter(u => {
    if (role && u.role !== role) return false;
    if (q && !`${u.displayName} ${u.email}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const el = document.getElementById('saUsersTable');
  if (!el) return;

  if (!filtered.length) { el.innerHTML = '<div class="sa-empty">Brak wyników</div>'; return; }

  el.innerHTML = `
    <table class="sa-table">
      <thead><tr>
        <th>Użytkownik</th>
        <th>E-mail</th>
        <th>Rola</th>
        <th>Rejestracja</th>
        <th>UID</th>
      </tr></thead>
      <tbody>
        ${filtered.map(u => `
          <tr>
            <td style="display:flex;align-items:center;gap:.625rem">
              <img src="${u.photoURL || avatarUrl(u.displayName)}" class="sa-user-row-avatar"
                onerror="this.src='${avatarUrl(u.displayName)}'">
              <span>${esc(u.displayName || '—')}</span>
            </td>
            <td>${esc(u.email || '—')}</td>
            <td><span class="sa-badge ${u.role === 'business' ? 'sa-badge-business' : u.role === 'client' ? 'sa-badge-client' : 'sa-badge-gray'}">
              ${u.role || '—'}
            </span></td>
            <td>${fmtDate(u.createdAt)}</td>
            <td style="font-family:monospace;font-size:.7rem;color:rgba(255,255,255,.3)">${u.id.slice(0,12)}…</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ── Businesses Tab ─────────────────────────────────────────────────────────
async function loadBizTab() {
  await ensureBusinesses();
  renderBizTable(_businesses, '', '');

  const searchEl = document.getElementById('saBizSearch');
  searchEl?.addEventListener('input', () => {
    const f = document.querySelector('.sa-filter-btn.active[data-bfilter]')?.dataset.bfilter ?? '';
    renderBizTable(_businesses, searchEl.value, f);
  });

  document.querySelectorAll('.sa-filter-btn[data-bfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sa-filter-btn[data-bfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBizTable(_businesses, searchEl?.value ?? '', btn.dataset.bfilter);
    });
  });
}

function renderBizTable(businesses, search, filter) {
  const q = search.toLowerCase();
  let filtered = businesses.filter(b => {
    if (filter === 'published' && !b.isPublished) return false;
    if (filter === 'draft'     && (b.isPublished || b.onboardingStatus !== 'draft')) return false;
    if (filter === 'verified'  && b.verificationStatus !== 'verified') return false;
    if (q && !`${b.name} ${b.city} ${b.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const el = document.getElementById('saBusinessesTable');
  if (!el) return;

  if (!filtered.length) { el.innerHTML = '<div class="sa-empty">Brak wyników</div>'; return; }

  el.innerHTML = `
    <table class="sa-table">
      <thead><tr>
        <th>Nazwa</th>
        <th>Branża</th>
        <th>Miasto</th>
        <th>Status</th>
        <th>Weryfikacja</th>
        <th>Ocena</th>
        <th>Akcje</th>
      </tr></thead>
      <tbody>
        ${filtered.map(b => `
          <tr>
            <td><strong>${esc(b.name || '—')}</strong></td>
            <td>${esc(b.category || '—')}</td>
            <td>${esc(b.city || '—')}</td>
            <td><span class="sa-badge ${b.isPublished ? 'sa-badge-ok' : 'sa-badge-gray'}">
              ${b.isPublished ? 'Live' : 'Robocze'}
            </span></td>
            <td><span class="sa-badge ${b.verificationStatus === 'verified' ? 'sa-badge-ok' : b.verificationStatus === 'pending' ? 'sa-badge-warn' : 'sa-badge-gray'}">
              ${esc(b.verificationStatus || 'unverified')}
            </span></td>
            <td>${b.rating ? Number(b.rating).toFixed(1) + ' ★' : '—'}</td>
            <td style="white-space:nowrap">
              <button class="sa-action-btn" onclick="saTogglePublish('${b.id}', ${b.isPublished})">
                ${b.isPublished ? 'Ukryj' : 'Opublikuj'}
              </button>
              <button class="sa-action-btn" onclick="saVerifyBiz('${b.id}', '${b.verificationStatus}')">
                Weryfikuj
              </button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

window.saTogglePublish = async (bizId, isPublished) => {
  try {
    await updateDoc(doc(db, 'businesses', bizId), { isPublished: !isPublished });
    const biz = _businesses.find(b => b.id === bizId);
    if (biz) biz.isPublished = !isPublished;
    renderBizTable(_businesses, document.getElementById('saBizSearch')?.value ?? '',
      document.querySelector('.sa-filter-btn.active[data-bfilter]')?.dataset.bfilter ?? '');
  } catch(e) { alert('Błąd: ' + e.message); }
};

window.saVerifyBiz = async (bizId, current) => {
  const next = current === 'verified' ? 'unverified' : 'verified';
  try {
    await updateDoc(doc(db, 'businesses', bizId), { verificationStatus: next });
    const biz = _businesses.find(b => b.id === bizId);
    if (biz) biz.verificationStatus = next;
    renderBizTable(_businesses, document.getElementById('saBizSearch')?.value ?? '',
      document.querySelector('.sa-filter-btn.active[data-bfilter]')?.dataset.bfilter ?? '');
  } catch(e) { alert('Błąd: ' + e.message); }
};

// ── Appointments Tab ───────────────────────────────────────────────────────
async function loadApptsTab() {
  await Promise.all([ensureAppts(), ensureBusinesses()]);
  renderApptsTable(_appts, '', '');

  const searchEl = document.getElementById('saApptSearch');
  searchEl?.addEventListener('input', () => {
    const s = document.querySelector('.sa-filter-btn.active[data-astatus]')?.dataset.astatus ?? '';
    renderApptsTable(_appts, searchEl.value, s);
  });

  document.querySelectorAll('.sa-filter-btn[data-astatus]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sa-filter-btn[data-astatus]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderApptsTable(_appts, searchEl?.value ?? '', btn.dataset.astatus);
    });
  });
}

function renderApptsTable(appts, search, status) {
  const q = search.toLowerCase();
  let filtered = appts.filter(a => {
    if (status && a.status !== status) return false;
    if (q && !`${a.clientName} ${a.businessId}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const el = document.getElementById('saApptsTable');
  if (!el) return;
  if (!filtered.length) { el.innerHTML = '<div class="sa-empty">Brak wyników</div>'; return; }

  const bizMap = Object.fromEntries(_businesses.map(b => [b.id, b.name]));

  filtered = filtered.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

  el.innerHTML = `
    <table class="sa-table">
      <thead><tr>
        <th>Klient</th>
        <th>Salon</th>
        <th>Usługa</th>
        <th>Data</th>
        <th>Cena</th>
        <th>Status</th>
      </tr></thead>
      <tbody>
        ${filtered.slice(0, 200).map(a => `
          <tr>
            <td>${esc(a.clientName || a.clientEmail || '—')}</td>
            <td>${esc(bizMap[a.businessId] || a.businessId?.slice(0,10) || '—')}</td>
            <td>${esc(a.serviceName || '—')}</td>
            <td>${esc(a.date || '—')} ${esc(a.time || '')}</td>
            <td>${a.price ? Number(a.price).toFixed(0) + ' zł' : '—'}</td>
            <td><span class="sa-badge ${statusBadge(a.status)}">${esc(a.status || '—')}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>
    ${filtered.length > 200 ? `<div class="sa-empty">Pokazano 200 z ${filtered.length}</div>` : ''}`;
}

// ── Marketplace Tab ────────────────────────────────────────────────────────
async function loadMarketTab() {
  await ensureBusinesses();
  const bizMap = Object.fromEntries(_businesses.map(b => [b.id, b.name]));

  const [flashDeals, promos] = await Promise.all([
    fetchAll('flashDeals'),
    fetchAll('promos'),
  ]);

  const fdEl = document.getElementById('saFlashDeals');
  if (fdEl) fdEl.innerHTML = flashDeals.length
    ? flashDeals.map(f => `
        <div style="padding:.625rem 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="color:#fff;font-size:.8125rem;font-weight:600">${esc(f.serviceName || '—')}</div>
          <div style="color:rgba(255,255,255,.4);font-size:.75rem">
            ${esc(bizMap[f.businessId] || '—')} · ${f.discountPct || 0}% rabat · Wygasa: ${esc(f.expires || '—')}
          </div>
        </div>`).join('')
    : '<div class="sa-empty">Brak Flash Deals</div>';

  const prEl = document.getElementById('saPromos');
  if (prEl) prEl.innerHTML = promos.length
    ? promos.map(p => `
        <div style="padding:.625rem 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="color:#fff;font-size:.8125rem;font-weight:600">${esc(p.title || '—')}</div>
          <div style="color:rgba(255,255,255,.4);font-size:.75rem">
            ${esc(bizMap[p.businessId] || '—')} · ${p.discountPrice || 0} zł (było ${p.originalPrice || 0} zł)
          </div>
        </div>`).join('')
    : '<div class="sa-empty">Brak promocji</div>';
}

// ── Helpers ────────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setBadge(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name||'U')}&background=6366f1&color=fff`;
}

function fmtDate(ts) {
  if (!ts?.seconds) return '—';
  return new Date(ts.seconds * 1000).toLocaleDateString('pl-PL');
}

function statusBadge(status) {
  const map = {
    'zaplanowana':  'sa-badge-client',
    'potwierdzona': 'sa-badge-ok',
    'w trakcie':    'sa-badge-warn',
    'zakończona':   'sa-badge-gray',
    'anulowana':    'sa-badge-err',
    'nie przyszedł':'sa-badge-err',
  };
  return map[status] ?? 'sa-badge-gray';
}
