// admin/calendar.js — Kalendarz (timeline Google Calendar style)
import { db, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, onSnapshot }
  from '../firebase-config.js';
import { toast, confirmAction } from '../modules/utils.js';

const SLOT_H   = 64;   // px per 30-min slot
const START_H  = 8;    // 08:00
const END_H    = 20;   // 20:00
const SLOTS    = (END_H - START_H) * 2;

const STATUS_COLORS = {
  zaplanowana:    { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
  pending:        { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' },
  potwierdzona:   { bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
  confirmed:      { bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
  'w trakcie':    { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },
  zakończona:     { bg: '#f4f4f5', border: '#a1a1aa', text: '#52525b' },
  completed:      { bg: '#f4f4f5', border: '#a1a1aa', text: '#52525b' },
  'nie przyszedł':{ bg: '#fee2e2', border: '#ef4444', text: '#dc2626' },
  cancelled:      { bg: '#f1f5f9', border: '#94a3b8', text: '#64748b' },
  anulowana:      { bg: '#f1f5f9', border: '#94a3b8', text: '#64748b' },
};

const STAFF_COLORS = ['#6366f1','#ec4899','#f59e0b','#22c55e','#14b8a6','#3b82f6','#8b5cf6'];

let _bizId, _appts, _staff, _services;
let _calDate   = new Date();
let _calView   = 'day';   // 'day' | 'week'
let _filter    = '';
let _dragging  = null;
let _unsubAppts = null;

export function initCalendar(bizId, appts, staff, services) {
  _bizId    = bizId;
  _appts    = appts;
  _staff    = staff;
  _services = services;

  // assign colors to staff
  _staff.forEach((s, i) => { if (!s.color) s.color = STAFF_COLORS[i % STAFF_COLORS.length]; });

  initControls();
  renderCalendar();
  initApptModal();

  // Subscribe to real-time appointment updates
  if (_unsubAppts) _unsubAppts();
  _unsubAppts = onSnapshot(
    query(collection(db, 'appointments'), where('businessId', '==', bizId)),
    snap => {
      _appts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderCalendar();
    },
    err => console.error('calendar snapshot:', err)
  );
}

// ===== CONTROLS =====
function initControls() {
  document.getElementById('calPrev')?.addEventListener('click', () => {
    navigate(-1); });
  document.getElementById('calNext')?.addEventListener('click', () => {
    navigate(1); });
  document.getElementById('calToday')?.addEventListener('click', () => {
    _calDate = new Date(); renderCalendar(); });
  document.getElementById('viewDayBtn')?.addEventListener('click', () => setView('day'));
  document.getElementById('viewWeekBtn')?.addEventListener('click', () => setView('week'));

  document.querySelectorAll('.biz-filter-btn[data-fstatus]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.biz-filter-btn[data-fstatus]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _filter = btn.dataset.fstatus;
      renderCalendar();
    });
  });

  window.setCalView = setView;
}

function navigate(dir) {
  if (_calView === 'day') {
    _calDate.setDate(_calDate.getDate() + dir);
  } else {
    _calDate.setDate(_calDate.getDate() + dir * 7);
  }
  renderCalendar();
}

function setView(v) {
  _calView = v;
  document.getElementById('viewDayBtn')?.classList.toggle('active', v === 'day');
  document.getElementById('viewWeekBtn')?.classList.toggle('active', v === 'week');
  renderCalendar();
}

// ===== RENDER =====
function renderCalendar() {
  updateDateLabel();
  if (_calView === 'day') renderDayTimeline();
  else renderWeekTimeline();
}

function updateDateLabel() {
  const el = document.getElementById('calDateLabel');
  if (!el) return;
  if (_calView === 'day') {
    el.textContent = _calDate.toLocaleDateString('pl-PL', { weekday:'long', day:'numeric', month:'long' });
  } else {
    const mon = weekStart(_calDate);
    const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
    el.textContent = `${mon.getDate()} – ${sun.getDate()} ${sun.toLocaleDateString('pl-PL',{month:'long'})}`;
  }
}

function dayStr(d) {
  return d.toISOString().slice(0, 10);
}

function weekStart(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

// ===== DAY TIMELINE =====
function renderDayTimeline() {
  const wrapper = document.getElementById('calDayView');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  document.getElementById('calWeekView')?.classList.add('hidden');
  wrapper.classList.remove('hidden');

  const dateStr = dayStr(_calDate);
  const dayAppts = apptsByDate(dateStr);

  wrapper.innerHTML = `
    <div class="cal-timeline">
      <div class="cal-time-col">${buildTimeCol()}</div>
      <div class="cal-events-col" id="calEventsDay">
        ${buildGridLines()}
        <div class="cal-add-hint">Kliknij, aby dodać wizytę</div>
      </div>
    </div>`;

  const eventsCol = document.getElementById('calEventsDay');
  placeAppointments(eventsCol, dayAppts, dateStr);
  eventsCol.addEventListener('click', e => {
    if (e.target.closest('.cal-appt')) return;
    const y = e.offsetY;
    const slot = Math.floor(y / SLOT_H);
    const minutes = START_H * 60 + slot * 30;
    openApptModal(null, dateStr, minutesToTime(minutes));
  });
}

// ===== WEEK TIMELINE =====
function renderWeekTimeline() {
  const wrapper = document.getElementById('calWeekView');
  const dayWrapper = document.getElementById('calDayView');
  if (!wrapper) return;
  wrapper.classList.remove('hidden');
  dayWrapper?.classList.add('hidden');

  const mon = weekStart(_calDate);
  const days = Array.from({length:7}, (_, i) => {
    const d = new Date(mon); d.setDate(d.getDate() + i); return d;
  });
  const DAYS_PL = ['Pon','Wt','Śr','Czw','Pt','Sob','Nd'];

  wrapper.innerHTML = `
    <div class="cal-week-wrap">
      <div class="cal-week-header">
        <div class="cal-time-col-hdr"></div>
        ${days.map((d, i) => `
          <div class="cal-week-day-hdr ${dayStr(d) === dayStr(new Date()) ? 'today' : ''}">
            <div class="cal-week-day-name">${DAYS_PL[i]}</div>
            <div class="cal-week-day-num">${d.getDate()}</div>
          </div>`).join('')}
      </div>
      <div class="cal-week-body">
        <div class="cal-time-col">${buildTimeCol()}</div>
        ${days.map(d => {
          const ds = dayStr(d);
          const dayAppts = apptsByDate(ds);
          return `<div class="cal-events-col cal-week-col" id="calEventsWeek_${ds}" data-date="${ds}">
            ${buildGridLines()}
          </div>`;
        }).join('')}
      </div>
    </div>`;

  days.forEach(d => {
    const ds = dayStr(d);
    const col = document.getElementById(`calEventsWeek_${ds}`);
    if (!col) return;
    placeAppointments(col, apptsByDate(ds), ds);
    col.addEventListener('click', e => {
      if (e.target.closest('.cal-appt')) return;
      const y = e.offsetY;
      const slot = Math.floor(y / SLOT_H);
      const minutes = START_H * 60 + slot * 30;
      openApptModal(null, ds, minutesToTime(minutes));
    });
  });
}

// ===== APPOINTMENT BLOCKS =====
function placeAppointments(col, appts, dateStr) {
  appts.forEach(a => {
    if (_filter && a.status !== _filter) return;
    const el = buildApptBlock(a);
    col.appendChild(el);
    initDrag(el, a, col, dateStr);
  });
}

function buildApptBlock(a) {
  const [h, m] = (a.time || '09:00').split(':').map(Number);
  const startMin = h * 60 + m;
  const duration = Number(a.duration) || 60;
  const top      = ((startMin - START_H * 60) / 30) * SLOT_H;
  const height   = Math.max((duration / 30) * SLOT_H, SLOT_H * 0.8);

  const colors = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
  const staff  = _staff.find(s => s.id === a.staffId);
  const staffColor = staff?.color || '#6366f1';

  const el = document.createElement('div');
  el.className = 'cal-appt';
  el.dataset.id = a.id;
  el.style.cssText = `top:${top}px;height:${height}px;background:${colors.bg};
    border-left:3px solid ${staffColor};`;
  el.innerHTML = `
    <div class="cal-appt-time">${a.time || ''}</div>
    <div class="cal-appt-client">${esc(a.clientName || a.userName || 'Klient')}</div>
    <div class="cal-appt-svc">${esc(a.serviceName || a.service || '')}</div>
    ${staff ? `<div class="cal-appt-staff" style="color:${staffColor}">${esc(staff.name)}</div>` : ''}
    <div class="cal-appt-actions">
      <button class="cal-appt-btn" title="Edytuj" onclick="window.calEditAppt('${a.id}')">
        <span class="material-icons" style="font-size:.875rem">edit</span>
      </button>
      <button class="cal-appt-btn" title="Zmień status" onclick="window.calChangeStatus('${a.id}')">
        <span class="material-icons" style="font-size:.875rem">flag</span>
      </button>
    </div>`;
  return el;
}

// ===== DRAG & DROP =====
function initDrag(el, appt, col, dateStr) {
  let startY, origTop, dragging = false;

  el.addEventListener('mousedown', e => {
    if (e.target.closest('.cal-appt-btn')) return;
    e.preventDefault();
    startY   = e.clientY;
    origTop  = parseInt(el.style.top);
    dragging = true;
    el.style.opacity = '0.8';
    el.style.zIndex  = '100';
    el.style.cursor  = 'grabbing';

    const onMove = ev => {
      if (!dragging) return;
      const dy   = ev.clientY - startY;
      const newTop = Math.max(0, Math.min(origTop + dy, SLOTS * SLOT_H - 30));
      el.style.top = newTop + 'px';
    };
    const onUp = async ev => {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      el.style.opacity = '';
      el.style.zIndex  = '';
      el.style.cursor  = '';

      const newTop     = parseInt(el.style.top);
      const slot       = Math.round(newTop / SLOT_H);
      const newMinutes = START_H * 60 + slot * 30;
      const newTime    = minutesToTime(newMinutes);
      if (newTime !== appt.time) {
        try {
          const conflict = await hasConflict(appt.staffId, appt.date, newTime, appt.duration || 60, appt.id);
          if (conflict) {
            el.style.top = origTop + 'px';
            toast('Konflikt: pracownik ma już wizytę o ' + newTime, 'error');
            return;
          }
          await updateDoc(doc(db, 'appointments', appt.id), { time: newTime });
          appt.time = newTime;
          const timeEl = el.querySelector('.cal-appt-time');
          if (timeEl) timeEl.textContent = newTime;
          toast('Wizyta przesunięta na ' + newTime);
        } catch(e) {
          el.style.top = origTop + 'px';
          toast('Błąd zapisu', 'error');
        }
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ===== ADD / EDIT APPOINTMENT MODAL =====
function initApptModal() {
  window.calEditAppt = id => {
    if (!id) { openApptModal(null); return; }
    const a = _appts.find(x => x.id === id);
    if (a) openApptModal(a);
    else openApptModal(null);
  };
  window.calChangeStatus = id => openStatusModal(id);
  window.calSaveAppt = saveAppt;
  window.calDeleteAppt = deleteAppt;
  window.calCloseApptModal = () => {
    document.getElementById('calApptModal')?.classList.add('hidden');
  };
  window.calCloseStatusModal = () => {
    document.getElementById('calStatusModal')?.classList.add('hidden');
  };
  window.calSetStatus = setStatus;
}

function openApptModal(appt = null, date = '', time = '') {
  const modal = document.getElementById('calApptModal');
  if (!modal) return;

  document.getElementById('calApptId').value       = appt?.id || '';
  document.getElementById('calApptClient').value   = appt?.clientName || '';
  document.getElementById('calApptPhone').value    = appt?.clientPhone || '';
  document.getElementById('calApptDate').value     = appt?.date || date || dayStr(_calDate);
  document.getElementById('calApptTime').value     = appt?.time || time || '09:00';
  document.getElementById('calApptNotes').value    = appt?.notes || '';

  // Populate service select
  const svcSel = document.getElementById('calApptService');
  if (svcSel) {
    svcSel.innerHTML = '<option value="">— Wybierz usługę —</option>' +
      _services.map(s => `<option value="${s.id}" data-dur="${s.duration||60}" data-price="${s.price||0}"
        ${appt?.serviceId === s.id ? 'selected' : ''}>${esc(s.name)} (${s.duration||60} min · ${s.price||0} zł)</option>`).join('');
  }

  // Populate staff select
  const stSel = document.getElementById('calApptStaff');
  if (stSel) {
    stSel.innerHTML = '<option value="">— Dowolny pracownik —</option>' +
      _staff.map(s => `<option value="${s.id}" ${appt?.staffId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  }

  // Status select
  const statusSel = document.getElementById('calApptStatus');
  if (statusSel && appt) statusSel.value = appt.status || 'zaplanowana';

  document.getElementById('calApptModalTitle').textContent = appt ? 'Edytuj wizytę' : 'Nowa wizyta';
  document.getElementById('calDeleteApptBtn').style.display = appt ? '' : 'none';
  modal.classList.remove('hidden');
}

async function saveAppt() {
  const id      = document.getElementById('calApptId').value;
  const client  = document.getElementById('calApptClient').value.trim();
  const phone   = document.getElementById('calApptPhone').value.trim();
  const date    = document.getElementById('calApptDate').value;
  const time    = document.getElementById('calApptTime').value;
  const notes   = document.getElementById('calApptNotes').value.trim();
  const status  = document.getElementById('calApptStatus')?.value || 'zaplanowana';

  const svcSel  = document.getElementById('calApptService');
  const svcOpt  = svcSel?.selectedOptions[0];
  const serviceId   = svcSel?.value || '';
  const serviceName = svcOpt?.text?.split(' (')[0] || '';
  const duration    = parseInt(svcOpt?.dataset.dur) || 60;
  const price       = parseInt(svcOpt?.dataset.price) || 0;

  const stSel    = document.getElementById('calApptStaff');
  const staffId  = stSel?.value || '';
  const staffObj = _staff.find(s => s.id === staffId);
  const staffName= staffObj?.name || '';

  if (!client || !date || !time) { toast('Wypełnij wymagane pola', 'error'); return; }

  try {
    if (await hasConflict(staffId, date, time, duration, id || null)) {
      toast(`Konflikt: ${staffName || 'ten pracownik'} ma już wizytę o ${time}`, 'error');
      return;
    }
  } catch { /* sieć — nie blokuj */ }

  const data = { businessId: _bizId, clientName: client, clientPhone: phone,
    date, time, status, notes, serviceId, serviceName, duration, price, staffId, staffName };

  try {
    if (id) {
      await updateDoc(doc(db, 'appointments', id), data);
      const i = _appts.findIndex(a => a.id === id);
      if (i !== -1) _appts[i] = { ..._appts[i], ...data };
      toast('Wizyta zaktualizowana');
    } else {
      const ref = await addDoc(collection(db, 'appointments'), { ...data, createdAt: serverTimestamp() });
      _appts.push({ id: ref.id, ...data });
      toast('Wizyta dodana');
    }
    document.getElementById('calApptModal')?.classList.add('hidden');
    renderCalendar();
  } catch(e) {
    toast('Błąd zapisu: ' + e.message, 'error');
  }
}

function deleteAppt() {
  const id = document.getElementById('calApptId').value;
  if (!id) return;
  confirmAction('Czy na pewno chcesz usunąć tę wizytę? Tego działania nie można cofnąć.', async () => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      _appts = _appts.filter(a => a.id !== id);
      document.getElementById('calApptModal')?.classList.add('hidden');
      renderCalendar();
      toast('Wizyta usunięta', 'success');
    } catch(e) {
      toast('Błąd usuwania: ' + e.message, 'error');
    }
  });
}

function openStatusModal(id) {
  const modal = document.getElementById('calStatusModal');
  if (!modal) return;
  document.getElementById('calStatusApptId').value = id;
  const appt = _appts.find(a => a.id === id);
  document.getElementById('calStatusCurrent').textContent = appt ? statusLabel(appt.status) : '';
  modal.classList.remove('hidden');
}

async function setStatus(status) {
  const id = document.getElementById('calStatusApptId').value;
  if (!id) return;
  try {
    await updateDoc(doc(db, 'appointments', id), { status });
    const a = _appts.find(x => x.id === id);
    if (a) a.status = status;
    document.getElementById('calStatusModal')?.classList.add('hidden');
    renderCalendar();
    toast('Status zmieniony');
  } catch(e) { console.error('setStatus:', e); toast('Błąd', 'error'); }
}

// ===== CONFLICT DETECTION =====
async function hasConflict(staffId, date, time, duration, excludeId = null) {
  if (!staffId) return false;
  const snap = await getDocs(query(
    collection(db, 'appointments'),
    where('staffId', '==', staffId),
    where('date', '==', date)
  ));
  const newStart = timeToMin(time);
  const newEnd   = newStart + (duration || 60);
  return snap.docs.some(d => {
    if (excludeId && d.id === excludeId) return false;
    const a = d.data();
    if (['cancelled', 'anulowana'].includes(a.status)) return false;
    const aStart = timeToMin(a.time || '00:00');
    const aEnd   = aStart + (Number(a.duration) || 60);
    return newStart < aEnd && aStart < newEnd;
  });
}

// ===== HELPERS =====
function buildTimeCol() {
  let html = '';
  for (let i = 0; i < SLOTS; i++) {
    const min  = START_H * 60 + i * 30;
    const h    = Math.floor(min / 60);
    const m    = min % 60;
    const label= m === 0 ? `${h}:00` : '';
    html += `<div class="cal-time-slot" style="height:${SLOT_H}px">${label}</div>`;
  }
  return html;
}
function buildGridLines() {
  let html = '';
  for (let i = 0; i < SLOTS; i++) {
    html += `<div class="cal-grid-line ${i%2===0?'cal-grid-hour':''}" style="top:${i*SLOT_H}px"></div>`;
  }
  return html;
}
function apptsByDate(ds) {
  return _appts.filter(a => a.date === ds);
}
function minutesToTime(min) {
  min = Math.max(START_H * 60, Math.min(END_H * 60 - 30, min));
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
const esc = s => String(s ?? '').replaceAll('<', '&lt;');
function statusLabel(s) {
  const m = { pending:'Oczekująca', zaplanowana:'Zaplanowana', potwierdzona:'Potwierdzona',
    confirmed:'Potwierdzona', 'w trakcie':'W trakcie', zakończona:'Zakończona',
    completed:'Zakończona', cancelled:'Anulowana', anulowana:'Anulowana',
    'nie przyszedł':'Nie przyszedł' };
  return m[s] || s || '—';
}
