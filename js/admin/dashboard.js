// admin/dashboard.js — Panel główny (home)
import { db, collection, getDocs, query, where, orderBy, limit }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

const TODAY = new Date().toISOString().slice(0, 10);

export function initDashboard(bizId, bizDoc, appts, staff) {
  renderGreeting(bizDoc);
  renderDashboardStats(appts);
  renderUpcoming(appts);
  renderQuickActions();
  renderStaffOccupancy(appts, staff);
}

function renderGreeting(bizDoc) {
  const el = document.getElementById('overviewGreeting');
  if (!el) return;
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Dzień dobry' : h < 18 ? 'Dobre popołudnie' : 'Dobry wieczór';
  const name = window.App?.user?.displayName?.split(' ')[0] || bizDoc?.name || '';
  el.textContent = name ? `${greeting}, ${name}!` : `${greeting}!`;
}

function renderDashboardStats(appts) {
  const todayAppts  = appts.filter(a => a.date === TODAY);
  const pending     = appts.filter(a => a.status === 'pending' || a.status === 'zaplanowana');
  const todayRev    = todayAppts
    .filter(a => a.status === 'zakończona' || a.status === 'completed' || a.status === 'confirmed')
    .reduce((s, a) => s + (Number(a.price) || 0), 0);

  _set('hStatToday',   todayAppts.length);
  _set('hStatPending', pending.length);
  _set('hStatRevenue', todayRev + ' zł');
  _set('hStatTotal',   appts.length);
}

function renderUpcoming(appts) {
  const el = document.getElementById('hUpcomingList');
  if (!el) return;

  const now    = new Date();
  const nowStr = now.toISOString().slice(0, 10);
  const upcoming = appts
    .filter(a => {
      if (!a.date) return false;
      if (a.date < nowStr) return false;
      if (a.status === 'cancelled' || a.status === 'anulowana') return false;
      return true;
    })
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)
    .slice(0, 6);

  if (!upcoming.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">event_available</span>
      <p>Brak nadchodzących wizyt</p>
    </div>`;
    return;
  }

  el.innerHTML = upcoming.map(a => {
    const statusCls = statusColor(a.status);
    return `<div class="h-appt-row">
      <div class="h-appt-time">${a.time || '—'}</div>
      <div class="h-appt-info">
        <div class="h-appt-client">${esc(a.clientName || a.userName || 'Klient')}</div>
        <div class="h-appt-svc">${esc(a.serviceName || a.service || '—')} · ${esc(a.staffName || '')}</div>
      </div>
      <div class="h-appt-date">${formatDate(a.date)}</div>
      <span class="biz-status-badge ${statusCls}">${statusLabel(a.status)}</span>
    </div>`;
  }).join('');
}

function renderQuickActions() {
  const el = document.getElementById('hQuickActions');
  if (!el) return;
  el.innerHTML = `
    <button class="h-quick-btn" onclick="window.adminSwitchTab('calendar')">
      <span class="material-icons">add_circle</span>
      <span>Dodaj wizytę</span>
    </button>
    <button class="h-quick-btn" onclick="window.adminSwitchTab('clients')">
      <span class="material-icons">person_add</span>
      <span>Dodaj klienta</span>
    </button>
    <button class="h-quick-btn" onclick="window.adminSwitchTab('services')">
      <span class="material-icons">content_cut</span>
      <span>Dodaj usługę</span>
    </button>
    <button class="h-quick-btn" onclick="window.adminSwitchTab('offers')">
      <span class="material-icons">local_offer</span>
      <span>Nowa oferta</span>
    </button>`;
}

function renderStaffOccupancy(appts, staff) {
  const el = document.getElementById('hStaffOccupancy');
  if (!el || !staff.length) return;

  const todayAppts = appts.filter(a => a.date === TODAY);
  el.innerHTML = `<h3 style="font-size:.875rem;font-weight:700;color:var(--zinc-700);margin-bottom:1rem">Pracownicy dziś</h3>` +
    staff.map(s => {
      const count = todayAppts.filter(a => a.staffId === s.id || a.staffName === s.name).length;
      return `<div class="h-staff-row">
        <div class="h-staff-dot" style="background:${s.color || '#6366f1'}"></div>
        <div class="h-staff-name">${esc(s.name)}</div>
        <div class="h-staff-count">${count} wizyt${count === 1 ? 'a' : count < 5 ? 'y' : ''}</div>
      </div>`;
    }).join('');
}

// helpers
function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
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
function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}.${m}`;
}
