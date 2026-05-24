import { formatDateKey } from './utils.js';

const DAYS_SHORT = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];
const HOURS = ['08','09','10','11','12','13','14','15','16','17','18','19','20'];

export function getWeekDates(anchorDate) {
  const d   = new Date(anchorDate);
  const day = d.getDay();
  // Week starts Monday (day 1), Sunday shifts to -6
  const offset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + offset);
  return Array.from({length: 7}, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

export function renderWeekView(containerId, appointments, anchorDate) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const weekDates = getWeekDates(anchorDate);
  const todayStr  = formatDateKey();

  // Build lookup: "YYYY-MM-DD_HH" -> appointments[]
  const lookup = {};
  appointments.forEach(a => {
    if (!a.date || !a.time) return;
    const hour = a.time.split(':')[0];
    const key  = `${a.date}_${hour}`;
    if (!lookup[key]) lookup[key] = [];
    lookup[key].push(a);
  });

  const cols = 'grid-template-columns:3.5rem repeat(7,1fr)';

  // Header
  const headerCells = [
    '<div class="biz-week-col-header" style="background:var(--zinc-50)"></div>',
    ...weekDates.map(d => {
      const ds      = formatDateKey(d);
      const isToday = ds === todayStr;
      return `<div class="biz-week-col-header${isToday ? ' is-today' : ''}">
        <div class="biz-week-col-day">${DAYS_SHORT[d.getDay()]}</div>
        <div class="biz-week-col-num">${d.getDate()}</div>
      </div>`;
    }),
  ].join('');

  // Body
  const bodyRows = HOURS.map(hour => {
    const timeCells = weekDates.map(d => {
      const ds      = formatDateKey(d);
      const isToday = ds === todayStr;
      const appts   = lookup[`${ds}_${hour}`] || [];
      const events  = appts.map(a => {
        const first = (a.clientName || 'Klient').split(' ')[0];
        return `<div class="biz-week-event ev-${a.status || 'pending'}"
          title="${esc(a.clientName)} — ${esc(a.serviceName)}">
          ${a.time} ${esc(first)}
        </div>`;
      }).join('');
      return `<div class="biz-week-cell${isToday ? ' is-today' : ''}">${events}</div>`;
    }).join('');

    return `<div class="biz-week-time-label">${hour}:00</div>${timeCells}`;
  }).join('');

  el.innerHTML = `
    <div class="biz-week-wrapper">
      <div class="biz-week-grid" style="${cols}">
        ${headerCells}
        ${bodyRows}
      </div>
    </div>`;
}

function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
