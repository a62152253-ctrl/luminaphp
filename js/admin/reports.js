// admin/reports.js — Raporty i Statystyki
import { renderBarChart, renderLineChart } from '../modules/chart-render.js';
import { toast } from '../modules/utils.js';

let _appts, _services, _staff;

export function initReports(appts, services, staff) {
  _appts    = appts;
  _services = services;
  _staff    = staff;
  renderReports();
}

function renderReports() {
  renderKPICards();
  renderRevenueChart();
  renderPopularServices();
  renderStaffStats();
  renderNoShowRate();
  renderBusiestHours();
}

function renderKPICards() {
  const el = document.getElementById('reportsKPI');
  if (!el) return;

  const now       = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

  const thisAppts = _appts.filter(a => (a.date||'').startsWith(thisMonth));
  const lastAppts = _appts.filter(a => (a.date||'').startsWith(lastMonth));

  const revenue = a => a.filter(x => completedStatus(x.status)).reduce((s,x) => s + (Number(x.price)||0), 0);
  const noShow  = a => a.filter(x => x.status === 'nie przyszedł').length;

  const thisRev  = revenue(thisAppts);
  const lastRev  = revenue(lastAppts);
  const revDiff  = lastRev ? Math.round((thisRev - lastRev) / lastRev * 100) : 0;

  el.innerHTML = `
    <div class="kpi-grid">
      ${kpiCard('payments', 'Przychód (mies.)', thisRev + ' zł', revDiff, lastRev + ' zł mies. temu')}
      ${kpiCard('calendar_today', 'Wizyty (mies.)', thisAppts.length, thisAppts.length - lastAppts.length, lastAppts.length + ' mies. temu')}
      ${kpiCard('person_off', 'No-show (mies.)', noShow(thisAppts), null, 'klientów nie przyszło')}
      ${kpiCard('star', 'Łącznie wizyt', _appts.length, null, 'od początku')}
    </div>`;
}

function kpiCard(icon, label, val, diff, sub) {
  const diffHtml = diff !== null && diff !== undefined
    ? `<span class="kpi-diff ${diff >= 0 ? 'kpi-up' : 'kpi-down'}">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)}${typeof diff === 'number' && label.includes('Przychód') ? '%' : ''}</span>`
    : '';
  return `<div class="kpi-card">
    <div class="kpi-icon"><span class="material-icons">${icon}</span></div>
    <div class="kpi-val">${val} ${diffHtml}</div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-sub">${sub || ''}</div>
  </div>`;
}

function renderRevenueChart() {
  const el = document.getElementById('reportsRevenueChart');
  if (!el) return;

  const months = getLast6Months();
  const data   = months.map(m => ({
    label: m.label,
    value: _appts
      .filter(a => (a.date||'').startsWith(m.key) && completedStatus(a.status))
      .reduce((s, a) => s + (Number(a.price)||0), 0)
  }));

  renderBarChart('reportsRevenueChart', data.map(d => d.label), data.map(d => d.value));

  const total = data.reduce((s,d) => s + d.value, 0);
  const totalEl = document.getElementById('reportsRevTotal');
  if (totalEl) totalEl.textContent = total + ' zł (6 mies.)';
}

function renderPopularServices() {
  const el = document.getElementById('reportsPopularSvcs');
  if (!el) return;

  const map = {};
  _appts.forEach(a => {
    const name = a.serviceName || a.service || '—';
    if (!map[name]) map[name] = { count: 0, revenue: 0 };
    map[name].count++;
    if (completedStatus(a.status)) map[name].revenue += Number(a.price)||0;
  });

  const sorted = Object.entries(map).sort((a,b) => b[1].count - a[1].count).slice(0, 8);
  const max    = sorted[0]?.[1].count || 1;

  el.innerHTML = sorted.map(([name, d]) => `
    <div class="report-svc-row">
      <div class="report-svc-name">${esc(name)}</div>
      <div class="report-svc-bar-wrap">
        <div class="report-svc-bar" style="width:${d.count/max*100}%"></div>
      </div>
      <div class="report-svc-count">${d.count}×</div>
      <div class="report-svc-rev">${d.revenue} zł</div>
    </div>`).join('');
}

function renderStaffStats() {
  const el = document.getElementById('reportsStaffStats');
  if (!el || !_staff.length) return;

  el.innerHTML = `<h3 class="report-section-title">Wyniki pracowników</h3>` +
    _staff.map(s => {
      const mine = _appts.filter(a => a.staffId === s.id || a.staffName === s.name);
      const rev  = mine.filter(a => completedStatus(a.status)).reduce((sum,a) => sum + (Number(a.price)||0), 0);
      return `<div class="report-staff-row">
        <div class="report-staff-dot" style="background:${s.color||'#6366f1'}"></div>
        <div class="report-staff-name">${esc(s.name)}</div>
        <div class="report-staff-count">${mine.length} wizyt</div>
        <div class="report-staff-rev">${rev} zł</div>
      </div>`;
    }).join('');
}

function renderNoShowRate() {
  const el = document.getElementById('reportsNoShow');
  if (!el) return;
  const total  = _appts.length || 1;
  const noShow = _appts.filter(a => a.status === 'nie przyszedł').length;
  const pct    = Math.round(noShow / total * 100);
  el.innerHTML = `<div class="report-noshow">
    <div class="report-noshow-num">${pct}%</div>
    <div class="report-noshow-label">Wskaźnik no-show</div>
    <div class="report-noshow-sub">${noShow} z ${total} wizyt</div>
  </div>`;
}

function renderBusiestHours() {
  const el = document.getElementById('reportsBusiestHours');
  if (!el) return;

  const map = {};
  for (let h = 8; h < 20; h++) map[h] = 0;
  _appts.forEach(a => {
    const h = parseInt((a.time||'').split(':')[0]);
    if (h >= 8 && h < 20) map[h]++;
  });
  const max = Math.max(...Object.values(map), 1);

  el.innerHTML = `<h3 class="report-section-title">Najbardziej ruchliwe godziny</h3>
    <div class="report-hours-grid">
      ${Object.entries(map).map(([h, count]) => `
        <div class="report-hour-col">
          <div class="report-hour-bar-wrap">
            <div class="report-hour-bar" style="height:${count/max*100}%"></div>
          </div>
          <div class="report-hour-label">${h}:00</div>
        </div>`).join('')}
    </div>`;
}

// helpers
function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('pl-PL', { month: 'short' })
    });
  }
  return months;
}
function completedStatus(s) {
  return ['confirmed','zakończona','completed'].includes(s);
}
const esc = s => String(s ?? '').replace(/</g, '&lt;');
