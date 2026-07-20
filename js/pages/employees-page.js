import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp }
  from '../firebase-config.js';
import { toast, confirmAction } from '../modules/utils.js';

let _bizId     = null;
let _employees = [];
let _services  = [];

const DAYS = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];

export async function initEmployees(bizId) {
  _bizId = bizId || window.employeesPage?.bizId;

  const user = window.App?.user;
  if (!user) {
    const el = document.getElementById('employeesContainer');
    if (el) el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">lock</span></div>
      <h3>Zaloguj się</h3><p>Musisz być zalogowany jako właściciel salonu.</p>
      <button onclick="window.login()" class="btn btn-primary" style="margin-top:1.5rem">Zaloguj przez Google</button>
    </div>`;
    return;
  }

  if (!_bizId) _bizId = window.App?.userDoc?.businessId || user.uid;

  await Promise.all([loadEmployees(), loadServicesList()]);
  initScheduleGrid();
  initSearch();

  window.saveEmployee      = saveEmployee;
  window.openEmployeeModal = openEmployeeModal;
}

async function loadEmployees() {
  try {
    const snap = await getDocs(collection(db, 'businesses', _bizId, 'staff'));
    _employees = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _employees = [];
  }
  renderEmployees(getFilteredEmployees());
  updateStats();
}

async function loadServicesList() {
  try {
    const snap = await getDocs(collection(db, 'businesses', _bizId, 'services'));
    _services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _services = [];
  }
}

function updateStats() {
  const total  = document.getElementById('totalEmployees');
  const active = document.getElementById('activeToday');
  if (total)  total.textContent  = _employees.length;
  if (active) active.textContent = _employees.filter(e => e.status !== 'inactive').length;
}

function getFilteredEmployees() {
  const filter = document.getElementById('employeeFilter')?.value || 'all';
  const search = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
  return _employees.filter(e => {
    const matchFilter = filter === 'all' || e.status === filter || (!e.status && filter === 'active');
    const matchSearch = !search || e.name.toLowerCase().includes(search) || (e.title || '').toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });
}

function renderEmployees(list) {
  const el = document.getElementById('employeesContainer');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">people</span></div>
      <h3>Brak pracowników</h3><p>Dodaj pierwszego pracownika.</p>
    </div>`;
    return;
  }

  el.innerHTML = list.map(e => `
    <div class="employee-card" style="display:flex;align-items:center;gap:1rem;padding:1rem;border:1px solid var(--zinc-100);border-radius:.75rem;margin-bottom:.75rem">
      <img src="${e.photoURL || 'https://i.pravatar.cc/200'}" alt="${e.name}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.9375rem">${e.name}</div>
        <div style="color:var(--zinc-400);font-size:.8125rem;margin-top:.2rem">${e.title || 'Pracownik'}</div>
        ${e.email ? `<div style="color:var(--zinc-400);font-size:.75rem;margin-top:.15rem">${e.email}</div>` : ''}
      </div>
      <span class="badge-status badge-${e.status === 'inactive' ? 'cancelled' : 'confirmed'}" style="flex-shrink:0">${e.status === 'inactive' ? 'Nieaktywny' : 'Aktywny'}</span>
      <div style="display:flex;gap:.5rem;flex-shrink:0">
        <button onclick="window.openEmployeeModal('${e.id}')" style="color:var(--zinc-400);display:flex;align-items:center"><span class="material-icons">edit</span></button>
        <button onclick="deleteEmployee('${e.id}')" style="color:#ef4444;display:flex;align-items:center"><span class="material-icons">delete</span></button>
      </div>
    </div>`).join('');

  window.deleteEmployee = (id) => {
    confirmAction('Usunąć pracownika?', async () => {
      try {
        await deleteDoc(doc(db, 'businesses', _bizId, 'staff', id));
        _employees = _employees.filter(e => e.id !== id);
        renderEmployees(getFilteredEmployees());
        updateStats();
        toast('Pracownik usunięty');
      } catch(e) {
        toast('Błąd: ' + e.message, 'error');
      }
    });
  };
}

function initSearch() {
  document.getElementById('employeeSearch')?.addEventListener('input', () => renderEmployees(getFilteredEmployees()));
  document.getElementById('employeeFilter')?.addEventListener('change', () => renderEmployees(getFilteredEmployees()));
}

function initScheduleGrid() {
  const el = document.getElementById('empScheduleGrid');
  if (!el) return;
  el.innerHTML = DAYS.map((d, i) => `
    <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid var(--zinc-50)">
      <span style="width:110px;font-size:.875rem;font-weight:600">${d}</span>
      <input type="time" id="schedOpen${i}" value="09:00" style="font-size:.875rem;padding:.25rem .5rem;border:1px solid var(--zinc-200);border-radius:.375rem">
      <span style="color:var(--zinc-400)">–</span>
      <input type="time" id="schedClose${i}" value="18:00" style="font-size:.875rem;padding:.25rem .5rem;border:1px solid var(--zinc-200);border-radius:.375rem">
      <label style="display:flex;align-items:center;gap:.35rem;cursor:pointer;font-size:.8125rem;color:var(--zinc-500)">
        <input type="checkbox" id="schedClosed${i}"
          onchange="document.getElementById('schedOpen${i}').disabled=this.checked;document.getElementById('schedClose${i}').disabled=this.checked">
        Wolne
      </label>
    </div>`).join('');
}

function openEmployeeModal(id = null) {
  const emp = id ? _employees.find(e => e.id === id) : null;

  document.getElementById('employeeEditId').value = id || '';
  document.getElementById('empName').value        = emp?.name       || '';
  document.getElementById('empTitle').value       = emp?.title      || '';
  document.getElementById('empEmail').value       = emp?.email      || '';
  document.getElementById('empPhone').value       = emp?.phone      || '';
  document.getElementById('empPhoto').value       = emp?.photoURL   || '';
  document.getElementById('empBio').value         = emp?.bio        || '';
  document.getElementById('empCommission').value  = emp?.commission || '';
  document.getElementById('empStatus').value      = emp?.status     || 'active';
  document.getElementById('employeeModalTitle').textContent = id ? 'Edytuj pracownika' : 'Dodaj pracownika';

  const svcEl = document.getElementById('empServicesCheckboxes');
  if (svcEl) {
    svcEl.innerHTML = _services.length
      ? _services.map(s => `<label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.875rem">
          <input type="checkbox" value="${s.id}" ${(emp?.serviceIds || []).includes(s.id) ? 'checked' : ''}>
          ${s.name}
        </label>`).join('')
      : '<span style="color:var(--zinc-400);font-size:.875rem">Brak usług</span>';
  }

  if (emp?.schedule) {
    emp.schedule.forEach((s, i) => {
      const open   = document.getElementById(`schedOpen${i}`);
      const close  = document.getElementById(`schedClose${i}`);
      const closed = document.getElementById(`schedClosed${i}`);
      if (open)   { open.value   = s.open  || '09:00'; open.disabled   = s.closed; }
      if (close)  { close.value  = s.close || '18:00'; close.disabled  = s.closed; }
      if (closed)   closed.checked = s.closed || false;
    });
  }

  document.getElementById('employeeModal').classList.remove('hidden');
}

async function saveEmployee() {
  const id         = document.getElementById('employeeEditId').value;
  const name       = document.getElementById('empName').value.trim();
  const title      = document.getElementById('empTitle').value.trim();
  const email      = document.getElementById('empEmail').value.trim();
  const phone      = document.getElementById('empPhone').value.trim();
  const photoURL   = document.getElementById('empPhoto').value.trim();
  const bio        = document.getElementById('empBio').value.trim();
  const commission = parseInt(document.getElementById('empCommission').value) || 0;
  const status     = document.getElementById('empStatus').value || 'active';
  const serviceIds = [...(document.querySelectorAll('#empServicesCheckboxes input:checked') || [])].map(cb => cb.value);
  const schedule   = DAYS.map((day, i) => ({
    day,
    open:   document.getElementById(`schedOpen${i}`)?.value   || '09:00',
    close:  document.getElementById(`schedClose${i}`)?.value  || '18:00',
    closed: document.getElementById(`schedClosed${i}`)?.checked || false,
  }));

  if (!name || !title) { toast('Podaj imię i stanowisko pracownika', 'error'); return; }

  const data = { name, title, email, phone, photoURL: photoURL || 'https://i.pravatar.cc/200', bio, commission, status, serviceIds, schedule };

  try {
    if (id) {
      await updateDoc(doc(db, 'businesses', _bizId, 'staff', id), data);
      const i = _employees.findIndex(e => e.id === id);
      if (i !== -1) _employees[i] = { ..._employees[i], ...data };
    } else {
      const ref = await addDoc(collection(db, 'businesses', _bizId, 'staff'), { ...data, createdAt: serverTimestamp() });
      _employees.push({ id: ref.id, ...data });
    }
    document.getElementById('employeeModal').classList.add('hidden');
    renderEmployees(getFilteredEmployees());
    updateStats();
    toast(id ? 'Pracownik zaktualizowany' : 'Pracownik dodany', 'success');
  } catch(e) {
    toast('Błąd zapisu: ' + e.message, 'error');
  }
}
