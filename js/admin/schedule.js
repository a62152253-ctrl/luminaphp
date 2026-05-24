// admin/schedule.js — Grafik zmian i urlopy
import { db, collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp }
  from '../firebase-config.js';
import { formatDateKey, toast } from '../modules/utils.js';

let _bizId, _staff;
let _shifts    = [];
let _vacations = [];
let _viewMode  = 'week';
let _currentDate = new Date();

export async function initSchedule(bizId, staff) {
  _bizId = bizId;
  _staff = staff;
  await loadData();
  renderSchedule();

  window.schedulePrev        = () => { navigate(-1); renderSchedule(); };
  window.scheduleNext        = () => { navigate(1);  renderSchedule(); };
  window.scheduleToday       = () => { _currentDate = new Date(); renderSchedule(); };
  window.scheduleSetView     = v  => { _viewMode = v; renderSchedule(); };
  window.scheduleAddShift    = openShiftModal;
  window.scheduleDeleteShift = deleteShift;
  window.scheduleAddVacation = openVacationModal;
  window.scheduleDeleteVac   = deleteVacation;
  window.scheduleSaveShift   = saveShift;
  window.scheduleSaveVacation = saveVacation;
}

async function loadData() {
  try {
    const [sSnap, vSnap] = await Promise.all([
      getDocs(query(collection(db, 'shifts'),    where('businessId', '==', _bizId))),
      getDocs(query(collection(db, 'vacations'), where('businessId', '==', _bizId))),
    ]);
    _shifts    = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    _vacations = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { _shifts = []; _vacations = []; }
}

function renderSchedule() {
  const el = document.getElementById('scheduleView');
  if (!el) return;

  const weekDays = getWeekDays(_currentDate);
  const label    = _viewMode === 'week'
    ? `${fmtShort(weekDays[0])} — ${fmtShort(weekDays[6])}`
    : _currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  el.innerHTML = `
    <div class="sched-toolbar">
      <div class="sched-nav">
        <button class="biz-cal-btn" onclick="schedulePrev()"><span class="material-icons">chevron_left</span></button>
        <span class="biz-cal-date">${label}</span>
        <button class="biz-cal-btn" onclick="scheduleNext()"><span class="material-icons">chevron_right</span></button>
        <button class="biz-cal-btn biz-cal-today" onclick="scheduleToday()">Dziś</button>
      </div>
      <div class="biz-view-toggle">
        <button class="biz-view-btn${_viewMode === 'week'  ? ' active' : ''}" onclick="scheduleSetView('week')">
          <span class="material-icons">view_week</span> Tydzień
        </button>
        <button class="biz-view-btn${_viewMode === 'month' ? ' active' : ''}" onclick="scheduleSetView('month')">
          <span class="material-icons">calendar_month</span> Miesiąc
        </button>
      </div>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn-accent btn-sm" onclick="scheduleAddShift()">
          <span class="material-icons">add</span> Dodaj zmianę
        </button>
        <button class="btn btn-ghost btn-sm" onclick="scheduleAddVacation()">
          <span class="material-icons">beach_access</span> Urlop
        </button>
      </div>
    </div>

    ${_viewMode === 'week' ? renderWeekGrid(weekDays) : renderMonthGrid()}

    <div class="sched-vacations-section">
      <h4><span class="material-icons">beach_access</span> Urlopy i nieobecności</h4>
      ${renderVacationList()}
    </div>`;
}

function renderWeekGrid(days) {
  const todayStr = formatDateKey();
  const cols = days.map(d => {
    const key       = isoDate(d);
    const isToday   = key === todayStr;
    const dayShifts = _shifts.filter(s => s.date === key);
    const dayVacs   = _vacations.filter(v => key >= v.startDate && key <= v.endDate);

    return `<div class="sched-day-col${isToday ? ' sched-day-today' : ''}">
      <div class="sched-day-head">
        <span class="sched-day-name">${d.toLocaleDateString('pl-PL', { weekday: 'short' })}</span>
        <span class="sched-day-num${isToday ? ' sched-today-num' : ''}">${d.getDate()}</span>
      </div>
      <div class="sched-day-body">
        ${dayShifts.map(s => shiftChip(s)).join('')}
        ${dayVacs.map(v => vacChip(v)).join('')}
        <button class="sched-add-btn" onclick="scheduleAddShift('${key}')" title="Dodaj zmianę">
          <span class="material-icons">add</span>
        </button>
      </div>
    </div>`;
  }).join('');

  return `<div class="sched-week-grid">${cols}</div>`;
}

function renderMonthGrid() {
  const year  = _currentDate.getFullYear();
  const month = _currentDate.getMonth();
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const today = formatDateKey();

  const dayNames = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];
  let html = `<div class="sched-month-grid">`;
  dayNames.forEach(n => { html += `<div class="sched-month-head">${n}</div>`; });

  const startDow = (first.getDay() + 6) % 7;
  for (let i = 0; i < startDow; i++) html += `<div class="sched-month-cell sched-cell-empty"></div>`;

  for (let d = 1; d <= last.getDate(); d++) {
    const key    = `${year}-${pad(month + 1)}-${pad(d)}`;
    const isToday = key === today;
    const shifts = _shifts.filter(s => s.date === key);
    const vacs   = _vacations.filter(v => key >= v.startDate && key <= v.endDate);
    const total  = shifts.length + vacs.length;

    html += `<div class="sched-month-cell${isToday ? ' sched-cell-today' : ''}">
      <div class="sched-month-day">${d}</div>
      ${shifts.slice(0, 2).map(s => shiftChip(s, true)).join('')}
      ${vacs.slice(0, 1).map(v => vacChip(v, true)).join('')}
      ${total > 3 ? `<div class="sched-more">+${total - 3}</div>` : ''}
    </div>`;
  }

  html += `</div>`;
  return html;
}

function shiftChip(s, compact = false) {
  const staffMember = _staff.find(x => x.id === s.staffId);
  const color = staffMember?.color || '#6366f1';
  const name  = staffMember?.name?.split(' ')[0] || '?';
  const label = compact
    ? name
    : `${name} ${s.timeFrom || ''}${s.timeTo ? '–' + s.timeTo : ''}`;

  return `<div class="sched-chip" style="background:${color}1a;border-left:3px solid ${color};color:${color}"
    title="${esc(staffMember?.name || '')} ${s.timeFrom || ''}–${s.timeTo || ''}">
    ${esc(label)}
    <button class="sched-chip-del" onclick="event.stopPropagation();scheduleDeleteShift('${s.id}')">×</button>
  </div>`;
}

function vacChip(v, compact = false) {
  const staffMember = _staff.find(x => x.id === v.staffId);
  const label = compact ? '🏖' : `🏖 ${esc(staffMember?.name || '?')}`;
  return `<div class="sched-chip sched-chip-vac"
    title="Urlop: ${esc(staffMember?.name || '?')} ${v.startDate}–${v.endDate}">
    ${label}
    <button class="sched-chip-del" onclick="event.stopPropagation();scheduleDeleteVac('${v.id}')">×</button>
  </div>`;
}

function renderVacationList() {
  if (!_vacations.length) {
    return `<p class="sched-vac-empty">Brak zarejestrowanych urlopów.</p>`;
  }
  return _vacations.map(v => {
    const s = _staff.find(x => x.id === v.staffId);
    return `<div class="sched-vac-row">
      <span class="material-icons" style="color:#f59e0b">beach_access</span>
      <strong>${esc(s?.name || '?')}</strong>
      <span class="sched-vac-dates">${v.startDate} – ${v.endDate}</span>
      ${v.note ? `<span class="sched-vac-note">${esc(v.note)}</span>` : ''}
      <button class="btn btn-ghost btn-sm" style="padding:.25rem .5rem;margin-left:auto"
        onclick="scheduleDeleteVac('${v.id}')">
        <span class="material-icons" style="font-size:.875rem">delete</span>
      </button>
    </div>`;
  }).join('');
}

// ===== MODALS =====

let _shiftPresetDate = '';

function openShiftModal(date = '') {
  _shiftPresetDate = date;
  const modal = document.getElementById('shiftModal');
  if (!modal) return;

  const dateEl = document.getElementById('shiftDate');
  if (dateEl) dateEl.value = date || formatDateKey();

  const staffEl = document.getElementById('shiftStaff');
  if (staffEl) {
    staffEl.innerHTML = '<option value="">— Wybierz pracownika —</option>' +
      _staff.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  }

  modal.classList.remove('hidden');
}

async function saveShift() {
  const staffId = document.getElementById('shiftStaff')?.value;
  const date    = document.getElementById('shiftDate')?.value;
  const from    = document.getElementById('shiftFrom')?.value || '';
  const to      = document.getElementById('shiftTo')?.value   || '';

  if (!staffId || !date) { toast('Wybierz pracownika i datę', 'error'); return; }

  const staffMember = _staff.find(s => s.id === staffId);
  try {
    const ref = await addDoc(collection(db, 'shifts'), {
      businessId: _bizId,
      staffId,
      staffName: staffMember?.name || '',
      date,
      timeFrom: from,
      timeTo:   to,
      createdAt: serverTimestamp(),
    });
    _shifts.push({ id: ref.id, businessId: _bizId, staffId, staffName: staffMember?.name || '', date, timeFrom: from, timeTo: to });
    document.getElementById('shiftModal')?.classList.add('hidden');
    renderSchedule();
    toast('Zmiana dodana');
  } catch(e) { toast('Błąd zapisu zmiany', 'error'); }
}

async function deleteShift(id) {
  try {
    await deleteDoc(doc(db, 'shifts', id));
    _shifts = _shifts.filter(s => s.id !== id);
    renderSchedule();
    toast('Zmiana usunięta');
  } catch(e) { toast('Błąd', 'error'); }
}

function openVacationModal() {
  const modal = document.getElementById('vacationModal');
  if (!modal) return;

  const staffEl = document.getElementById('vacStaff');
  if (staffEl) {
    staffEl.innerHTML = '<option value="">— Wybierz pracownika —</option>' +
      _staff.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  }

  const today = formatDateKey();
  const vacStartEl = document.getElementById('vacStart');
  const vacEndEl   = document.getElementById('vacEnd');
  if (vacStartEl) vacStartEl.value = today;
  if (vacEndEl)   vacEndEl.value   = today;

  modal.classList.remove('hidden');
}

async function saveVacation() {
  const staffId   = document.getElementById('vacStaff')?.value;
  const startDate = document.getElementById('vacStart')?.value;
  const endDate   = document.getElementById('vacEnd')?.value;
  const note      = document.getElementById('vacNote')?.value.trim() || '';

  if (!staffId || !startDate || !endDate) { toast('Wypełnij wszystkie wymagane pola', 'error'); return; }
  if (endDate < startDate) { toast('Data końca nie może być przed datą początku', 'error'); return; }

  const staffMember = _staff.find(s => s.id === staffId);
  try {
    const ref = await addDoc(collection(db, 'vacations'), {
      businessId: _bizId,
      staffId,
      staffName: staffMember?.name || '',
      startDate,
      endDate,
      note,
      createdAt: serverTimestamp(),
    });
    _vacations.push({ id: ref.id, businessId: _bizId, staffId, staffName: staffMember?.name || '', startDate, endDate, note });
    document.getElementById('vacationModal')?.classList.add('hidden');
    renderSchedule();
    toast('Urlop zarejestrowany');
  } catch(e) { toast('Błąd zapisu urlopu', 'error'); }
}

async function deleteVacation(id) {
  if (!confirm('Usunąć ten urlop?')) return;
  try {
    await deleteDoc(doc(db, 'vacations', id));
    _vacations = _vacations.filter(v => v.id !== id);
    renderSchedule();
    toast('Urlop usunięty');
  } catch(e) { toast('Błąd', 'error'); }
}

// ===== HELPERS =====

function getWeekDays(date) {
  const d   = new Date(date);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

function navigate(dir) {
  if (_viewMode === 'week') {
    _currentDate = new Date(_currentDate);
    _currentDate.setDate(_currentDate.getDate() + dir * 7);
  } else {
    _currentDate = new Date(_currentDate);
    _currentDate.setMonth(_currentDate.getMonth() + dir);
  }
}

function isoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtShort(d) {
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

function pad(n) { return String(n).padStart(2, '0'); }

const esc = s => String(s ?? '').replace(/</g, '&lt;');
