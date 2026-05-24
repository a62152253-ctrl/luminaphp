// admin-page.js — koordynator, importuje 13 modułów
import { db, collection, getDocs, query, where, doc, getDoc }
  from '../firebase-config.js';
import { formatDateKey, isRevenueStatus, toast } from '../modules/utils.js';
import { exportAppointmentsCSV } from '../modules/csv-export.js';

import { initDashboard }  from '../admin/dashboard.js';
import { initCalendar }   from '../admin/calendar.js';
import { initClients }    from '../admin/clients.js';
import { initServices }   from '../admin/services.js';
import { initStaff }      from '../admin/staff.js';
import { initReports }    from '../admin/reports.js';
import { initOffers }     from '../admin/offers.js';
import { initReviews }    from '../admin/reviews.js';
import { initPortfolio }  from '../admin/portfolio.js';
import { initSettings }   from '../admin/settings.js';
import { initWaitlist }   from '../admin/waitlist.js';
import { initMarketing }  from '../admin/marketing.js';
import { initWidget }     from '../admin/widget.js';

let _bizId, _bizDoc;
let _appts    = [];
let _services = [];
let _staff    = [];
let _loaded   = {};   // which tabs have been initialized

// ===== INIT =====
export async function initAdmin() {
  const user = window.App?.user;
  if (!user) { renderPrompt('lock', 'Zaloguj się', 'Musisz być zalogowany jako właściciel salonu.'); return; }

  const userDoc = window.App?.userDoc;
  _bizId = userDoc?.businessId || user.uid;

  try {
    const snap = await getDoc(doc(db, 'businesses', _bizId));
    _bizDoc = snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch(e) { _bizDoc = null; }

  if (!_bizDoc) { window.location.href = '/luminaphp/?page=setup'; return; }

  // Guard: profil musi być ukończony
  if (!_bizDoc.profileComplete) {
    window.location.href = '/luminaphp/?page=setup';
    return;
  }

  // Load core data — services/staff live in subcollections under businesses/{bizId}
  [_appts, _services, _staff] = await Promise.all([
    loadCollection('appointments', where('businessId', '==', _bizId)),
    loadSubcollection(_bizId, 'services'),
    loadSubcollection(_bizId, 'staff'),
  ]);

  renderAdminShell();
  initTabs();

  // Default tab: dashboard
  switchTab('home');

  window.adminSwitchTab = switchTab;
  window.exportAppts    = () => exportAppointmentsCSV(_appts, _bizDoc?.name || '');
}

// ===== TABS =====
function initTabs() {
  document.querySelectorAll('.biz-nav-link[data-btab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.btab);
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.biz-nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.btab === tab));
  document.querySelectorAll('.biz-tab').forEach(t =>
    t.classList.toggle('hidden', t.dataset.btab !== tab));

  if (_loaded[tab]) return;
  _loaded[tab] = true;

  switch (tab) {
    case 'home':        initDashboard(_bizId, _bizDoc, _appts, _staff); break;
    case 'calendar':    initCalendar(_bizId, _appts, _staff, _services); break;
    case 'clients':     initClients(_bizId, _appts); break;
    case 'services':    initServices(_bizId, _services); break;
    case 'staff':       initStaff(_bizId, _staff, _appts); break;
    case 'reports':     initReports(_appts, _services, _staff); break;
    case 'offers':      initOffers(_bizId, _bizDoc); break;
    case 'bizreviews':  initReviews(_bizId); break;
    case 'portfolio':   initPortfolio(_bizId); break;
    case 'settings':    initSettings(_bizId, _bizDoc); break;
    case 'waitlist':    initWaitlist(_bizId); break;
    case 'marketing':   initMarketing(_bizId, _appts); break;
    case 'widget':      initWidget(_bizId, _bizDoc); break;
  }
}

// ===== SHELL (sidebar info) =====
function renderAdminShell() {
  const nameEl   = document.getElementById('adminBizName');
  const avatarEl = document.getElementById('adminUserAvatar');
  const userEl   = document.getElementById('adminUserName');
  const catEl    = document.getElementById('adminBizCategory');

  if (nameEl)   nameEl.textContent = _bizDoc.name    || 'Mój Salon';
  if (catEl)    catEl.textContent  = _bizDoc.category || '';
  if (userEl)   userEl.textContent = window.App.user?.displayName || window.App.user?.email || '';
  if (avatarEl) {
    const u = window.App.user;
    avatarEl.src = u?.photoURL || '';
    avatarEl.onerror = () => {
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.displayName||'A')}&background=6366f1&color=fff`;
      avatarEl.onerror = null;
    };
  }

  // Stats bar
  const today = formatDateKey();
  const todayAppts = _appts.filter(a => a.date === today);
  const pending    = _appts.filter(a => a.status === 'pending' || a.status === 'zaplanowana');
  const revenue    = todayAppts.filter(a =>
    isRevenueStatus(a.status))
    .reduce((s,a) => s + (Number(a.price)||0), 0);

  _setText('adminStatToday',   todayAppts.length);
  _setText('adminStatRevenue', revenue + ' zł');
  _setText('adminStatPending', pending.length);
  _setText('adminStatTotal',   _appts.length);

  // Pending badge
  const badge = document.getElementById('pendingBadge');
  if (badge) {
    badge.textContent = pending.length;
    badge.classList.toggle('hidden', !pending.length);
  }
}

// ===== HELPERS =====
async function loadCollection(name, ...constraints) {
  try {
    const q    = query(collection(db, name), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    if (e?.code !== 'permission-denied') console.warn(`loadCollection(${name}):`, e?.message);
    return [];
  }
}

async function loadSubcollection(bizId, name) {
  try {
    const snap = await getDocs(collection(db, 'businesses', bizId, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    if (e?.code !== 'permission-denied') console.warn(`loadSubcollection(${name}):`, e?.message);
    return [];
  }
}

function renderPrompt(icon, title, msg) {
  const el = document.getElementById('adminContent');
  if (el) el.innerHTML = `
    <div class="empty-state" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="empty-state-icon"><span class="material-icons">${icon}</span></div>
      <h3>${title}</h3><p>${msg}</p>
    </div>`;
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
