import { db, collection, getDocs, query, where, orderBy, limit } from '../firebase-config.js';
import { validateCode, applyCodeToBooking, removeCode } from '../modules/promo-codes.js';
import { escHtml, formatCurrency } from '../modules/utils.js';

const TABS = ['all', 'active', 'expiring', 'coupons', 'saved', 'vouchers', 'bundles', 'subscriptions'];
let _activeTab = 'all';
const _loaded = {};

export async function initOffers() {
  window.removePromo = removeCode;
  document.getElementById('promoApplyBtn')?.addEventListener('click', applyPromo);
  document.getElementById('promoRemoveBtn')?.addEventListener('click', removeCode);

  bindTabs();
  await loadOffers();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function bindTabs() {
  document.querySelectorAll('.offers-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

async function switchTab(tab) {
  if (!TABS.includes(tab)) return;
  _activeTab = tab;

  document.querySelectorAll('.offers-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));

  const mainPanelIds = ['offersGrid', 'flashDealBanner', 'offersCatChips', 'offersSortSelect'];
  const specialTabs  = ['vouchers', 'bundles', 'subscriptions'];
  const isSpecial    = specialTabs.includes(tab);

  mainPanelIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', isSpecial);
  });
  document.querySelector('.offers-load-more')?.classList.toggle('hidden', isSpecial);

  document.getElementById('offersVouchersPanel')?.classList.toggle('hidden',      tab !== 'vouchers');
  document.getElementById('offersBundlesPanel')?.classList.toggle('hidden',       tab !== 'bundles');
  document.getElementById('offersSubscriptionsPanel')?.classList.toggle('hidden', tab !== 'subscriptions');

  if (isSpecial && !_loaded[tab]) {
    _loaded[tab] = true;
    if (tab === 'vouchers')      await renderVouchers();
    if (tab === 'bundles')       await renderBundles();
    if (tab === 'subscriptions') await renderSubscriptions();
    return;
  }

  if (!isSpecial) {
    await loadOffers(tab);
  }
}

// ─── PROMO CODE ───────────────────────────────────────────────────────────────

async function applyPromo() {
  const code = document.getElementById('promoCodeInput')?.value;
  let result;
  try {
    result = await validateCode(code);
  } catch(_) {
    return;
  }
  if (!result.valid) return;
  const el = document.getElementById('promoApplied');
  if (el) {
    el.classList.remove('hidden');
    el.textContent = `Kod ${result.promo.code}: -${result.promo.value}${result.promo.type === 'percent' ? '%' : ' zł'}`;
  }
  document.getElementById('promoRemoveBtn')?.classList.remove('hidden');
}

// ─── MAIN OFFERS ──────────────────────────────────────────────────────────────

async function loadOffers(tab = 'all') {
  const el = document.getElementById('offersGrid');
  if (!el) return;
  let snap;
  try {
    snap = await getDocs(collection(db, 'promotions'));
  } catch(_) {
    el.innerHTML = '<p class="text-muted">Brak aktywnych promocji</p>';
    return;
  }
  if (!snap.size) { el.innerHTML = '<p class="text-muted">Brak aktywnych promocji</p>'; return; }

  const now = Date.now();
  let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (tab === 'active') {
    docs = docs.filter(p => {
      const ends = p.endsAt?.toDate?.();
      return ends ? ends.getTime() > now : true;
    });
  } else if (tab === 'expiring') {
    const soon = now + 3 * 24 * 3600 * 1000;
    docs = docs.filter(p => {
      const ends = p.endsAt?.toDate?.();
      return ends && ends.getTime() > now && ends.getTime() <= soon;
    });
  } else if (tab === 'coupons') {
    const user = window.App?.user;
    if (!user) { el.innerHTML = '<p class="text-muted">Zaloguj się, aby zobaczyć swoje kupony</p>'; return; }
    docs = docs.filter(p => p.userId === user.uid);
  } else if (tab === 'saved') {
    const saved = JSON.parse(localStorage.getItem('lumina_saved_offers') || '[]');
    docs = docs.filter(p => saved.includes(p.id));
  }

  if (!docs.length) { el.innerHTML = '<p class="text-muted">Brak ofert w tej kategorii</p>'; return; }

  el.innerHTML = docs.map(p => {
    const ends = p.endsAt?.toDate?.() ?? null;
    return `<div class="offer-card" role="listitem">
      <div class="offer-badge">${escHtml(p.discount || p.title)}</div>
      <h3>${escHtml(p.title)}</h3>
      <p>${escHtml(p.description || '')}</p>
      ${ends ? `<div class="offer-countdown" data-ends="${ends.toISOString()}"></div>` : ''}
      <a href="?page=business&id=${escHtml(p.businessId)}" class="btn btn-accent btn-sm">Zarezerwuj</a>
    </div>`;
  }).join('');
  startCountdowns();
}

function startCountdowns() {
  document.querySelectorAll('.offer-countdown').forEach(el => {
    const end = new Date(el.dataset.ends);
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { el.textContent = 'Wygasła'; return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      el.textContent = `Koniec za: ${h}h ${m}m`;
      requestAnimationFrame(tick);
    };
    tick();
  });
}

// ─── VOUCHERS ─────────────────────────────────────────────────────────────────

async function renderVouchers() {
  const el = document.getElementById('offersVouchersGrid');
  if (!el) return;

  const voucherAmounts = [
    { amount: 50,  label: '50 zł',  desc: 'Drobny upominek',         popular: false },
    { amount: 100, label: '100 zł', desc: 'Idealny prezent',          popular: true  },
    { amount: 200, label: '200 zł', desc: 'Luksusowe doświadczenie',  popular: false },
    { amount: 500, label: '500 zł', desc: 'Kompletny dzień spa',      popular: false },
  ];

  el.innerHTML = voucherAmounts.map(v => `
    <div class="mkt-voucher-card${v.popular ? ' mkt-voucher-popular' : ''}">
      ${v.popular ? '<div class="mkt-voucher-popular-badge">Popularny</div>' : ''}
      <div class="mkt-voucher-amount">${escHtml(v.label)}</div>
      <div class="mkt-voucher-desc">${escHtml(v.desc)}</div>
      <a href="/luminaphp/?page=marketplace#giftVouchers" class="btn btn-accent btn-sm mkt-voucher-btn">
        <span class="material-icons">card_giftcard</span> Kup voucher
      </a>
    </div>`).join('') +
  `<div class="mkt-voucher-card mkt-voucher-custom">
    <div class="mkt-voucher-amount">Dowolna kwota</div>
    <div class="mkt-voucher-desc">Wpisz własną wartość</div>
    <a href="/luminaphp/?page=marketplace#giftVouchers" class="btn btn-ghost btn-sm">
      <span class="material-icons">open_in_new</span> Przejdź do Marketplace
    </a>
  </div>`;
}

// ─── BUNDLES ──────────────────────────────────────────────────────────────────

async function renderBundles() {
  const el = document.getElementById('offersBundlesGrid');
  if (!el) return;

  let bundles = [];
  try {
    const snap = await getDocs(query(collection(db, 'bundles'), where('active', '==', true), limit(6)));
    bundles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!bundles.length) {
    bundles = defaultBundles();
  }

  el.innerHTML = bundles.map(b => {
    const disc = b.originalPrice ? Math.round((1 - b.price / b.originalPrice) * 100) : 0;
    return `<div class="mkt-bundle-card">
      ${disc > 0 ? `<div class="mkt-bundle-disc-badge">-${disc}%</div>` : ''}
      <div class="mkt-bundle-cat">${escHtml(b.category || '')}</div>
      <h3 class="mkt-bundle-name">${escHtml(b.name)}</h3>
      <ul class="mkt-bundle-services">
        ${(b.services || []).map(s =>
          `<li><span class="material-icons">check_circle</span>${escHtml(s)}</li>`).join('')}
      </ul>
      <div class="mkt-bundle-price-row">
        ${b.originalPrice ? `<span class="mkt-bundle-orig">${b.originalPrice} zł</span>` : ''}
        <span class="mkt-bundle-price">${b.price} zł</span>
      </div>
      <a href="/luminaphp/?page=explore" class="btn btn-accent btn-sm mkt-bundle-btn">
        <span class="material-icons">shopping_cart</span> Wybierz salon
      </a>
    </div>`;
  }).join('');
}

function defaultBundles() {
  return [
    { id: 'b1', name: 'Dzień Spa',            category: 'Masaż',       originalPrice: 350, price: 270,
      services: ['Masaż relaksacyjny 60 min', 'Zabieg na twarz', 'Manicure'] },
    { id: 'b2', name: 'Pełna metamorfoza',     category: 'Fryzjer',     originalPrice: 400, price: 320,
      services: ['Strzyżenie', 'Koloryzacja', 'Pielęgnacja'] },
    { id: 'b3', name: 'Pakiet panny młodej',   category: 'Kosmetyczka', originalPrice: 600, price: 480,
      services: ['Fryzura ślubna', 'Makijaż', 'Manicure hybryda', 'Pedicure'] },
    { id: 'b4', name: 'Mani + Pedi',           category: 'Paznokcie',   originalPrice: 180, price: 150,
      services: ['Manicure hybrydowy', 'Pedicure hybrydowy'] },
    { id: 'b5', name: 'Barber Classic',        category: 'Barber',      originalPrice: 130, price: 100,
      services: ['Strzyżenie', 'Golenie brzytwą', 'Pielęgnacja brody'] },
    { id: 'b6', name: 'Relax Weekend',         category: 'Masaż',       originalPrice: 280, price: 220,
      services: ['Masaż sportowy 45 min', 'Masaż stóp', 'Sauna 30 min'] },
  ];
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

async function renderSubscriptions() {
  const el = document.getElementById('offersSubsGrid');
  if (!el) return;

  let subs = [];
  try {
    const snap = await getDocs(query(collection(db, 'subscriptions'), where('active', '==', true), limit(4)));
    subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!subs.length) {
    subs = [
      { id: 's1', name: 'Basic',    visitsPerMonth: 1, service: 'Strzyżenie lub manicure',              price: 89,  highlight: false },
      { id: 's2', name: 'Standard', visitsPerMonth: 2, service: 'Dowolna usługa podstawowa',             price: 169, highlight: true  },
      { id: 's3', name: 'Premium',  visitsPerMonth: 4, service: 'Dowolna usługa',                        price: 299, highlight: false },
      { id: 's4', name: 'VIP',      visitsPerMonth: 8, service: 'Priorytetowe terminy + usługi premium', price: 499, highlight: false },
    ];
  }

  el.innerHTML = subs.map(s => `
    <div class="mkt-sub-card${s.highlight ? ' mkt-sub-popular' : ''}">
      ${s.highlight ? '<div class="mkt-sub-popular-badge">Najpopularniejszy</div>' : ''}
      <div class="mkt-sub-name">${escHtml(s.name)}</div>
      <div class="mkt-sub-price"><strong>${s.price}</strong> <span>zł / miesiąc</span></div>
      <div class="mkt-sub-visits">
        <span class="material-icons">event_available</span>
        ${s.visitsPerMonth}× wizyta miesięcznie
      </div>
      <div class="mkt-sub-service">${escHtml(s.service || '')}</div>
      <a href="/luminaphp/?page=explore" class="btn ${s.highlight ? 'btn-accent' : 'btn-ghost'} mkt-sub-btn">
        Wybierz salon
      </a>
    </div>`).join('');
}
