import { formatDateKey, isCancelledStatus, isRevenueStatus } from './utils.js';

export function computeKPIs(appointments) {
  const confirmed = appointments.filter(a => isRevenueStatus(a.status));
  const cancelled = appointments.filter(a => isCancelledStatus(a.status));
  const revenue   = confirmed.reduce((s, a) => s + (a.price || 0), 0);
  const avgValue  = confirmed.length ? Math.round(revenue / confirmed.length) : 0;
  const conversion = appointments.length
    ? Math.round(confirmed.length / appointments.length * 100) : 0;

  const clients = new Set(
    appointments.map(a => a.userId || a.clientName || 'anon').filter(Boolean)
  ).size;

  // Top service
  const svcCount = {};
  appointments.forEach(a => {
    if (a.serviceName) svcCount[a.serviceName] = (svcCount[a.serviceName] || 0) + 1;
  });
  const topService = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0] || null;

  // Today
  const todayStr = formatDateKey();
  const todayCount = appointments.filter(a => a.date === todayStr).length;

  // This month revenue
  const now = new Date();
  const thisMonthRevenue = confirmed
    .filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, a) => s + (a.price || 0), 0);

  return {
    revenue, confirmed: confirmed.length, cancelled: cancelled.length,
    total: appointments.length, avgValue, conversion, clients,
    topService, todayCount, thisMonthRevenue,
  };
}

export function renderKPIs(kpi, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const badge = (cls, text) =>
    `<span class="biz-kpi-badge ${cls}">${text}</span>`;

  el.innerHTML = `
    <div class="biz-kpi-grid">
      <div class="biz-kpi-card">
        <div class="biz-kpi-label">Przychód łączny</div>
        <div class="biz-kpi-value">${kpi.revenue} <span style="font-size:1rem;color:var(--zinc-400)">zł</span></div>
        ${badge('flat', `Ten miesiąc: ${kpi.thisMonthRevenue} zł`)}
      </div>
      <div class="biz-kpi-card">
        <div class="biz-kpi-label">Śr. wartość wizyty</div>
        <div class="biz-kpi-value">${kpi.avgValue} <span style="font-size:1rem;color:var(--zinc-400)">zł</span></div>
        ${badge(kpi.avgValue >= 100 ? 'up' : 'flat', kpi.avgValue >= 100 ? '↑ Powyżej 100 zł' : '—')}
      </div>
      <div class="biz-kpi-card">
        <div class="biz-kpi-label">Konwersja</div>
        <div class="biz-kpi-value">${kpi.conversion}<span style="font-size:1.25rem;color:var(--zinc-400)">%</span></div>
        ${badge(kpi.conversion >= 70 ? 'up' : kpi.conversion >= 40 ? 'flat' : 'down',
          `${kpi.confirmed} z ${kpi.total}`)}
      </div>
      <div class="biz-kpi-card">
        <div class="biz-kpi-label">Klienci</div>
        <div class="biz-kpi-value">${kpi.clients}</div>
        ${badge('flat', 'Unikalni')}
      </div>
      <div class="biz-kpi-card">
        <div class="biz-kpi-label">Wizyty dziś</div>
        <div class="biz-kpi-value">${kpi.todayCount}</div>
        ${badge(kpi.todayCount > 0 ? 'up' : 'flat', kpi.todayCount > 0 ? 'Aktywny dzień' : 'Brak dziś')}
      </div>
      <div class="biz-kpi-card">
        <div class="biz-kpi-label">Anulowane</div>
        <div class="biz-kpi-value">${kpi.cancelled}</div>
        ${badge(kpi.cancelled === 0 ? 'up' : 'down',
          kpi.cancelled === 0 ? '✓ Świetnie!' : 'Do poprawy')}
      </div>
      ${kpi.topService ? `<div class="biz-kpi-card">
        <div class="biz-kpi-label">Top usługa</div>
        <div class="biz-kpi-value" style="font-size:1rem;line-height:1.35;margin-bottom:.625rem">
          ${kpi.topService[0]}
        </div>
        ${badge('up', `${kpi.topService[1]} rezerwacji`)}
      </div>` : ''}
    </div>`;
}
