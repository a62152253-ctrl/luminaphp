// admin/offers.js — Oferty i Promocje z systemem Freemium
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp }
  from '../firebase-config.js';
import { toast, confirmAction } from '../modules/utils.js';
import { getSubscription, hasActiveAccess, processPayment, getPlans } from '../modules/payment.js';

const FREE_LIMIT    = 2;
const PREMIUM_LIMIT = 25;

let _bizId, _bizDoc, _promos = [], _flashDeals = [], _bundles = [], _subs = [], _services = [];
let _isPremium = false;
let _sub       = null;
let _offersSubTab = 'promos';

export async function initOffers(bizId, bizDoc) {
  _bizId  = bizId;
  _bizDoc = bizDoc;

  const uid = window.App?.user?.uid;
  if (uid) {
    try {
      _sub       = await getSubscription(uid);
      _isPremium = hasActiveAccess(_sub);
    } catch(_) {
      _sub = null; _isPremium = false;
    }
  }

  await Promise.all([loadPromos(), loadServices()]);
  renderPromos();
  bindOffersSubTabs();

  window.bizSavePromo       = savePromo;
  window.bizDeletePromo     = deletePromo;
  window.bizOpenPromoModal  = openPromoModal;
  window.bizUpgradePlan     = showUpgradeModal;
  window.bizSelectPlan      = selectPlan;
  window.bizCloseUpgrade    = closeUpgradeModal;
  window.bizOpenAddModal    = openAddModal;
  window.bizSaveFlashDeal   = saveFlashDeal;
  window.bizDeleteFlashDeal = deleteFlashDeal;
  window.bizOpenFlashModal  = openFlashModal;
  window.bizFlashRecalcPrice= flashRecalcPrice;
  window.bizSaveBundle      = saveBundle;
  window.bizDeleteBundle    = deleteBundle;
  window.bizOpenBundleModal = openBundleModal;
  window.bizRecalcBundle    = recalcBundleTotal;
  window.bizSaveSub         = saveSub;
  window.bizDeleteSub       = deleteSub;
  window.bizOpenSubModal    = openSubModal;
}

async function loadPromos() {
  try {
    const q = query(collection(db, 'promotions'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _promos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { _promos = []; }
}

function getLimit()  { return _isPremium ? PREMIUM_LIMIT : FREE_LIMIT; }
function getCount()  { return _promos.length; }
function canAddMore(){ return getCount() < getLimit(); }

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderPromos() {
  const el = document.getElementById('promosList');
  if (!el) return;

  const limit = getLimit();
  const count = getCount();

  // Plan banner
  const bannerHtml = `
    <div class="freemium-banner ${_isPremium ? 'freemium-banner--premium' : ''}">
      <div class="freemium-banner-left">
        <span class="material-icons">${_isPremium ? 'workspace_premium' : 'lock'}</span>
        <div>
          <strong>${_isPremium ? 'Plan Premium' : 'Plan Darmowy'}</strong>
          <span>${count} / ${limit} ofert</span>
        </div>
      </div>
      ${!_isPremium ? `
        <button class="freemium-upgrade-btn" onclick="bizUpgradePlan()">
          <span class="material-icons">upgrade</span> Przejdź na Premium
        </button>` : ''}
    </div>`;

  if (!_promos.length) {
    el.innerHTML = bannerHtml + `<div class="biz-empty">
      <span class="material-icons">local_offer</span>
      <p>Brak ofert. Dodaj pierwszą — pojawi się na stronie głównej.</p></div>`;
    return;
  }

  el.className = '';
  el.innerHTML = bannerHtml + `<div class="biz-services-grid">` + _promos.map(p => {
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
  }).join('') + `</div>`;
}

// ─── PROMO MODAL ──────────────────────────────────────────────────────────────
function openPromoModal(id = '', title = '', origPrice = '', discPrice = '', photo = '') {
  // Check limit only for new offers
  if (!id && !canAddMore()) {
    showUpgradeModal();
    return;
  }

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

  // Double-check limit on save (guard against race conditions)
  if (!id && !canAddMore()) { showUpgradeModal(); return; }

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

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
function showUpgradeModal() {
  const plans = getPlans();
  const existing = document.getElementById('upgradeModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'upgradeModal';
  modal.className = 'upgrade-overlay';
  modal.innerHTML = `
    <div class="upgrade-modal" onclick="event.stopPropagation()">
      <button class="upgrade-close" onclick="bizCloseUpgrade()">
        <span class="material-icons">close</span>
      </button>

      <div class="upgrade-header">
        <span class="material-icons upgrade-icon">workspace_premium</span>
        <h2>Odblokuj Premium</h2>
        <p>Bezpłatny plan: <strong>${FREE_LIMIT} oferty</strong> · Premium: <strong>${PREMIUM_LIMIT} ofert</strong></p>
      </div>

      <div class="upgrade-plans">
        <div class="upgrade-plan" onclick="bizSelectPlan('monthly')" data-plan="monthly">
          <div class="upgrade-plan-name">Miesięczny</div>
          <div class="upgrade-plan-price">$${plans.monthly.price}<span>/mies.</span></div>
          <ul class="upgrade-plan-features">
            <li><span class="material-icons">check</span> Do 25 aktywnych ofert</li>
            <li><span class="material-icons">check</span> Priorytet w wynikach</li>
            <li><span class="material-icons">check</span> Statystyki zaawansowane</li>
          </ul>
          <div class="upgrade-plan-select">Wybierz</div>
        </div>

        <div class="upgrade-plan upgrade-plan--featured" onclick="bizSelectPlan('yearly')" data-plan="yearly">
          <div class="upgrade-plan-badge">Najlepszy wybór</div>
          <div class="upgrade-plan-name">Roczny</div>
          <div class="upgrade-plan-price">$${plans.yearly.price}<span>/rok</span></div>
          <div class="upgrade-plan-savings">Oszczędzasz $${plans.monthly.price * 12 - plans.yearly.price}</div>
          <ul class="upgrade-plan-features">
            <li><span class="material-icons">check</span> Do 25 aktywnych ofert</li>
            <li><span class="material-icons">check</span> Priorytet w wynikach</li>
            <li><span class="material-icons">check</span> Statystyki zaawansowane</li>
            <li><span class="material-icons">check</span> Wsparcie priorytetowe</li>
          </ul>
          <div class="upgrade-plan-select">Wybierz</div>
        </div>
      </div>

      <div id="paypalButtonContainer" class="paypal-btn-wrap" style="display:none"></div>
      <p class="upgrade-paypal-note">
        <span class="material-icons" style="font-size:1rem;vertical-align:middle;color:#009cde">payment</span>
        Płatność przez PayPal · Bezpieczna transakcja · Możliwość anulowania w każdej chwili
      </p>
    </div>`;

  modal.addEventListener('click', closeUpgradeModal);
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgradeModal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => modal.remove(), 200);
}

async function selectPlan(planId) {
  document.querySelectorAll('.upgrade-plan').forEach(el => {
    el.classList.toggle('upgrade-plan--selected', el.dataset.plan === planId);
  });

  const btnWrap = document.getElementById('paypalButtonContainer');
  if (!btnWrap) return;
  btnWrap.style.display = 'block';
  btnWrap.innerHTML = '<div class="spinner" style="margin:1rem auto"></div>';

  const uid = window.App?.user?.uid;
  if (!uid) { toast('Musisz być zalogowany', 'error'); return; }

  try {
    await processPayment(uid, planId);
    _sub       = await getSubscription(uid);
    _isPremium = hasActiveAccess(_sub);
    closeUpgradeModal();
    renderPromos();
    toast('Plan Premium aktywowany! Możesz teraz dodać do 25 ofert.', 'success');
  } catch(e) {
    toast('Płatność nieudana: ' + (e.message || 'spróbuj ponownie'), 'error');
    btnWrap.innerHTML = '';
  }
}

const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");

// ─── SERVICES ─────────────────────────────────────────────────────────────────
async function loadServices() {
  try {
    const snap = await getDocs(collection(db, 'businesses', _bizId, 'services'));
    _services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { _services = []; }
}

// ─── OFFERS SUB-TABS ─────────────────────────────────────────────────────────
function bindOffersSubTabs() {
  document.querySelectorAll('#offersSubTabs .biz-sub-tab').forEach(btn => {
    btn.addEventListener('click', () => switchOffersSubTab(btn.dataset.ostab));
  });
}

function switchOffersSubTab(tab) {
  _offersSubTab = tab;
  document.querySelectorAll('#offersSubTabs .biz-sub-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.ostab === tab);
  });
  const panels = { promos: 'offersPromoPanel', flash: 'offersFlashPanel', bundles: 'offersBundlesPanel', subs: 'offersSubsPanel' };
  Object.entries(panels).forEach(([key, id]) => {
    document.getElementById(id)?.classList.toggle('hidden', key !== tab);
  });
  if (tab === 'flash'   && !_flashDeals.length) loadFlashDeals().then(() => renderFlashDeals());
  if (tab === 'bundles' && !_bundles.length)    loadBundleList().then(() => renderBundles());
  if (tab === 'subs'    && !_subs.length)       loadSubs().then(() => renderSubs());
}

function openAddModal() {
  if (_offersSubTab === 'flash')   { openFlashModal();  return; }
  if (_offersSubTab === 'bundles') { openBundleModal(); return; }
  if (_offersSubTab === 'subs')    { openSubModal();    return; }
  openPromoModal();
}

// ─── FLASH DEALS ─────────────────────────────────────────────────────────────
async function loadFlashDeals() {
  try {
    const q = query(collection(db, 'flashDeals'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _flashDeals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { _flashDeals = []; }
}

function renderFlashDeals() {
  const el = document.getElementById('flashDealsList');
  if (!el) return;

  if (!_flashDeals.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">bolt</span>
      <p>Brak Flash Deals. Dodaj wyprzedaż last-minute — klienci zobaczą ją na marketplace.</p>
      <button class="btn btn-accent" onclick="bizOpenFlashModal()">
        <span class="material-icons">add</span> Pierwszy Flash Deal
      </button></div>`;
    return;
  }

  el.innerHTML = `<div class="biz-services-grid">` + _flashDeals.map(d => {
    const exp = d.expiresAt?.toDate?.();
    const expStr = exp ? exp.toLocaleString('pl') : '—';
    const active = !exp || exp > new Date();
    return `<div class="biz-promo-card">
      <div class="biz-promo-badge">-${d.discountPercent || 30}%</div>
      <div class="biz-promo-body">
        <div class="biz-promo-title">${esc(d.serviceName || 'Flash Deal')}</div>
        <div class="biz-promo-prices">
          <span class="biz-promo-orig">${d.originalPrice || 0} zł</span>
          <span class="biz-promo-disc">${d.discountedPrice || 0} zł</span>
        </div>
        <div style="font-size:.75rem;color:${active ? 'var(--zinc-500)' : '#ef4444'};margin-top:.4rem">
          <span class="material-icons" style="font-size:.9rem;vertical-align:middle">${active ? 'schedule' : 'timer_off'}</span>
          ${active ? 'Wygasa: ' : 'Wygasł: '}${esc(expStr)}
        </div>
      </div>
      <div class="biz-card-actions">
        <button class="biz-card-btn biz-card-btn-del" onclick="bizDeleteFlashDeal('${d.id}')">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>`;
  }).join('') + `</div>`;
}

function openFlashModal() {
  const sel = document.getElementById('flashService');
  if (sel) {
    sel.innerHTML = '<option value="">— Wybierz usługę —</option>' +
      _services.map(s => `<option value="${esc(s.id)}" data-price="${s.price || 0}">${esc(s.name)} (${s.price || 0} zł)</option>`).join('');
  }
  document.getElementById('flashEditId').value = '';
  document.getElementById('flashDiscount').value = '30';
  document.getElementById('flashPrice').value = '';
  const now = new Date(Date.now() + 3 * 3600000);
  document.getElementById('flashExpires').value = now.toISOString().slice(0, 16);
  document.getElementById('flashDealModal')?.classList.remove('hidden');
}

function flashRecalcPrice() {
  const sel = document.getElementById('flashService');
  const opt = sel?.options[sel.selectedIndex];
  const origPrice = parseFloat(opt?.dataset.price || 0);
  const discount  = parseFloat(document.getElementById('flashDiscount')?.value || 30);
  const discounted = origPrice > 0 ? Math.round(origPrice * (1 - discount / 100)) : 0;
  const priceEl = document.getElementById('flashPrice');
  if (priceEl) priceEl.value = discounted > 0 ? discounted : '';
}

async function saveFlashDeal() {
  const sel = document.getElementById('flashService');
  const svcId = sel?.value;
  const opt   = sel?.options[sel.selectedIndex];
  const expiresStr = document.getElementById('flashExpires').value;

  if (!svcId)      { toast('Wybierz usługę', 'error'); return; }
  if (!expiresStr) { toast('Podaj datę wygaśnięcia', 'error'); return; }

  const svc = _services.find(s => s.id === svcId);
  const origPrice     = svc?.price || 0;
  const discountPct   = parseInt(document.getElementById('flashDiscount').value) || 30;
  const discountedPrice = Math.round(origPrice * (1 - discountPct / 100));

  const data = {
    businessId:     _bizId,
    businessName:   _bizDoc?.name || '',
    businessPhoto:  _bizDoc?.photoURL || '',
    serviceName:    svc?.name || '',
    originalPrice:  origPrice,
    discountedPrice,
    discountPercent: discountPct,
    expiresAt:      new Date(expiresStr),
    active:         true,
    createdAt:      serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'flashDeals'), data);
    _flashDeals.push({ id: ref.id, ...data });
    document.getElementById('flashDealModal')?.classList.add('hidden');
    renderFlashDeals();
    toast('Flash Deal opublikowany!', 'success');
  } catch { toast('Błąd zapisu', 'error'); }
}

function deleteFlashDeal(id) {
  confirmAction('Usunąć Flash Deal? Tego nie można cofnąć.', async () => {
    try {
      await deleteDoc(doc(db, 'flashDeals', id));
      _flashDeals = _flashDeals.filter(d => d.id !== id);
      renderFlashDeals();
      toast('Flash Deal usunięty');
    } catch { toast('Błąd usuwania', 'error'); }
  });
}

// ─── BUNDLES ─────────────────────────────────────────────────────────────────
async function loadBundleList() {
  try {
    const q = query(collection(db, 'bundles'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _bundles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { _bundles = []; }
}

function renderBundles() {
  const el = document.getElementById('bundlesList');
  if (!el) return;

  if (!_bundles.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">inventory_2</span>
      <p>Brak pakietów. Stwórz zestaw usług w atrakcyjnej cenie.</p>
      <button class="btn btn-accent" onclick="bizOpenBundleModal()">
        <span class="material-icons">add</span> Pierwszy pakiet
      </button></div>`;
    return;
  }

  el.innerHTML = `<div class="biz-services-grid">` + _bundles.map(b => {
    const svcs = (b.services || []).map(s => esc(s.name)).join(', ');
    const disc = b.totalValue > 0 ? Math.round((1 - b.price / b.totalValue) * 100) : 0;
    return `<div class="biz-promo-card">
      ${disc > 0 ? `<div class="biz-promo-badge">-${disc}%</div>` : ''}
      <div class="biz-promo-body">
        <div class="biz-promo-title">${esc(b.name)}</div>
        ${b.description ? `<p style="font-size:.8rem;color:var(--zinc-500);margin:.2rem 0">${esc(b.description)}</p>` : ''}
        <div style="font-size:.78rem;color:var(--zinc-400);margin:.3rem 0">${svcs}</div>
        <div class="biz-promo-prices">
          ${b.totalValue ? `<span class="biz-promo-orig">${b.totalValue} zł</span>` : ''}
          <span class="biz-promo-disc">${b.price} zł</span>
        </div>
      </div>
      <div class="biz-card-actions">
        <button class="biz-card-btn biz-card-btn-del" onclick="bizDeleteBundle('${b.id}')">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>`;
  }).join('') + `</div>`;
}

function openBundleModal(id = '') {
  document.getElementById('bundleEditId').value = id;
  document.getElementById('bundleName').value   = '';
  document.getElementById('bundleDesc').value   = '';
  document.getElementById('bundlePrice').value  = '';
  document.getElementById('bundleTotalValue').value = '';
  document.getElementById('bundleModalTitle').textContent = id ? 'Edytuj pakiet' : 'Nowy pakiet';

  const checkboxEl = document.getElementById('bundleServicesCheckboxes');
  if (checkboxEl) {
    if (!_services.length) {
      checkboxEl.innerHTML = '<p style="font-size:.85rem;color:var(--zinc-400)">Najpierw dodaj usługi w zakładce Usługi.</p>';
    } else {
      checkboxEl.innerHTML = _services.map(s => `
        <label class="biz-checkbox-item">
          <input type="checkbox" value="${esc(s.id)}" data-name="${esc(s.name)}" data-price="${s.price || 0}"
            onchange="bizRecalcBundle()">
          <span>${esc(s.name)}</span>
          <span class="biz-checkbox-price">${s.price || 0} zł</span>
        </label>`).join('');
    }
  }

  document.getElementById('bundleModal')?.classList.remove('hidden');
}

function recalcBundleTotal() {
  let total = 0;
  document.querySelectorAll('#bundleServicesCheckboxes input[type=checkbox]:checked').forEach(cb => {
    total += parseFloat(cb.dataset.price || 0);
  });
  document.getElementById('bundleTotalValue').value = total || '';
}

async function saveBundle() {
  const name  = document.getElementById('bundleName').value.trim();
  const desc  = document.getElementById('bundleDesc').value.trim();
  const price = parseInt(document.getElementById('bundlePrice').value) || 0;

  if (!name)  { toast('Podaj nazwę pakietu', 'error'); return; }
  if (!price) { toast('Podaj cenę pakietu', 'error'); return; }

  const services = [];
  document.querySelectorAll('#bundleServicesCheckboxes input[type=checkbox]:checked').forEach(cb => {
    services.push({ id: cb.value, name: cb.dataset.name, price: parseFloat(cb.dataset.price || 0) });
  });
  if (!services.length) { toast('Wybierz co najmniej jedną usługę', 'error'); return; }

  const totalValue = services.reduce((s, svc) => s + svc.price, 0);
  const data = {
    businessId:   _bizId,
    businessName: _bizDoc?.name || '',
    name, description: desc, services, price, totalValue, active: true,
    createdAt:    serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'bundles'), data);
    _bundles.push({ id: ref.id, ...data });
    document.getElementById('bundleModal')?.classList.add('hidden');
    renderBundles();
    toast('Pakiet zapisany!', 'success');
  } catch { toast('Błąd zapisu', 'error'); }
}

function deleteBundle(id) {
  confirmAction('Usunąć pakiet? Tego nie można cofnąć.', async () => {
    try {
      await deleteDoc(doc(db, 'bundles', id));
      _bundles = _bundles.filter(b => b.id !== id);
      renderBundles();
      toast('Pakiet usunięty');
    } catch { toast('Błąd usuwania', 'error'); }
  });
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
async function loadSubs() {
  try {
    const q = query(collection(db, 'subscriptions'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { _subs = []; }
}

function renderSubs() {
  const el = document.getElementById('subsList');
  if (!el) return;

  if (!_subs.length) {
    el.innerHTML = `<div class="biz-empty">
      <span class="material-icons">autorenew</span>
      <p>Brak planów subskrypcji. Stwórz miesięczny abonament dla stałych klientów.</p>
      <button class="btn btn-accent" onclick="bizOpenSubModal()">
        <span class="material-icons">add</span> Pierwszy plan
      </button></div>`;
    return;
  }

  el.innerHTML = `<div class="biz-services-grid">` + _subs.map(s => {
    const features = (s.features || []).join(', ');
    return `<div class="biz-promo-card ${s.popular ? 'biz-promo-card--featured' : ''}">
      ${s.popular ? '<div class="biz-promo-badge">Popularne</div>' : ''}
      <div class="biz-promo-body">
        <div class="biz-promo-title">${esc(s.name)}</div>
        ${s.description ? `<p style="font-size:.8rem;color:var(--zinc-500);margin:.2rem 0">${esc(s.description)}</p>` : ''}
        <div style="font-size:.85rem;color:var(--zinc-600);margin:.3rem 0">
          <span class="material-icons" style="font-size:.9rem;vertical-align:middle">calendar_month</span> ${s.visitsPerMonth || 0} wizyt/mies.
        </div>
        <div class="biz-promo-prices">
          <span class="biz-promo-disc">${s.price || 0} zł/mies.</span>
        </div>
        ${features ? `<div style="font-size:.75rem;color:var(--zinc-500);margin-top:.4rem;line-height:1.4">${esc(features)}</div>` : ''}
      </div>
      <div class="biz-card-actions">
        <button class="biz-card-btn biz-card-btn-del" onclick="bizDeleteSub('${s.id}')">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>`;
  }).join('') + `</div>`;
}

function openSubModal(id = '') {
  const existing = _subs.find(s => s.id === id);
  
  document.getElementById('subEditId').value = id;
  document.getElementById('subName').value = existing?.name || '';
  document.getElementById('subDesc').value = existing?.description || '';
  document.getElementById('subPrice').value = existing?.price || '';
  document.getElementById('subVisits').value = existing?.visitsPerMonth || '4';
  document.getElementById('subFeatures').value = existing?.features?.join('\n') || '';
  document.getElementById('subPopular').checked = existing?.popular || false;
  document.getElementById('subModalTitle').textContent = id ? 'Edytuj plan subskrypcji' : 'Nowy plan subskrypcji';
  document.getElementById('subModal')?.classList.remove('hidden');
}

async function saveSub() {
  const id = document.getElementById('subEditId').value;
  const name = document.getElementById('subName').value.trim();
  const desc = document.getElementById('subDesc').value.trim();
  const price = parseInt(document.getElementById('subPrice').value) || 0;
  const visits = parseInt(document.getElementById('subVisits').value) || 4;
  const featuresText = document.getElementById('subFeatures').value.trim();
  const popular = document.getElementById('subPopular').checked;

  if (!name) { toast('Podaj nazwę planu', 'error'); return; }
  if (!price) { toast('Podaj cenę planu', 'error'); return; }
  if (!visits) { toast('Podaj ilość wizyt', 'error'); return; }

  const features = featuresText
    .split('\n')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  const data = {
    businessId: _bizId,
    businessName: _bizDoc?.name || '',
    name,
    description: desc,
    price,
    visitsPerMonth: visits,
    features,
    popular,
    active: true,
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'subscriptions', id), data);
      const idx = _subs.findIndex(s => s.id === id);
      if (idx !== -1) _subs[idx] = { ..._subs[idx], ...data };
      toast('Plan zaktualizowany');
    } else {
      const ref = await addDoc(collection(db, 'subscriptions'), { ...data, createdAt: serverTimestamp() });
      _subs.push({ id: ref.id, ...data });
      toast('Plan subskrypcji dodany!', 'success');
    }
    document.getElementById('subModal')?.classList.add('hidden');
    renderSubs();
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

function deleteSub(id) {
  confirmAction('Usunąć plan subskrypcji? Tego nie można cofnąć.', async () => {
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
      _subs = _subs.filter(s => s.id !== id);
      renderSubs();
      toast('Plan usunięty');
    } catch { toast('Błąd usuwania', 'error'); }
  });
}
