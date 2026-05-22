import { db, collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from '../firebase-config.js';
import { toast, confirmAction, statusLabel, escHtml, formatCurrency, formatDatePl } from './utils.js';

let _booking = { serviceId:null, staffId:null, date:null, time:null };
let _services = [];
let _staff = [];

export function setServices(services) { _services = services; }
export function setStaff(staff) { _staff = staff; }
export function getBookingState() { return _booking; }

export function initBookingPanel(daysAhead = 30) {
  _booking = { serviceId:null, staffId:null, date: new Date().toISOString().split('T')[0], time:null };

  const dateGrid = document.getElementById('dateGrid');
  if (dateGrid) {
    const days = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];
    const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    dateGrid.innerHTML = Array.from({length: daysAhead}, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      return `<button class="date-btn${isToday ? ' selected' : ''}" data-date="${dateStr}" onclick="window.selectDate(this)" title="${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}">
        <span class="day-name">${days[d.getDay()]}</span>
        <span class="day-num">${d.getDate()}</span>
        ${i === 0 ? '<span class="day-today-dot"></span>' : ''}
      </button>`;
    }).join('');
  }

  renderTimeGrid([]);
  updateBookingSummary();
}

export function renderTimeGrid(bookedTimes = []) {
  const timeGrid = document.getElementById('timeGrid');
  if (!timeGrid) return;
  const slots = [];
  for (let m = 9 * 60; m <= 19 * 60; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`);
  }
  timeGrid.innerHTML = slots.map(t => {
    const taken = bookedTimes.includes(t);
    return `<button class="time-btn${taken ? ' time-btn--taken' : ''}" data-time="${t}"
      onclick="window.selectTime(this)" ${taken ? 'disabled title="Zajęty"' : ''}>${t}</button>`;
  }).join('');
}

export function selectService(id) {
  document.querySelectorAll('.service-item').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === id));
  _booking.serviceId = id;
  updateBookingSummary();
}

export function selectStaff(id) {
  document.querySelectorAll('.staff-card').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === id));
  _booking.staffId = id;
  updateBookingSummary();
}

export function selectDate(btn) {
  document.querySelectorAll('.date-btn').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
  _booking.date = btn.dataset.date;
}

export function selectTime(btn) {
  document.querySelectorAll('.time-btn').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
  _booking.time = btn.dataset.time;
  updateBookingSummary();
}

function updateBookingSummary() {
  const s  = _services.find(x => x.id === _booking.serviceId);
  const st = _staff.find(x => x.id === _booking.staffId);
  const el = id => document.getElementById(id);

  if (el('sumService')) el('sumService').textContent = s ? s.name : '—';
  if (el('sumStaff'))   el('sumStaff').textContent   = st ? st.name : '—';
  if (el('sumTime'))    el('sumTime').textContent     = _booking.time ? `${_booking.date} ${_booking.time}` : '—';
  if (el('sumPrice'))   el('sumPrice').textContent    = s ? s.price + ' zł' : '0 zł';

  const bookBtn = el('bookBtn');
  if (bookBtn) bookBtn.disabled = !s || !_booking.time;
}

function timeToMin(t) {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return h * 60 + m;
}

async function hasConflict(staffId, date, time, duration) {
  if (!staffId) return false;
  const snap = await getDocs(query(
    collection(db, 'appointments'),
    where('staffId', '==', staffId),
    where('date', '==', date)
  ));
  const newStart = timeToMin(time);
  const newEnd   = newStart + (duration || 60);
  return snap.docs.some(d => {
    const a = d.data();
    if (['cancelled', 'anulowana'].includes(a.status)) return false;
    const aStart = timeToMin(a.time || '00:00');
    const aEnd   = aStart + (Number(a.duration) || 60);
    return newStart < aEnd && aStart < newEnd;
  });
}

export async function confirmBooking(user, bizId, businessName) {
  if (!user) { toast('Zaloguj się, aby zarezerwować', 'error'); return; }
  const s = _services.find(x => x.id === _booking.serviceId);
  if (!s || !_booking.time) return;

  const selectedStaff = _staff.find(x => x.id === _booking.staffId);

  const bookBtn = document.getElementById('bookBtn');
  if (bookBtn) { bookBtn.disabled = true; bookBtn.textContent = 'Sprawdzam dostępność...'; }

  try {
    if (await hasConflict(_booking.staffId, _booking.date, _booking.time, s.duration || 60)) {
      toast('Ten pracownik ma już wizytę w wybranym terminie. Wybierz inną godzinę.', 'error');
      if (bookBtn) { bookBtn.disabled = false; bookBtn.textContent = 'Zarezerwuj wizytę'; }
      return;
    }
  } catch { /* sieć — nie blokuj */ }

  if (bookBtn) bookBtn.textContent = 'Rezerwuję...';

  try {
    await addDoc(collection(db, 'appointments'), {
      userId:       user.uid,
      businessId:   bizId,
      businessName: businessName || '',
      serviceId:    _booking.serviceId,
      staffId:      _booking.staffId || null,
      date:         _booking.date,
      time:         _booking.time,
      status:       'pending',
      price:        s.price,
      serviceName:  s.name,
      staffName:    selectedStaff?.name || '',
      clientName:   user.displayName || user.email || 'Klient',
      clientPhoto:  user.photoURL || '',
      createdAt:    serverTimestamp(),
    });
    toast('Wizyta zarezerwowana! Czekaj na potwierdzenie', 'success');
    _booking = { ..._booking, serviceId:null, staffId:null, time:null };
    document.querySelectorAll('.service-item,.staff-card,.time-btn').forEach(el =>
      el.classList.remove('selected'));
    updateBookingSummary();
  } catch(e) {
    toast('Błąd rezerwacji: ' + e.message, 'error');
  } finally {
    if (bookBtn) { bookBtn.disabled = false; bookBtn.textContent = 'Zarezerwuj wizytę'; }
  }
}

export function cancelBooking(appointmentId) {
  return new Promise(resolve => {
    confirmAction(
      'Czy na pewno chcesz anulować tę wizytę? Tego działania nie można cofnąć.',
      async () => {
        try {
          await updateDoc(doc(db, 'appointments', appointmentId), { status: 'cancelled', cancelledAt: serverTimestamp() });
          toast('Wizyta anulowana', 'success');
          resolve(true);
        } catch(e) {
          toast('Błąd anulowania: ' + e.message, 'error');
          resolve(false);
        }
      },
      () => resolve(false),
    );
  });
}

export function addToCalendar(appointment) {
  if (!appointment?.date || !appointment?.time) return;
  const [y, mo, d] = appointment.date.split('-').map(Number);
  const [h, m] = appointment.time.split(':').map(Number);
  const start = new Date(y, mo - 1, d, h, m);
  const end   = new Date(start.getTime() + (Number(appointment.duration) || 60) * 60000);
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lumina//PL',
    'BEGIN:VEVENT',
    `UID:lumina-${appointment.id}@app`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${appointment.serviceName || 'Wizyta'} – ${appointment.businessName || 'Salon'}`,
    `DESCRIPTION:Pracownik: ${appointment.staffName || '—'}\\nCena: ${appointment.price || 0} zł`,
    `LOCATION:${appointment.businessName || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `wizyta-${appointment.date}.ics` });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
}

export async function getBookedTimesForDay(staffId, date) {
  if (!staffId || !date) return [];
  try {
    const snap = await getDocs(query(
      collection(db, 'appointments'),
      where('staffId', '==', staffId),
      where('date', '==', date)
    ));
    return snap.docs
      .map(d => d.data())
      .filter(a => !['cancelled', 'anulowana'].includes(a.status))
      .map(a => a.time)
      .filter(Boolean);
  } catch(_) { return []; }
}

export function renderAppointments(list, containerId = 'appointmentsList') {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">calendar_today</span></div>
      <h3>Brak wizyt</h3><p>Nie masz jeszcze żadnych rezerwacji.</p>
      <a href="?page=explore" class="btn btn-accent" style="margin-top:1.5rem;display:inline-flex">Zarezerwuj teraz</a>
    </div>`;
    return;
  }

  el.innerHTML = list.map(a => {
    const cancelled = ['cancelled', 'anulowana'].includes(a.status);
    const date = getAppointmentDate(a);
    const dayLabel = date
      ? date.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', '').toUpperCase()
      : 'DATA';
    const dayNumber = date ? String(date.getDate()).padStart(2, '0') : '—';

    return `
      <article class="booking-item${cancelled ? ' is-cancelled' : ''}" id="appt-${escHtml(a.id)}">
        <div class="booking-item-main">
          <div class="booking-item-date-badge">
            <span>${escHtml(dayLabel)}</span>
            <strong>${escHtml(dayNumber)}</strong>
          </div>

          <div class="booking-item-body">
            <div class="booking-item-top">
              <div>
                <div class="booking-item-salon">${escHtml(a.serviceName || 'Usługa')}</div>
                <div class="booking-item-service">${escHtml(a.businessName || 'Wybrany salon')}</div>
              </div>
              <span class="badge-status ${statusClassFor(a.status)}">${escHtml(statusLabel(a.status))}</span>
            </div>

            <div class="booking-item-meta">
              <span>
                <span class="material-icons">event</span>
                ${escHtml(formatDatePl(a.date) || 'Data do ustalenia')}
              </span>
              <span>
                <span class="material-icons">schedule</span>
                ${escHtml(a.time || 'Godzina do ustalenia')}
              </span>
              ${a.staffName
                ? `<span><span class="material-icons">person</span>${escHtml(a.staffName)}</span>`
                : ''}
              ${a.price
                ? `<span><span class="material-icons">payments</span>${escHtml(formatCurrency(a.price))}</span>`
                : ''}
            </div>
          </div>
        </div>

        <div class="booking-item-actions">
          ${a.businessId
            ? `<a href="?page=business&id=${escHtml(a.businessId)}" class="booking-action-btn booking-action-btn--primary">
                 <span class="material-icons">storefront</span>
                 <span>Otwórz salon</span>
               </a>`
            : ''}
          ${!cancelled
            ? `<button class="booking-action-btn" onclick="window.addApptToCalendar?.('${escHtml(a.id)}')">
                 <span class="material-icons">event_available</span>
                 <span>Do kalendarza</span>
               </button>`
            : ''}
          ${a.businessId
            ? `<button class="booking-action-btn" onclick="window.rebookAppt?.('${escHtml(a.id)}')" title="Przebookuj tę usługę">
                 <span class="material-icons">replay</span>
                 <span>Przebookuj</span>
               </button>`
            : ''}
          ${!cancelled
            ? `<button class="booking-action-btn booking-action-btn--danger" onclick="window.cancelAppt('${escHtml(a.id)}')" title="Anuluj wizytę">
                 <span class="material-icons">close</span>
                 <span>Anuluj</span>
               </button>`
            : ''}
        </div>
      </article>`;
  }).join('');
}

function statusClassFor(status) {
  if (['confirmed', 'potwierdzona', 'w trakcie', 'completed', 'zakończona'].includes(status)) return 'badge-confirmed';
  if (['cancelled', 'anulowana', 'nie przyszedł'].includes(status)) return 'badge-cancelled';
  return 'badge-pending';
}

function getAppointmentDate(appt) {
  if (!appt?.date) return null;

  const [year, month, day] = String(appt.date).split('-').map(Number);
  const [hours, minutes] = String(appt.time || '09:00').split(':').map(Number);

  if (!year || !month || !day) return null;

  return new Date(
    year,
    month - 1,
    day,
    Number.isFinite(hours) ? hours : 9,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );
}
