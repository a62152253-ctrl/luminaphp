// admin/staff.js — Pracownicy
import { db, collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

const COLORS = ['#6366f1','#ec4899','#f59e0b','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ef4444'];

let _bizId, _staff;

export function initStaff(bizId, staff) {
  _bizId = bizId;
  _staff = staff;
  _staff.forEach((s, i) => { if (!s.color) s.color = COLORS[i % COLORS.length]; });
  renderStaff();
  window.bizSaveStaff    = saveStaff;
  window.bizDeleteStaff  = deleteStaff;
  window.bizOpenStaffModal = openStaffModal;
}

function renderStaff() {
  const el = document.getElementById('staffList');
  if (!el) return;

  if (!_staff.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">people</span>
      <p>Brak pracowników. Dodaj pierwszego.</p></div>`;
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
        : `<div class="biz-staff-avatar-placeholder" style="background:${s.color}">${esc(s.name?.[0]||'?')}</div>`}
    </div>
    <div class="biz-staff-name">${esc(s.name)}</div>
    <div class="biz-staff-title">${esc(s.title||'Pracownik')}</div>
    <div class="biz-staff-role-badge">${esc(s.role||'pracownik')}</div>
    <div class="biz-card-actions" style="margin-top:.75rem">
      <button class="biz-card-btn" onclick="bizOpenStaffModal('${s.id}','${esc(s.name)}','${esc(s.title||'')}','${esc(s.photoURL||'')}','${esc(s.role||'')}','${s.color}')">
        <span class="material-icons">edit</span>
      </button>
      <button class="biz-card-btn biz-card-btn-del" onclick="bizDeleteStaff('${s.id}')">
        <span class="material-icons">delete</span>
      </button>
    </div>
  </div>`;
}

function openStaffModal(id = '', name = '', title = '', photo = '', role = '', color = '') {
  document.getElementById('staffEditId').value   = id;
  document.getElementById('staffName').value     = name;
  document.getElementById('staffTitle').value    = title;
  document.getElementById('staffPhoto').value    = photo;

  const roleEl = document.getElementById('staffRole');
  if (roleEl) roleEl.value = role || 'pracownik';

  // Color picker
  const colorEl = document.getElementById('staffColor');
  if (colorEl) {
    colorEl.innerHTML = COLORS.map(c =>
      `<button type="button" class="staff-color-dot ${c === (color||COLORS[0]) ? 'selected' : ''}"
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
  const id    = document.getElementById('staffEditId').value;
  const name  = document.getElementById('staffName').value.trim();
  const title = document.getElementById('staffTitle').value.trim();
  const photo = document.getElementById('staffPhoto').value.trim();
  const role  = document.getElementById('staffRole')?.value || 'pracownik';
  const color = document.getElementById('staffColor')?.dataset.selected || COLORS[0];

  if (!name) { toast('Podaj imię pracownika', 'error'); return; }

  const data = { name, title, photoURL: photo, role, color };

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

const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");
