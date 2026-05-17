// admin/offers.js — Oferty i Promocje
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp }
  from '../firebase-config.js';
import { toast, confirmAction } from '../modules/utils.js';

let _bizId, _bizDoc, _promos = [];

export async function initOffers(bizId, bizDoc) {
  _bizId  = bizId;
  _bizDoc = bizDoc;
  await loadPromos();
  renderPromos();
  window.bizSavePromo   = savePromo;
  window.bizDeletePromo = deletePromo;
  window.bizOpenPromoModal = openPromoModal;
}

async function loadPromos() {
  try {
    const q = query(collection(db, 'promotions'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _promos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { _promos = []; }
}

function renderPromos() {
  const el = document.getElementById('promosList');
  if (!el) return;

  if (!_promos.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">local_offer</span>
      <p>Brak ofert. Dodaj pierwszą — pojawi się na stronie głównej.</p></div>`;
    return;
  }

  el.className = 'biz-services-grid';
  el.innerHTML = _promos.map(p => {
    const orig = p.originalPrice || 1;
    const disc = p.discountPrice || 0;
    const pct  = p.discountPercent ?? Math.round((1 - disc / orig) * 100);
    return `<div class="biz-promo-card">
      ${p.photoURL ? `<img src="${esc(p.photoURL)}" class="biz-promo-img" alt="">` : '<div class="biz-promo-img-placeholder"><span class="material-icons">local_offer</span></div>'}
      <div class="biz-promo-badge">-${pct}%</div>
      <div class="biz-promo-body">
        <div class="biz-promo-title">${esc(p.title)}</div>
        <div class="biz-promo-prices">
          <span class="biz-promo-orig">${orig} zł</span>
          <span class="biz-promo-disc">${disc} zł</span>
        </div>
      </div>
      <div class="biz-card-actions">
        <button class="biz-card-btn" onclick="bizOpenPromoModal('${p.id}','${esc(p.title)}',${orig},${disc},'${esc(p.photoURL||'')}')">
          <span class="material-icons">edit</span>
        </button>
        <button class="biz-card-btn biz-card-btn-del" onclick="bizDeletePromo('${p.id}')">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

function openPromoModal(id = '', title = '', origPrice = '', discPrice = '', photo = '') {
  document.getElementById('promoEditId').value        = id;
  document.getElementById('promoTitle').value         = title;
  document.getElementById('promoOriginalPrice').value = origPrice;
  document.getElementById('promoDiscountPrice').value = discPrice;
  document.getElementById('promoPhoto').value         = photo;
  document.getElementById('promoModalTitle').textContent = id ? 'Edytuj ofertę' : 'Dodaj ofertę';
  document.getElementById('promoModal')?.classList.remove('hidden');
}

async function savePromo() {
  const id            = document.getElementById('promoEditId').value;
  const title         = document.getElementById('promoTitle').value.trim();
  const originalPrice = parseInt(document.getElementById('promoOriginalPrice').value) || 0;
  const discountPrice = parseInt(document.getElementById('promoDiscountPrice').value) || 0;
  const photoURL      = document.getElementById('promoPhoto').value.trim();

  if (!title || !originalPrice) { toast('Wypełnij wymagane pola', 'error'); return; }
  if (discountPrice >= originalPrice) { toast('Cena promocyjna musi być niższa od regularnej', 'error'); return; }

  const discountPercent = Math.round((1 - discountPrice / originalPrice) * 100);
  const data = { businessId: _bizId, businessName: _bizDoc?.name || '',
    title, originalPrice, discountPrice, discountPercent, photoURL, active: true };

  try {
    if (id) {
      await updateDoc(doc(db, 'promotions', id), data);
      const i = _promos.findIndex(p => p.id === id);
      if (i !== -1) _promos[i] = { ..._promos[i], ...data };
      toast('Oferta zaktualizowana');
    } else {
      const ref = await addDoc(collection(db, 'promotions'), { ...data, createdAt: serverTimestamp() });
      _promos.push({ id: ref.id, ...data });
      toast('Oferta dodana');
    }
    document.getElementById('promoModal')?.classList.add('hidden');
    renderPromos();
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

function deletePromo(id) {
  confirmAction('Czy na pewno chcesz usunąć tę ofertę? Tego działania nie można cofnąć.', async () => {
    try {
      await deleteDoc(doc(db, 'promotions', id));
      _promos = _promos.filter(p => p.id !== id);
      renderPromos();
      toast('Oferta usunięta');
    } catch(e) { toast('Błąd usuwania oferty', 'error'); }
  });
}

const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");
