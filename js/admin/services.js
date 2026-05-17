// admin/services.js — Usługi
import { db, collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

let _bizId, _services;

export function initServices(bizId, services) {
  _bizId    = bizId;
  _services = services;
  renderServices();
  window.bizSaveService   = saveService;
  window.bizDeleteService = deleteService;
  window.bizOpenServiceModal = openServiceModal;
}

function renderServices() {
  const el = document.getElementById('servicesList');
  if (!el) return;

  if (!_services.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">content_cut</span>
      <p>Brak usług. Dodaj pierwszą usługę.</p></div>`;
    return;
  }

  // Group by category
  const byCategory = {};
  _services.forEach(s => {
    const cat = s.category || 'Inne';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(s);
  });

  el.innerHTML = Object.entries(byCategory).map(([cat, svcs]) => `
    <div class="svc-category-block">
      <div class="svc-category-header">${esc(cat)}</div>
      <div class="biz-services-grid">
        ${svcs.map(s => serviceCard(s)).join('')}
      </div>
    </div>`).join('');
}

function serviceCard(s) {
  return `<div class="biz-service-card">
    <div class="biz-service-card-top">
      <div class="biz-service-name">${esc(s.name)}</div>
      <div class="biz-service-price">${s.price || 0} zł</div>
    </div>
    <div class="biz-service-meta">
      <span class="material-icons" style="font-size:.875rem">schedule</span> ${s.duration || 60} min
    </div>
    <div class="biz-card-actions">
      <button class="biz-card-btn" onclick="bizOpenServiceModal('${s.id}','${esc(s.name)}','${esc(s.category||'')}',${s.duration||60},${s.price||0})">
        <span class="material-icons">edit</span>
      </button>
      <button class="biz-card-btn biz-card-btn-del" onclick="bizDeleteService('${s.id}')">
        <span class="material-icons">delete</span>
      </button>
    </div>
  </div>`;
}

function openServiceModal(id = '', name = '', category = '', duration = 60, price = 0) {
  document.getElementById('serviceEditId').value   = id;
  document.getElementById('svcName').value         = name;
  document.getElementById('svcCategory').value     = category;
  document.getElementById('svcDuration').value     = duration;
  document.getElementById('svcPrice').value        = price;
  document.getElementById('serviceModalTitle').textContent = id ? 'Edytuj usługę' : 'Dodaj usługę';
  document.getElementById('serviceModal')?.classList.remove('hidden');
}

async function saveService() {
  const id       = document.getElementById('serviceEditId').value;
  const name     = document.getElementById('svcName').value.trim();
  const category = document.getElementById('svcCategory').value.trim();
  const duration = parseInt(document.getElementById('svcDuration').value) || 60;
  const price    = parseInt(document.getElementById('svcPrice').value) || 0;

  if (!name) { toast('Podaj nazwę usługi', 'error'); return; }

  const data = { name, category, duration, price };

  try {
    if (id) {
      await updateDoc(doc(db, 'businesses', _bizId, 'services', id), data);
      const i = _services.findIndex(s => s.id === id);
      if (i !== -1) _services[i] = { ..._services[i], ...data };
      toast('Usługa zaktualizowana');
    } else {
      const ref = await addDoc(collection(db, 'businesses', _bizId, 'services'), { ...data, createdAt: serverTimestamp() });
      _services.push({ id: ref.id, ...data });
      toast('Usługa dodana');
    }
    document.getElementById('serviceModal')?.classList.add('hidden');
    renderServices();
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

async function deleteService(id) {
  if (!confirm('Usunąć usługę?')) return;
  try {
    await deleteDoc(doc(db, 'businesses', _bizId, 'services', id));
    _services = _services.filter(s => s.id !== id);
    renderServices();
    toast('Usługa usunięta');
  } catch(e) { toast('Błąd', 'error'); }
}

const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");
