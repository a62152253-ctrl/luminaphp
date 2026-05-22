// admin/reports.js — Raporty i Statystyki (ApexCharts)
import { toast } from '../modules/utils.js';

let _appts, _services, _staff;
let _revenueChart  = null;
let _hoursChart    = null;
let _noShowChart   = null;
let _dowChart      = null;

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
  renderNoShowChart();
  renderBusiestHoursChart();
  renderDayOfWeekChart();
  renderReturningClients();
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

  const thisRev = revenue(thisAppts);
  const lastRev = revenue(lastAppts);
  const revDiff = lastRev ? Math.round((thisRev - lastRev) / lastRev * 100) : 0;

  const returning = countReturningClients(_appts);

  el.innerHTML = `
    <div class="kpi-grid">
      ${kpiCard('payments', 'Przychód (mies.)', thisRev + ' zł', revDiff, lastRev + ' zł mies. temu')}
      ${kpiCard('calendar_today', 'Wizyty (mies.)', thisAppts.length, thisAppts.length - lastAppts.length, lastAppts.length + ' mies. temu')}
      ${kpiCard('person_off', 'No-show (mies.)', noShow(thisAppts), null, 'klientów nie przyszło')}
      ${kpiCard('star', 'Łącznie wizyt', _appts.length, null, 'od początku')}
      ${kpiCard('repeat', 'Powracający klienci', returning.count, null, `${returning.pct}% wszystkich klientów`)}
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

function waitForApex(cb) {
  if (window.ApexCharts) { cb(); return; }
  const t = setInterval(() => { if (window.ApexCharts) { clearInterval(t); cb(); } }, 100);
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

  const total = data.reduce((s,d) => s + d.value, 0);
  const totalEl = document.getElementById('reportsRevTotal');
  if (totalEl) totalEl.textContent = total + ' zł (6 mies.)';

  waitForApex(() => {
    if (_revenueChart) { _revenueChart.destroy(); _revenueChart = null; }
    el.innerHTML = '';
    _revenueChart = new ApexCharts(el, {
      chart: { type: 'area', height: 220, toolbar: { show: false }, zoom: { enabled: false }, animations: { speed: 600 } },
      series: [{ name: 'Przychód (zł)', data: data.map(d => d.value) }],
      xaxis: { categories: data.map(d => d.label), labels: { style: { colors: '#71717a', fontSize: '11px' } } },
      yaxis: { labels: { formatter: v => v + ' zł', style: { colors: '#71717a', fontSize: '11px' } } },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90] } },
      colors: ['#f43f5e'],
      dataLabels: { enabled: false },
      grid: { borderColor: '#f4f4f5', strokeDashArray: 3 },
      tooltip: { y: { formatter: v => v + ' zł' } },
    });
    _revenueChart.render();
  });
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

function renderNoShowChart() {
  const el = document.getElementById('reportsNoShow');
  if (!el) return;

  const total  = _appts.length || 1;
  const noShow = _appts.filter(a => a.status === 'nie przyszedł').length;
  const pct    = Math.round(noShow / total * 100);

  waitForApex(() => {
    if (_noShowChart) { _noShowChart.destroy(); _noShowChart = null; }
    el.innerHTML = '';
    _noShowChart = new ApexCharts(el, {
      chart: { type: 'radialBar', height: 220, toolbar: { show: false } },
      series: [pct],
      plotOptions: {
        radialBar: {
          hollow: { size: '55%' },
          dataLabels: {
            name: { fontSize: '13px', color: '#71717a', offsetY: 6 },
            value: { fontSize: '22px', fontWeight: 700, color: '#18181b', formatter: v => v + '%' },
          },
        },
      },
      colors: [pct > 20 ? '#ef4444' : pct > 10 ? '#f59e0b' : '#22c55e'],
      labels: [`No-show (${noShow}/${total})`],
    });
    _noShowChart.render();
  });
}

function renderBusiestHoursChart() {
  const el = document.getElementById('reportsBusiestHours');
  if (!el) return;

  const map = {};
  for (let h = 8; h < 20; h++) map[h] = 0;
  _appts.forEach(a => {
    const h = parseInt((a.time||'').split(':')[0]);
    if (h >= 8 && h < 20) map[h]++;
  });

  const labels = Object.keys(map).map(h => h + ':00');
  const values = Object.values(map);

  waitForApex(() => {
    if (_hoursChart) { _hoursChart.destroy(); _hoursChart = null; }
    el.innerHTML = '<h3 class="report-section-title">Najbardziej ruchliwe godziny</h3><div id="hoursApexChart"></div>';
    _hoursChart = new ApexCharts(document.getElementById('hoursApexChart'), {
      chart: { type: 'bar', height: 200, toolbar: { show: false }, animations: { speed: 500 } },
      series: [{ name: 'Wizyty', data: values }],
      xaxis: { categories: labels, labels: { style: { colors: '#71717a', fontSize: '10px' } } },
      yaxis: { labels: { style: { colors: '#71717a', fontSize: '10px' } }, tickAmount: 3 },
      colors: ['#6366f1'],
      plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f4f4f5', strokeDashArray: 3 },
      tooltip: { y: { formatter: v => v + ' wizyt' } },
    });
    _hoursChart.render();
  });
}

function renderDayOfWeekChart() {
  const parentEl = document.getElementById('reportsBusiestHours');
  if (!parentEl) return;

  // Inject a sibling container for the DOW chart after the hours section
  let el = document.getElementById('reportsDowChart');
  if (!el) {
    const wrap = document.createElement('div');
    wrap.className = 'biz-chart-area';
    wrap.style.marginTop = '2rem';
    wrap.id = 'reportsDowWrap';
    parentEl.insertAdjacentElement('afterend', wrap);
    el = wrap;
  }

  const dowMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  _appts.forEach(a => {
    if (!a.date) return;
    const dow = new Date(a.date).getDay(); // 0=Sun ... 6=Sat
    dowMap[dow] = (dowMap[dow] || 0) + 1;
  });

  const labels = ['Ndz','Pon','Wt','Śr','Czw','Pt','Sob'];
  const values = [0,1,2,3,4,5,6].map(i => dowMap[i]);

  waitForApex(() => {
    if (_dowChart) { _dowChart.destroy(); _dowChart = null; }
    el.innerHTML = '<h3 class="report-section-title">Wizyty wg dnia tygodnia</h3><div id="dowApexChart"></div>';
    _dowChart = new ApexCharts(document.getElementById('dowApexChart'), {
      chart: { type: 'bar', height: 200, toolbar: { show: false }, animations: { speed: 500 } },
      series: [{ name: 'Wizyty', data: values }],
      xaxis: { categories: labels, labels: { style: { colors: '#71717a', fontSize: '11px' } } },
      yaxis: { labels: { style: { colors: '#71717a', fontSize: '10px' } }, tickAmount: 3 },
      colors: ['#ec4899'],
      plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f4f4f5', strokeDashArray: 3 },
      tooltip: { y: { formatter: v => v + ' wizyt' } },
    });
    _dowChart.render();
  });
}

function renderReturningClients() {
  const parentEl = document.getElementById('reportsNoShow');
  if (!parentEl) return;

  const rc = countReturningClients(_appts);
  const total = uniqueClientCount(_appts);

  // Inject returning-clients card next to no-show
  let el = document.getElementById('reportsReturning');
  if (!el) {
    const wrap = document.createElement('div');
    wrap.id = 'reportsReturning';
    wrap.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%';
    parentEl.insertAdjacentElement('afterend', wrap);
    el = wrap;
  }

  waitForApex(() => {
    el.innerHTML = '';
    const chart = new ApexCharts(el, {
      chart: { type: 'radialBar', height: 220, toolbar: { show: false } },
      series: [rc.pct],
      plotOptions: {
        radialBar: {
          hollow: { size: '55%' },
          dataLabels: {
            name: { fontSize: '13px', color: '#71717a', offsetY: 6 },
            value: { fontSize: '22px', fontWeight: 700, color: '#18181b', formatter: v => v + '%' },
          },
        },
      },
      colors: ['#6366f1'],
      labels: [`Powracający (${rc.count}/${total})`],
    });
    chart.render();
  });
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

function countReturningClients(appts) {
  const map = {};
  appts.forEach(a => {
    const key = a.clientPhone || a.userId || a.clientName;
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });
  const total     = Object.keys(map).length || 1;
  const returning = Object.values(map).filter(n => n >= 2).length;
  return { count: returning, pct: Math.round(returning / total * 100) };
}

function uniqueClientCount(appts) {
  const keys = new Set(appts.map(a => a.clientPhone || a.userId || a.clientName).filter(Boolean));
  return keys.size;
}

const esc = s => String(s ?? '').replace(/</g, '&lt;');
