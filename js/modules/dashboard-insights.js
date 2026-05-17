import { DashState, setText } from './dashboard-core.js';
import { statusLabel, formatDatePl, formatCurrency, pluralize } from './utils.js';

export function isUpcoming(appt) {
  if (isCancelled(appt)) return false;
  const d = getApptDate(appt);
  return d && d.getTime() >= Date.now();
}

export function isHistory(appt) {
  if (isCancelled(appt)) return false;
  const d = getApptDate(appt);
  return d && d.getTime() < Date.now();
}

export function isCancelled(appt) {
  return ['cancelled', 'anulowana'].includes(appt.status);
}

export function getApptDate(appt) {
  if (!appt?.date) return null;
  const [y, m, d] = String(appt.date).split('-').map(Number);
  const [hh, mm] = String(appt.time || '09:00').split(':').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, hh || 9, mm || 0, 0, 0);
}

export function getApptTs(appt) {
  return getApptDate(appt)?.getTime() || 0;
}

export function getNextAppointment() {
  return sortList(DashState.appointments.filter(isUpcoming), 'upcoming')[0] || null;
}

export function filterAppointments(list, filter, search) {
  let r = list;
  if (filter === 'upcoming') r = r.filter(isUpcoming);
  if (filter === 'history') r = r.filter(isHistory);
  if (filter === 'cancelled') r = r.filter(isCancelled);
  if (search) {
    r = r.filter(a =>
      (a.serviceName || '').toLowerCase().includes(search) ||
      (a.businessName || '').toLowerCase().includes(search) ||
      (a.staffName || '').toLowerCase().includes(search) ||
      (a.date || '').includes(search)
    );
  }
  return r;
}

export function sortList(list, filter) {
  const c = [...list];
  if (filter === 'upcoming') return c.sort((a, b) => getApptTs(a) - getApptTs(b));
  if (filter === 'history' || filter === 'cancelled') return c.sort((a, b) => getApptTs(b) - getApptTs(a));
  return c.sort((a, b) => {
    const au = isUpcoming(a), bu = isUpcoming(b);
    if (au && !bu) return -1;
    if (!au && bu) return 1;
    return au ? getApptTs(a) - getApptTs(b) : getApptTs(b) - getApptTs(a);
  });
}

export function computeStats(appointments) {
  const confirmed = appointments.filter(a =>
    ['confirmed', 'potwierdzona', 'w trakcie', 'completed', 'zakończona'].includes(a.status)
  ).length;
  const pending = appointments.filter(a =>
    ['pending', 'zaplanowana'].includes(a.status)
  ).length;
  const upcoming = appointments.filter(isUpcoming).length;
  const spent = appointments
    .filter(a => ['completed', 'zakończona', 'confirmed', 'potwierdzona'].includes(a.status))
    .reduce((s, a) => s + Number(a.price || 0), 0);

  return { confirmed, pending, upcoming, total: appointments.length, spent };
}

export function applyStatsToDom(stats) {
  setText('statConfirmed', stats.confirmed);
  setText('statPending', stats.pending);
  setText('statUpcoming', stats.upcoming);
  setText('statTotal', stats.total);
  setText('statSpent', stats.spent > 0 ? formatCurrency(stats.spent) : '0 zł');
}

export function updateHeroCopy() {
  const el = document.getElementById('dashboardHeroText');
  if (!el) return;
  const next = getNextAppointment();
  const up = DashState.appointments.filter(isUpcoming).length;

  if (next) {
    el.textContent = `Masz ${up} nadchodzące ${pluralize(up, 'wizytę', 'wizyty', 'wizyt')}. Najbliższa: ${next.serviceName || 'wizyta'} — ${formatDatePl(next.date)} o ${next.time || '—'}.`;
  } else if (DashState.appointments.length) {
    el.textContent = 'Brak nadchodzących terminów. Cała historia jest uporządkowana poniżej.';
  } else {
    el.textContent = 'Zarezerwuj pierwszą wizytę — pokażemy tu podsumowanie i przypomnienia.';
  }
}

export function updateNextVisitCard() {
  const next = getNextAppointment();
  const cta = document.getElementById('nextVisitCta');

  if (!next) {
    setText('nextVisitStatus', 'Brak planów');
    setText('nextVisitService', 'Czas na nową wizytę');
    setText('nextVisitBusiness', 'Przeglądaj salony w okolicy i zarezerwuj termin online.');
    setText('nextVisitDate', '—');
    setText('nextVisitTime', '—');
    setText('nextVisitSalon', 'Eksploruj oferty');
    setText('nextVisitNote', 'Panel jest gotowy — wystarczy jedna rezerwacja.');
    if (cta) {
      cta.href = '/luminaphp/?page=explore';
      cta.innerHTML = '<span class="material-icons">travel_explore</span><span>Znajdź salon</span>';
    }
    return;
  }

  setText('nextVisitStatus', statusLabel(next.status));
  setText('nextVisitService', next.serviceName || 'Wizyta');
  setText('nextVisitBusiness', next.staffName
    ? `${next.businessName || 'Salon'} · ${next.staffName}`
    : next.businessName || 'Twój salon');
  setText('nextVisitDate', formatDatePl(next.date));
  setText('nextVisitTime', next.time || '—');
  setText('nextVisitSalon', next.businessName || 'Salon');
  setText('nextVisitNote', relativeNote(next));

  if (cta) {
    cta.href = next.businessId ? `?page=business&id=${next.businessId}` : '/luminaphp/?page=explore';
    cta.innerHTML = '<span class="material-icons">arrow_forward</span><span>Szczegóły wizyty</span>';
  }
}

function relativeNote(appt) {
  const d = getApptDate(appt);
  if (!d) return 'Sprawdź listę rezerwacji.';
  const today = new Date();
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
    new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
  if (diff === 0) return 'Dzisiaj — dodaj do kalendarza jednym kliknięciem.';
  if (diff === 1) return 'Jutro — przypomnienie już tu czeka.';
  return `Za ${diff} ${diff === 1 ? 'dzień' : 'dni'} — wszystko pod kontrolą.`;
}

export function buildScheduleSummary() {
  const next = getNextAppointment();
  const up = DashState.appointments.filter(isUpcoming).length;
  const hist = DashState.appointments.filter(isHistory).length;
  return [
    'Lumina — panel klienta',
    next ? `Najbliższa: ${next.serviceName} | ${next.businessName} | ${formatDatePl(next.date)} ${next.time}` : 'Najbliższa: brak',
    `Nadchodzące: ${up} | Historia: ${hist} | Łącznie: ${DashState.appointments.length}`,
  ].join('\n');
}

export function buildIcs(appt) {
  const start = getApptDate(appt);
  if (!start) return null;
  const end = new Date(start.getTime() + (Number(appt.duration) || 60) * 60000);
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const esc = v => String(v || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lumina//PL', 'BEGIN:VEVENT',
    `UID:${appt.id}@lumina`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(`${appt.serviceName} - ${appt.businessName}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export function getFilterLabel(f) {
  return { all: 'wszystkie', upcoming: 'nadchodzące', history: 'historia', cancelled: 'anulowane' }[f] || f;
}
