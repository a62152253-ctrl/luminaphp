import { getBusinessById, loadServices, loadStaff } from '../modules/businesses.js';
import { db, collection, addDoc, getDocs, query, where, serverTimestamp } from '../firebase-config.js';
import { toast, formatDuration, escHtml } from '../modules/utils.js';
import { addToCalendar, getBookedTimesForDay } from '../modules/booking-mgr.js';

const STATE_KEY = 'lumina_booking';

function saveState(state) {
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
}

function restoreState(bizId) {
  try {
    const s = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    if (s.bizId === bizId) return s;
  } catch(e) {}
  return { bizId, service: null, staff: null, date: new Date().toISOString().split('T')[0], time: null };
}

export async function initBooking(bizId) {
  if (!bizId) { window.location.href = '/luminaphp/?page=explore'; return; }

  const state = window.bookingState;
  if (!state) return;

  const saved = restoreState(bizId);
  state.service = saved.service;
  state.staff   = saved.staff;
  state.date    = saved.date || new Date().toISOString().split('T')[0];
  state.time    = saved.time;

  const step = Number(state.step);
  if      (step === 1) await renderStep1(bizId, state);
  else if (step === 2) await renderStep2(bizId, state);
  else if (step === 3) renderStep3(state);
  else if (step === 4) await renderStep4(bizId, state);
}

async function renderStep1(bizId, state) {
  const el = document.getElementById('bookingServicesList');
  if (!el) return;

  const services = await loadServices(bizId);
  if (!services.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">content_cut</span></div>
      <h3>Brak usług</h3><p>Ten salon nie ma jeszcze żadnych usług.</p>
    </div>`;
    return;
  }

  el.innerHTML = services.map(s => `
    <div class="booking-service-item" onclick='selectServiceStep(${JSON.stringify(s)})' style="cursor:pointer;display:flex;align-items:center;gap:1rem;padding:1rem;border:1px solid var(--zinc-100);border-radius:.75rem;margin-bottom:.75rem">
      <div style="flex:1">
        <div style="font-weight:700;font-size:.9375rem">${escHtml(s.name)}</div>
        <div style="color:var(--zinc-400);font-size:.8125rem;margin-top:.25rem">${formatDuration(s.duration)}</div>
        ${s.description ? `<div style="color:var(--zinc-500);font-size:.8125rem;margin-top:.25rem">${escHtml(s.description)}</div>` : ''}
      </div>
      <div style="font-weight:800;font-size:1rem">${escHtml(String(s.price))} zł</div>
      <span class="material-icons" style="color:var(--zinc-300)">chevron_right</span>
    </div>`).join('');

  window.selectServiceStep = (s) => {
    state.service = s;
    saveState(state);
    window.location.href = `/luminaphp/?page=booking&id=${bizId}&step=2`;
  };
}

async function renderStep2(bizId, state) {
  const el = document.getElementById('bookingStaffList');
  if (!el) return;

  const staff = await loadStaff(bizId);
  const skipBtn = `<button class="btn btn-secondary" style="margin-top:1.5rem" onclick="skipStaffStep()">Pomiń — dowolny specjalista</button>`;

  if (!staff.length) {
    el.innerHTML = `<p style="color:var(--zinc-400)">Brak przypisanych specjalistów.</p>${skipBtn}`;
  } else {
    el.innerHTML = `<div class="booking-staff-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1rem;margin-bottom:1.5rem">
      ${staff.map(s => `
        <div class="staff-card" data-id="${escHtml(s.id)}" onclick='selectStaffStep(${JSON.stringify(s)})' style="cursor:pointer;text-align:center;padding:1.25rem;border:1px solid var(--zinc-100);border-radius:.75rem">
          <img src="${escHtml(s.photoURL || '')}" alt="${escHtml(s.name)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin-bottom:.75rem" onerror="this.src=''">
          <div style="font-weight:700;font-size:.875rem">${escHtml(s.name)}</div>
          <div style="color:var(--zinc-400);font-size:.75rem;margin-top:.2rem">${escHtml(s.title || '')}</div>
        </div>`).join('')}
    </div>${skipBtn}`;
  }

  window.selectStaffStep = (s) => {
    state.staff = s;
    saveState(state);
    window.location.href = `/luminaphp/?page=booking&id=${bizId}&step=3`;
  };

  window.skipStaffStep = () => {
    state.staff = null;
    saveState(state);
    window.location.href = `/luminaphp/?page=booking&id=${bizId}&step=3`;
  };
}

function renderStep3(state) {
  const dateGrid = document.getElementById('bookingDateGrid');
  const timeGrid = document.getElementById('bookingTimeGrid');
  const nextBtn  = document.getElementById('step3Next');

  const days = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];
  const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  if (dateGrid) {
    const today = new Date();
    dateGrid.innerHTML = Array.from({length: 30}, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;
      return `<button class="date-btn${dateStr === state.date ? ' selected' : ''}" data-date="${dateStr}"
        onclick="selectDateStep(this,'${dateStr}')" title="${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}">
        <span class="day-name">${days[d.getDay()]}</span>
        <span class="day-num">${d.getDate()}</span>
        ${isToday ? '<span class="day-today-dot"></span>' : ''}
      </button>`;
    }).join('');
  }

  async function refreshTimeGrid(date) {
    if (!timeGrid) return;
    timeGrid.innerHTML = '<div style="padding:.75rem;color:var(--zinc-400);font-size:.875rem;display:flex;align-items:center;gap:.5rem"><span class="material-icons" style="font-size:1rem;animation:spin .8s linear infinite">sync</span>Ładowanie dostępności…</div>';

    let booked;
    try {
      booked = await getBookedTimesForDay(state.staff?.id || null, date);
    } catch(_) {
      timeGrid.innerHTML = '<div style="padding:.75rem;color:#ef4444;font-size:.875rem;display:flex;align-items:center;gap:.5rem"><span class="material-icons" style="font-size:1rem">wifi_off</span>Nie udało się załadować godzin. <button id="retryTimeGrid" style="text-decoration:underline;color:inherit;margin-left:.25rem">Spróbuj ponownie</button></div>';
      document.getElementById('retryTimeGrid')?.addEventListener('click', () => refreshTimeGrid(state.date));
      return;
    }

    const slots = [];
    for (let m = 9 * 60; m <= 19 * 60; m += 30) {
      const h = Math.floor(m / 60), min = m % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`);
    }
    timeGrid.innerHTML = slots.map(t => {
      const taken = booked.includes(t);
      return `<button class="time-btn${t === state.time ? ' selected' : ''}${taken ? ' time-btn--taken' : ''}"
        data-time="${t}" onclick="selectTimeStep(this,'${t}')" ${taken ? 'disabled title="Zajęty"' : ''}>${t}</button>`;
    }).join('');
  }

  refreshTimeGrid(state.date);
  if (nextBtn) nextBtn.disabled = !state.time;

  window.selectDateStep = (btn, date) => {
    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.date = date;
    state.time = null;
    saveState(state);
    if (nextBtn) nextBtn.disabled = true;
    refreshTimeGrid(date);
  };

  window.selectTimeStep = (btn, time) => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.time = time;
    saveState(state);
    if (nextBtn) nextBtn.disabled = false;
  };
}

async function renderStep4(bizId, state) {
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  const biz = await getBusinessById(bizId);
  setText('confirmSalon',    biz?.name || '—');
  setText('confirmService',  state.service ? `${state.service.name} (${state.service.duration} min)` : '—');
  setText('confirmStaff',    state.staff?.name || 'Dowolny specjalista');
  setText('confirmDateTime', state.date && state.time ? `${state.date} o ${state.time}` : '—');
  setText('confirmPrice',    state.service ? `${state.service.price} zł` : '0 zł');

  async function checkConflict(staffId, date, time, duration) {
    if (!staffId) return false;
    const snap = await getDocs(query(
      collection(db, 'appointments'),
      where('staffId', '==', staffId),
      where('date', '==', date)
    ));
    const toMin = t => { const [h,m] = (t||'00:00').split(':').map(Number); return h*60+m; };
    const newStart = toMin(time);
    const newEnd   = newStart + (duration || 60);
    return snap.docs.some(d => {
      const a = d.data();
      if (['cancelled','anulowana'].includes(a.status)) return false;
      const s = toMin(a.time || '00:00');
      return newStart < s + (Number(a.duration)||60) && s < newEnd;
    });
  }

  window.finalizeBooking = async () => {
    const user = window.App?.user;
    if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
    if (!state.service || !state.time) { toast('Wybierz usługę i termin', 'error'); return; }

    const btn = document.querySelector('.wizard-actions .btn-accent');
    if (btn) { btn.disabled = true; btn.textContent = 'Sprawdzam dostępność...'; }

    try {
      if (await checkConflict(state.staff?.id, state.date, state.time, state.service.duration)) {
        toast('Wybrany specjalista ma już wizytę w tym terminie. Wybierz inną godzinę.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Potwierdź rezerwację'; }
        return;
      }
    } catch { /* sieć — nie blokuj rezerwacji */ }

    if (btn) btn.textContent = 'Rezerwuję...';

    try {
      await addDoc(collection(db, 'appointments'), {
        userId:       user.uid,
        businessId:   bizId,
        businessName: biz?.name || '',
        serviceId:    state.service.id,
        serviceName:  state.service.name,
        staffId:      state.staff?.id || null,
        staffName:    state.staff?.name || '',
        date:         state.date,
        time:         state.time,
        status:       'pending',
        price:        state.service.price,
        clientName:   user.displayName || user.email || 'Klient',
        clientPhoto:  user.photoURL || '',
        createdAt:    serverTimestamp(),
      });
      sessionStorage.removeItem(STATE_KEY);
      toast('Wizyta zarezerwowana! Czekaj na potwierdzenie.', 'success');

      // Offer calendar export
      window.addApptToCalendar = () => addToCalendar({
        id: 'new',
        date: state.date, time: state.time,
        serviceName: state.service.name,
        businessName: biz?.name || '',
        staffName: state.staff?.name || '',
        price: state.service.price,
        duration: state.service.duration,
      });

      setTimeout(() => { window.location.href = '/luminaphp/?page=dashboard'; }, 1800);
    } catch(e) {
      toast('Błąd rezerwacji: ' + e.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Potwierdź rezerwację'; }
    }
  };
}
