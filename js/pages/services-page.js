import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp }
  from '../firebase-config.js';
import { toast, confirmAction } from '../modules/utils.js';

let _bizId    = null;
let _services = [];
let _staff    = [];

export async function initServices(bizId) {
  _bizId = bizId || window.servicesPage?.bizId;

  const user = window.App?.user;
  if (!user) {
    const el = document.getElementById('servicesContainer');
    if (el) el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">lock</span></div>
      <h3>Zaloguj się</h3><p>Musisz być zalogowany jako właściciel salonu.</p>
      <button onclick="window.login()" class="btn btn-primary" style="margin-top:1.5rem">Zaloguj przez Google</button>
    </div>`;
    return;
  }

  if (!_bizId) _bizId = window.App?.userDoc?.businessId || user.uid;

  await Promise.all([loadServices(), loadStaffList()]);
  initSearch();
  initViewToggle();
  initCategoryFilter();

  window.saveService      = saveService;
  window.openServiceModal = openServiceModal;
}

async function loadServices() {
  try {
    const snap = await getDocs(collection(db, 'businesses', _bizId, 'services'));
    _services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _services = [];
  }
  renderServices(getFilteredServices());
  updateStats();
}

async function loadStaffList() {
  try {
    const snap = await getDocs(collection(db, 'businesses', _bizId, 'staff'));
    _staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _staff = [];
  }
}

function updateStats() {
  const total = document.getElementById('totalServices');
  const avg   = document.getElementById('avgPrice');
  if (total) total.textContent = _services.length;
  if (avg) avg.textContent = _services.length
    ? Math.round(_services.reduce((s, v) => s + (v.price || 0), 0) / _services.length) + ' zł'
    : '0 zł';
}

function getFilteredServices() {
  const cat    = document.querySelector('.category-link.active')?.dataset.category || 'all';
  const search = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
  return _services.filter(s => {
    const matchCat    = cat === 'all' || (s.category || '').toLowerCase() === cat;
    const matchSearch = !search || s.name.toLowerCase().includes(search) || (s.category || '').toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
}

function renderServices(list) {
  const el = document.getElementById('servicesContainer');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">content_cut</span></div>
      <h3>Brak usług</h3><p>Dodaj pierwszą usługę klikając przycisk powyżej.</p>
    </div>`;
    return;
  }

  el.innerHTML = list.map(s => `
    <div class="service-grid-card" style="border:1px solid var(--zinc-100);border-radius:.75rem;padding:1.25rem;display:flex;flex-direction:column;gap:.75rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <span style="background:var(--zinc-100);color:var(--zinc-500);font-size:.6875rem;font-weight:700;padding:.25rem .625rem;border-radius:99px">${s.category || s.name}</span>
        <div style="display:flex;gap:.5rem">
          <button onclick="window.openServiceModal('${s.id}')" style="color:var(--zinc-400);display:flex;align-items:center"><span class="material-icons" style="font-size:1.125rem">edit</span></button>
          <button onclick="deleteService('${s.id}')" style="color:#ef4444;display:flex;align-items:center"><span class="material-icons" style="font-size:1.125rem">delete</span></button>
        </div>
      </div>
      <div style="font-weight:700;font-size:.9375rem">${s.name}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="color:var(--zinc-400);font-size:.8125rem;display:flex;align-items:center;gap:.25rem">
          <span class="material-icons" style="font-size:.875rem">schedule</span>${s.duration} min
        </span>
        <span style="font-weight:800;font-size:1rem">${s.price} zł</span>
      </div>
    </div>`).join('');

  window.deleteService = (id) => {
    confirmAction('Usunąć usługę?', async () => {
      try {
        await deleteDoc(doc(db, 'businesses', _bizId, 'services', id));
        _services = _services.filter(s => s.id !== id);
        renderServices(getFilteredServices());
        updateStats();
        toast('Usługa usunięta');
      } catch(e) {
        toast('Błąd: ' + e.message, 'error');
      }
    });
  };
}

function initSearch() {
  document.getElementById('serviceSearch')?.addEventListener('input', () => {
    renderServices(getFilteredServices());
  });
}

function initViewToggle() {
  document.querySelectorAll('.view-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const container = document.getElementById('servicesContainer');
      if (container) {
        container.style.display = btn.dataset.view === 'list' ? 'flex' : 'grid';
        container.style.flexDirection = btn.dataset.view === 'list' ? 'column' : '';
      }
    });
  });
}

function initCategoryFilter() {
  document.querySelectorAll('.category-link[data-category]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      renderServices(getFilteredServices());
    });
  });
}

function openServiceModal(id = null) {
  const svc = id ? _services.find(s => s.id === id) : null;
  document.getElementById('serviceEditId').value  = id || '';
  document.getElementById('svcName').value        = svc?.name        || '';
  document.getElementById('svcCategory').value    = svc?.category    || '';
  document.getElementById('svcDuration').value    = svc?.duration    || '';
  document.getElementById('svcPrice').value       = svc?.price       || '';
  if (document.getElementById('svcDescription'))
    document.getElementById('svcDescription').value = svc?.description || '';
  document.getElementById('serviceModalTitle').textContent = id ? 'Edytuj usługę' : 'Dodaj usługę';

  const staffEl = document.getElementById('staffCheckboxes');
  if (staffEl) {
    staffEl.innerHTML = _staff.length
      ? _staff.map(st => `<label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.875rem">
          <input type="checkbox" value="${st.id}" ${(svc?.staffIds || []).includes(st.id) ? 'checked' : ''}>
          ${st.name}
        </label>`).join('')
      : '<span style="color:var(--zinc-400);font-size:.875rem">Brak pracowników</span>';
  }

  document.getElementById('serviceModal').classList.remove('hidden');
}

async function saveService() {
  const id          = document.getElementById('serviceEditId').value;
  const name        = document.getElementById('svcName').value.trim();
  const category    = document.getElementById('svcCategory').value.trim() || document.getElementById('svcCategory').options?.[document.getElementById('svcCategory').selectedIndex]?.value || '';
  const duration    = parseInt(document.getElementById('svcDuration').value) || 0;
  const price       = parseInt(document.getElementById('svcPrice').value) || 0;
  const description = document.getElementById('svcDescription')?.value.trim() || '';
  const staffIds    = [...(document.querySelectorAll('#staffCheckboxes input:checked') || [])].map(cb => cb.value);

  if (!name || !duration || !price) { toast('Wypełnij wymagane pola (nazwa, czas, cena)', 'error'); return; }

  const data = { name, category: category || name, duration, price, description, staffIds };

  try {
    if (id) {
      await updateDoc(doc(db, 'businesses', _bizId, 'services', id), data);
      const i = _services.findIndex(s => s.id === id);
      if (i !== -1) _services[i] = { ..._services[i], ...data };
    } else {
      const ref = await addDoc(collection(db, 'businesses', _bizId, 'services'), { ...data, createdAt: serverTimestamp() });
      _services.push({ id: ref.id, ...data });
    }
    document.getElementById('serviceModal').classList.add('hidden');
    renderServices(getFilteredServices());
    updateStats();
    toast(id ? 'Usługa zaktualizowana' : 'Usługa dodana', 'success');
  } catch(e) {
    toast('Błąd zapisu: ' + e.message, 'error');
  }
}
