// admin/dashboard.js — Panel główny (home) v2
import {
  appointmentStatusLabel,
  compareAppointmentsAsc,
  formatDateKey,
  isCancelledStatus,
  isRevenueStatus,
  pluralize,
  shiftDateKey,
  statusBadgeClass,
  statusDotColor,
} from '../modules/utils.js';

const TODAY = formatDateKey();

export function initDashboard(bizId, bizDoc, appts, staff) {
  renderGreeting(bizDoc);
  renderHeroDate();
  renderKpiCards(appts);
  renderNextApptBanner(appts);
  renderTodayTimeline(appts, staff);
  renderUpcoming(appts);
  renderQuickActions();
  renderRevChart(appts);
  renderStaffOccupancy(appts, staff);
  initSidebarCollapse();
}

// ── Greeting ──────────────────────────────────────────────────
function renderGreeting(bizDoc) {
  const el = document.getElementById('overviewGreeting');
  if (!el) return;
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Dzień dobry' : h < 18 ? 'Dobre popołudnie' : 'Dobry wieczór';
  const name = window.App?.user?.displayName?.split(' ')[0]
    || bizDoc?.name?.split(' ')[0] || '';
  el.textContent = name ? `${greeting}, ${name}!` : `${greeting}!`;
}

function renderHeroDate() {
  const el = document.getElementById('dashHeroDate');
  if (!el) return;
  const now = new Date();
  const days   = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  const months = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
                  'lipca','sierpnia','września','października','listopada','grudnia'];
  el.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ── KPI cards ─────────────────────────────────────────────────
function renderKpiCards(appts) {
  const todayAppts     = appts.filter(a => a.date === TODAY);
  const pending        = appts.filter(a => a.status === 'pending' || a.status === 'zaplanowana');
  const todayRev       = calcRev(todayAppts);

  const yesterday      = dateOffset(-1);
  const yesterdayAppts = appts.filter(a => a.date === yesterday);
  const yesterdayRev   = calcRev(yesterdayAppts);

  _set('hStatToday',   todayAppts.length);
  _set('hStatPending', pending.length);
  _set('hStatRevenue', todayRev.toLocaleString('pl-PL') + ' zł');
  _set('hStatTotal',   appts.length);

  renderTrend('dashTrendToday',   todayAppts.length, yesterdayAppts.length);
  renderTrend('dashTrendRevenue', todayRev,           yesterdayRev);
  renderTrend('dashTrendTotal',   appts.length,       0);
}

function renderTrend(id, curr, prev) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!prev) { el.textContent = ''; el.className = 'dash-kpi-trend'; return; }
  const diff = curr - prev;
  const pct  = Math.round(Math.abs(diff / prev) * 100);
  if (diff > 0) {
    el.textContent = `↑ ${pct}%`;
    el.className = 'dash-kpi-trend dash-kpi-trend-up';
  } else if (diff < 0) {
    el.textContent = `↓ ${pct}%`;
    el.className = 'dash-kpi-trend dash-kpi-trend-down';
  } else {
    el.textContent = '= 0%';
    el.className = 'dash-kpi-trend dash-kpi-trend-same';
  }
}

// ── Next appointment banner ────────────────────────────────────
function renderNextApptBanner(appts) {
  const el = document.getElementById('dashNextApptBanner');
  if (!el) return;

  const nowDate = TODAY;
  const nowTime = new Date().toTimeString().slice(0, 5);

  const next = appts
    .filter(a => a.date && !isCancelledStatus(a.status) && !['zakończona', 'completed'].includes(a.status))
    .filter(a => a.date > nowDate || (a.date === nowDate && (a.time || '00:00') >= nowTime))
    .sort(compareAppointmentsAsc)[0];

  if (!next) { el.innerHTML = ''; return; }

  const isToday   = next.date === nowDate;
  const dateLabel = isToday
    ? `dziś · ${next.time || ''}`
    : `${formatDateShort(next.date)} · ${next.time || ''}`;

  el.innerHTML = `<div class="dash-next-banner">
    <div class="dash-next-banner-icon"><span class="material-icons">schedule</span></div>
    <div>
      <div class="dash-next-banner-label">${isToday ? 'Następna wizyta' : 'Najbliższa wizyta'}</div>
      <div class="dash-next-banner-val">${esc(next.clientName || next.userName || 'Klient')}</div>
      <div class="dash-next-banner-sub">${dateLabel.trim()} · ${esc(next.serviceName || next.service || '—')}</div>
    </div>
  </div>`;
}

// ── Today's timeline ──────────────────────────────────────────
function renderTodayTimeline(appts, staff) {
  const el = document.getElementById('dashTodayTimeline');
  if (!el) return;

  const todayAppts = appts
    .filter(a => a.date === TODAY && !isCancelledStatus(a.status))
    .sort(compareAppointmentsAsc);

  if (!todayAppts.length) {
    el.innerHTML = `<div class="dash-tl-empty">
      <span class="material-icons">event_busy</span>
      <p>Brak wizyt zaplanowanych na dziś</p>
    </div>`;
    return;
  }

  const items = todayAppts.map((a, i) => {
    const color       = statusDotColor(a.status);
    const staffMember = staff.find(s => s.id === a.staffId || s.name === a.staffName);
    const isLast      = i === todayAppts.length - 1;
    const priceHtml   = a.price
      ? `<span class="dash-tl-price">${Number(a.price).toLocaleString('pl-PL')} zł</span>`
      : '';
    return `<div class="dash-tl-item">
      <div class="dash-tl-left">
        <div class="dash-tl-time">${a.time || '—'}</div>
        ${!isLast ? '<div class="dash-tl-connector"></div>' : ''}
      </div>
      <div class="dash-tl-dot" style="background:${color}"></div>
      <div class="dash-tl-body">
        <div class="dash-tl-client">${esc(a.clientName || a.userName || 'Klient')}</div>
        <div class="dash-tl-meta">
          <span>${esc(a.serviceName || a.service || '—')}</span>
          ${staffMember ? `<span>· ${esc(staffMember.name)}</span>` : ''}
          ${priceHtml}
        </div>
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="dash-timeline">${items}</div>`;
}

// ── Upcoming appointments ─────────────────────────────────────
function renderUpcoming(appts) {
  const el = document.getElementById('hUpcomingList');
  if (!el) return;

  const upcoming = appts
    .filter(a => a.date && a.date >= TODAY
      && !isCancelledStatus(a.status) && !['zakończona', 'completed'].includes(a.status))
    .sort(compareAppointmentsAsc)
    .slice(0, 8);

  const countEl = document.getElementById('dashUpcomingCount');
  if (countEl) countEl.textContent = upcoming.length || '';

  if (!upcoming.length) {
    el.innerHTML = `<div class="dash-upcoming-empty">
      <span class="material-icons">event_available</span>
      <p>Brak nadchodzących wizyt</p>
    </div>`;
    return;
  }

  el.innerHTML = upcoming.map(a => {
    const isToday = a.date === TODAY;
    return `<div class="dash-upcoming-item">
      <div class="dash-upcoming-time">
        <div class="dash-upcoming-time-main">${a.time || '—'}</div>
        <div class="dash-upcoming-time-sub">${isToday ? 'dziś' : formatDateShort(a.date)}</div>
      </div>
      <div class="dash-upcoming-info">
        <div class="dash-upcoming-client">${esc(a.clientName || a.userName || 'Klient')}</div>
        <div class="dash-upcoming-svc">${esc(a.serviceName || a.service || '—')}${a.staffName ? ' · ' + esc(a.staffName) : ''}</div>
      </div>
      <span class="biz-status-badge ${statusBadgeClass(a.status)}">${appointmentStatusLabel(a.status)}</span>
    </div>`;
  }).join('');
}

// ── Quick actions ─────────────────────────────────────────────
function renderQuickActions() {
  const el = document.getElementById('hQuickActions');
  if (!el) return;
  const actions = [
    { icon: 'add_circle',  label: 'Nowa wizyta',  tab: 'calendar'  },
    { icon: 'person_add',  label: 'Nowy klient',  tab: 'clients'   },
    { icon: 'content_cut', label: 'Nowa usługa',  tab: 'services'  },
    { icon: 'local_offer', label: 'Nowa oferta',  tab: 'offers'    },
    { icon: 'campaign',    label: 'Kampania',      tab: 'marketing' },
    { icon: 'bar_chart',   label: 'Raporty',       tab: 'reports'   },
  ];
  el.innerHTML = `<div class="dash-quick-grid">${actions.map(a =>
    `<button class="dash-quick-btn" onclick="window.adminSwitchTab?.('${a.tab}')">
      <span class="material-icons">${a.icon}</span>
      <span>${a.label}</span>
    </button>`
  ).join('')}</div>`;
}

// ── Revenue chart — last 7 days (SVG) ────────────────────────
function renderRevChart(appts) {
  const el = document.getElementById('dashRevChart');
  if (!el) return;

  const days = [];
  const dayNames = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    days.push({
      date: formatDateKey(d),
      label: dayNames[d.getDay()],
      isToday: i === 0,
    });
  }

  const revenues = days.map(day =>
    appts
      .filter(a => a.date === day.date
        && isRevenueStatus(a.status))
      .reduce((s, a) => s + (Number(a.price) || 0), 0)
  );

  const maxRev = Math.max(...revenues, 1);
  const total  = revenues.reduce((s, r) => s + r, 0);

  const totalEl = document.getElementById('dashRevTotal');
  if (totalEl) totalEl.textContent = total.toLocaleString('pl-PL') + ' zł';

  const H   = 72;
  const BAR = 24;
  const GAP = 8;
  const W   = days.length * (BAR + GAP) - GAP;

  const rects = days.map((day, i) => {
    const h     = Math.max(Math.round((revenues[i] / maxRev) * H), 3);
    const x     = i * (BAR + GAP);
    const fill  = day.isToday ? '#6366f1' : '#e4e4e7';
    const title = revenues[i] ? revenues[i].toLocaleString('pl-PL') + ' zł' : '0 zł';
    const lblFill = day.isToday ? '#6366f1' : '#a1a1aa';
    const lblW    = day.isToday ? '700' : '500';
    return `<g>
      <rect x="${x}" y="${H - h}" width="${BAR}" height="${h}" rx="5" fill="${fill}">
        <title>${title}</title>
      </rect>
      <text x="${x + BAR / 2}" y="${H + 15}" text-anchor="middle"
        font-size="9" fill="${lblFill}" font-weight="${lblW}" font-family="inherit">${day.label}</text>
    </g>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H + 20}" width="100%" height="${H + 20}"
    xmlns="http://www.w3.org/2000/svg" style="overflow:visible">${rects}</svg>`;
}

// ── Staff occupancy ───────────────────────────────────────────
function renderStaffOccupancy(appts, staff) {
  const el = document.getElementById('hStaffOccupancy');
  if (!el) return;

  if (!staff.length) {
    el.innerHTML = `<p style="font-size:.8125rem;color:var(--zinc-400)">Brak pracowników</p>`;
    return;
  }

  const todayAppts = appts.filter(a => a.date === TODAY);
  const palette    = ['#6366f1','#f59e0b','#22c55e','#f43f5e','#a855f7','#0ea5e9','#14b8a6'];

  el.innerHTML = staff.map((s, idx) => {
    const count    = todayAppts.filter(a => a.staffId === s.id || a.staffName === s.name).length;
    const color    = s.color || palette[idx % palette.length];
    const initials = (s.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const busyCls  = count > 0 ? 'dash-staff-count--busy' : '';
    const visits   = pluralize(count, 'wizyta', 'wizyty', 'wizyt');
    return `<div class="dash-staff-row">
      <div class="dash-staff-avatar" style="background:${color}">${initials}</div>
      <div class="dash-staff-name">${esc(s.name)}</div>
      <div class="dash-staff-count ${busyCls}">${visits}</div>
    </div>`;
  }).join('');
}

// ── Sidebar collapse (persisted) ──────────────────────────────
function initSidebarCollapse() {
  const btn     = document.getElementById('sidebarCollapseBtn');
  const sidebar = document.getElementById('bizSidebar');
  if (!btn || !sidebar) return;

  const KEY = 'lumina_sidebar_collapsed';
  if (localStorage.getItem(KEY) === '1') sidebar.classList.add('collapsed');

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem(KEY, sidebar.classList.contains('collapsed') ? '1' : '0');
  });
}

// ── Helpers ───────────────────────────────────────────────────
function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

const esc = s =>
  String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function calcRev(list) {
  return list
    .filter(a => isRevenueStatus(a.status))
    .reduce((s, a) => s + (Number(a.price) || 0), 0);
}

function dateOffset(days) {
  return shiftDateKey(days);
}

function formatDateShort(d) {
  if (!d) return '—';
  const [, m, day] = d.split('-');
  const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}
