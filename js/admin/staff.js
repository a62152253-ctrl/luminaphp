// admin/staff.js — Pracownicy + Grafik + Prowizje + Cele (KPI)
import { db, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';
import { initSchedule } from './schedule.js';

const COLORS = ['#6366f1','#ec4899','#f59e0b','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ef4444'];

let _bizId, _staff, _appts;
let _scheduleLoaded = false;

export function initStaff(bizId, staff, appts) {
  _bizId = bizId;
  _staff = staff;
  _appts = appts || [];
  _staff.forEach((s, i) => { if (!s.color) s.color = COLORS[i % COLORS.length]; });
  renderStaff();
  initSubTabs();

  window.bizSaveStaff      = saveStaff;
  window.bizDeleteStaff    = deleteStaff;
  window.bizOpenStaffModal = openStaffModal;
}

// ===== SUB-TABS =====

function initSubTabs() {
  document.querySelectorAll('#staffSubTabs .biz-sub-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSubTab(btn.dataset.stab));
  });
}

function switchSubTab(stab) {
  document.querySelectorAll('#staffSubTabs .biz-sub-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.stab === stab));

  const panels = {
    'staff-list':  'staffListPanel',
    'schedule':    'schedulePanel',
    'commissions': 'commissionsPanel',
    'kpi':         'kpiPanel',
  };
  Object.entries(panels).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', key !== stab);
  });

  const addBtn = document.getElementById('staffAddBtn');
  if (addBtn) addBtn.style.display = stab === 'staff-list' ? '' : 'none';

  if (stab === 'schedule' && !_scheduleLoaded) {
    _scheduleLoaded = true;
    initSchedule(_bizId, _staff);
  }
  if (stab === 'commissions') renderCommissions();
  if (stab === 'kpi') renderKPI();
}

// ===== STAFF LIST =====

function renderStaff() {
  const el = document.getElementById('staffList');
  if (!el) return;
  if (!_staff.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">people</span>
      <p>Brak pracowników. Dodaj pierwszego.</p>
    </div>`;
    return;
  }
  el.className = 'biz-staff-grid';
  el.innerHTML = _staff.map(s => staffCard(s)).join('');
}

function staffCard(s) {
  return `<div class="biz-staff-card">
    <div class="biz-staff-color-bar" style="background:${s.color}"></div>
    <div class="biz-staff-avatar-wrap">
      ${s.photoURL
        ? `<img src="${esc(s.photoURL)}" class="biz-staff-avatar" alt="">`
        : `<div class="biz-staff-avatar-placeholder" style="background:${s.color}">${esc(s.name?.[0] || '?')}</div>`}
    </div>
    <div class="biz-staff-name">${esc(s.name)}</div>
    <div class="biz-staff-title">${esc(s.title || 'Pracownik')}</div>
    <div class="biz-staff-role-badge">${esc(s.role || 'pracownik')}</div>
    ${s.commission ? `<div class="biz-staff-commission">Prowizja: ${s.commission}%</div>` : ''}
    <div class="biz-card-actions" style="margin-top:.75rem">
      <button class="biz-card-btn" onclick="bizOpenStaffModal('${s.id}','${esc(s.name)}','${esc(s.title||'')}','${esc(s.photoURL||'')}','${esc(s.role||'')}','${s.color}',${Number(s.commission||0)})">
        <span class="material-icons">edit</span>
      </button>
      <button class="biz-card-btn biz-card-btn-del" onclick="bizDeleteStaff('${s.id}')">
        <span class="material-icons">delete</span>
      </button>
    </div>
  </div>`;
}

function openStaffModal(id = '', name = '', title = '', photo = '', role = '', color = '', commission = 0) {
  document.getElementById('staffEditId').value    = id;
  document.getElementById('staffName').value      = name;
  document.getElementById('staffTitle').value     = title;
  document.getElementById('staffPhoto').value     = photo;
  document.getElementById('staffCommission').value = commission || '';

  const roleEl = document.getElementById('staffRole');
  if (roleEl) roleEl.value = role || 'pracownik';

  const colorEl = document.getElementById('staffColor');
  if (colorEl) {
    colorEl.innerHTML = COLORS.map(c =>
      `<button type="button" class="staff-color-dot ${c === (color || COLORS[0]) ? 'selected' : ''}"
        style="background:${c}" data-color="${c}" onclick="staffPickColor(this)"></button>`
    ).join('');
    colorEl.dataset.selected = color || COLORS[0];
  }

  document.getElementById('staffModalTitle').textContent = id ? 'Edytuj pracownika' : 'Dodaj pracownika';
  document.getElementById('staffModal')?.classList.remove('hidden');
}

window.staffPickColor = btn => {
  document.querySelectorAll('.staff-color-dot').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('staffColor').dataset.selected = btn.dataset.color;
};

async function saveStaff() {
  const id         = document.getElementById('staffEditId').value;
  const name       = document.getElementById('staffName').value.trim();
  const title      = document.getElementById('staffTitle').value.trim();
  const photo      = document.getElementById('staffPhoto').value.trim();
  const role       = document.getElementById('staffRole')?.value || 'pracownik';
  const color      = document.getElementById('staffColor')?.dataset.selected || COLORS[0];
  const commission = parseFloat(document.getElementById('staffCommission')?.value) || 0;

  if (!name) { toast('Podaj imię pracownika', 'error'); return; }

  const data = { name, title, photoURL: photo, role, color, commission };

  try {
    if (id) {
      await updateDoc(doc(db, 'businesses', _bizId, 'staff', id), data);
      const i = _staff.findIndex(s => s.id === id);
      if (i !== -1) _staff[i] = { ..._staff[i], ...data };
      toast('Pracownik zaktualizowany');
    } else {
      const ref = await addDoc(collection(db, 'businesses', _bizId, 'staff'), { ...data, createdAt: serverTimestamp() });
      _staff.push({ id: ref.id, ...data });
      toast('Pracownik dodany');
    }
    document.getElementById('staffModal')?.classList.add('hidden');
    renderStaff();
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

async function deleteStaff(id) {
  if (!confirm('Usunąć pracownika?')) return;
  try {
    await deleteDoc(doc(db, 'businesses', _bizId, 'staff', id));
    _staff = _staff.filter(s => s.id !== id);
    renderStaff();
    toast('Pracownik usunięty');
  } catch(e) { toast('Błąd', 'error'); }
}

// ===== COMMISSIONS =====

function renderCommissions() {
  const el = document.getElementById('commissionsView');
  if (!el) return;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const rows = _staff.map(s => {
    const mine      = _appts.filter(a => a.staffId === s.id || a.staffName === s.name);
    const thisMonthAppts = mine.filter(a => (a.date || '').startsWith(thisMonth) && completedStatus(a.status));
    const lastMonthAppts = mine.filter(a => (a.date || '').startsWith(lastMonth) && completedStatus(a.status));
    const thisRev   = thisMonthAppts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const lastRev   = lastMonthAppts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const commPct   = Number(s.commission) || 0;
    const commAmt   = Math.round(thisRev * commPct / 100);
    const diff      = lastRev ? Math.round((thisRev - lastRev) / lastRev * 100) : 0;

    return { s, mine, thisRev, lastRev, commPct, commAmt, diff };
  });

  const totalRev  = rows.reduce((sum, r) => sum + r.thisRev, 0);
  const totalComm = rows.reduce((sum, r) => sum + r.commAmt, 0);

  el.innerHTML = `
    <div class="commissions-summary">
      <div class="comm-summary-item">
        <span class="material-icons">payments</span>
        <div><strong>${totalRev} zł</strong><span>Przychód (ten miesiąc)</span></div>
      </div>
      <div class="comm-summary-item">
        <span class="material-icons">percent</span>
        <div><strong>${totalComm} zł</strong><span>Prowizje łącznie</span></div>
      </div>
    </div>

    <div class="commissions-table">
      <div class="comm-table-head">
        <span>Pracownik</span>
        <span>Wizyty</span>
        <span>Przychód</span>
        <span>Prowizja %</span>
        <span>Do wypłaty</span>
        <span>Zmiana MoM</span>
      </div>
      ${rows.map(r => `
        <div class="comm-table-row">
          <div class="comm-staff-cell">
            <div class="comm-staff-dot" style="background:${r.s.color || '#6366f1'}"></div>
            <span>${esc(r.s.name)}</span>
          </div>
          <div>${r.mine.filter(a => (a.date || '').startsWith(thisMonth)).length}</div>
          <div class="comm-revenue">${r.thisRev} zł</div>
          <div>
            <span class="comm-pct-badge">${r.commPct}%</span>
          </div>
          <div class="comm-payout">${r.commAmt} zł</div>
          <div>
            <span class="kpi-diff ${r.diff >= 0 ? 'kpi-up' : 'kpi-down'}">
              ${r.diff >= 0 ? '▲' : '▼'} ${Math.abs(r.diff)}%
            </span>
          </div>
        </div>`).join('')}
    </div>
    <p class="comm-note">* Prowizje dotyczą bieżącego miesiąca, tylko zakończone wizyty.</p>`;
}

// ===== KPI GOALS =====

async function renderKPI() {
  const el = document.getElementById('kpiView');
  if (!el) return;

  el.innerHTML = `<div class="spinner" style="margin:3rem auto"></div>`;

  // Load saved goals
  let goals = {};
  try {
    const snap = await getDocs(query(collection(db, 'kpiGoals'), where('businessId', '==', _bizId)));
    snap.docs.forEach(d => { goals[d.data().staffId || 'salon'] = d.data(); });
  } catch(e) {}

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const buildRow = (label, staffId, color) => {
    const mine    = staffId === 'salon'
      ? _appts
      : _appts.filter(a => a.staffId === staffId || a.staffName === label);
    const revenue = mine
      .filter(a => (a.date || '').startsWith(thisMonth) && completedStatus(a.status))
      .reduce((s, a) => s + (Number(a.price) || 0), 0);
    const target  = Number(goals[staffId]?.target) || 0;
    const pct     = target ? Math.min(Math.round(revenue / target * 100), 100) : 0;
    const visits  = mine.filter(a => (a.date || '').startsWith(thisMonth)).length;

    return `<div class="kpi-card">
      <div class="kpi-card-header">
        <div class="kpi-staff-dot" style="background:${color || '#6366f1'}"></div>
        <div class="kpi-staff-name">${esc(label)}</div>
        <div class="kpi-month-badge">${now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</div>
      </div>
      <div class="kpi-stats-row">
        <div class="kpi-stat"><strong>${revenue} zł</strong><span>Przychód</span></div>
        <div class="kpi-stat"><strong>${visits}</strong><span>Wizyty</span></div>
        <div class="kpi-stat"><strong>${target ? target + ' zł' : '—'}</strong><span>Cel</span></div>
      </div>
      <div class="kpi-progress-wrap">
        <div class="kpi-progress-bar-bg">
          <div class="kpi-progress-bar-fill" style="width:${pct}%;background:${pct >= 100 ? '#22c55e' : pct >= 60 ? '#f59e0b' : color || '#6366f1'}"></div>
        </div>
        <span class="kpi-pct-label">${pct}%</span>
      </div>
      <div class="kpi-goal-row">
        <label class="kpi-goal-label">Cel miesięczny (zł):</label>
        <input type="number" class="kpi-goal-input" id="kpiGoal_${staffId}"
          value="${target || ''}" placeholder="np. 5000" min="0" step="100">
        <button class="btn btn-accent btn-sm" onclick="kpiSaveGoal('${staffId}', '${esc(label)}')">
          <span class="material-icons">save</span>
        </button>
      </div>
    </div>`;
  };

  el.innerHTML = `
    <div class="kpi-grid">
      ${buildRow('Cały salon', 'salon', '#f43f5e')}
      ${_staff.map(s => buildRow(s.name, s.id, s.color)).join('')}
    </div>`;

  window.kpiSaveGoal = async (staffId, staffName) => {
    const val = parseFloat(document.getElementById(`kpiGoal_${staffId}`)?.value) || 0;
    const existing = goals[staffId];
    try {
      if (existing?.docId) {
        await updateDoc(doc(db, 'kpiGoals', existing.docId), { target: val });
      } else {
        const ref = await addDoc(collection(db, 'kpiGoals'), {
          businessId: _bizId, staffId, staffName, target: val,
          createdAt: serverTimestamp(),
        });
        goals[staffId] = { target: val, docId: ref.id, staffId };
      }
      toast('Cel zapisany');
      await renderKPI();
    } catch(e) { toast('Błąd zapisu', 'error'); }
  };
}

// ===== HELPERS =====

function completedStatus(s) {
  return ['confirmed', 'zakończona', 'completed'].includes(s);
}

const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");
