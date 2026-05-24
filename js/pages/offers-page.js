import { db, collection, getDocs, query, where, limit } from '../firebase-config.js';
import { validateCode, removeCode } from '../modules/promo-codes.js';
import { escHtml } from '../modules/utils.js';

const TABS = ['all','active','expiring','coupons','saved','vouchers','bundles','subscriptions'];

let _all     = [];
let _flash   = [];
let _sort    = 'newest';
let _cat     = '';
let _view    = 'grid';
let _tab     = 'all';
const _loaded = {};

// ─── INIT ─────────────────────────────────────────────────────────────────────

export async function initOffers() {
  window.removePromo     = removeCode;
  window.toggleSaveOffer = toggleSaveOffer;
  window.openShareOffer  = openShareOffer;

  document.getElementById('promoApplyBtn')?.addEventListener('click', applyPromo);
  document.getElementById('promoRemoveBtn')?.addEventListener('click', removeCode);
  document.getElementById('offersSortSelect')?.addEventListener('change', e => { _sort = e.target.value; render(); });
  document.getElementById('offersViewGrid')?.addEventListener('click', () => setView('grid'));
  document.getElementById('offersViewList')?.addEventListener('click', () => setView('list'));
  document.getElementById('offersLoadMoreBtn')?.addEventListener('click', () => {
    document.getElementById('offersLoadMoreBtn')?.classList.add('hidden');
    render(true);
  });
  document.getElementById('copyShareLinkBtn')?.addEventListener('click', () => {
    const inp = document.getElementById('shareOfferLink');
    if (!inp) return;
    navigator.clipboard?.writeText(inp.value).catch(() => {});
    const btn = document.getElementById('copyShareLinkBtn');
    if (btn) { btn.textContent = 'Skopiowano!'; setTimeout(() => btn.innerHTML = '<span class="material-icons">content_copy</span> Kopiuj', 1500); }
  });

  document.querySelectorAll('.share-social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = document.getElementById('shareOfferLink')?.value || '';
      const p   = btn.dataset.platform;
      if (p === 'whatsapp')  window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
      if (p === 'facebook')  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
      if (p === 'copy')      navigator.clipboard?.writeText(url).catch(() => {});
    });
  });

  bindTabs();
  bindCatChips();
  await loadPromotions();
  await loadFlashDeals();
  render();
  renderFlashBanner();
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

async function loadPromotions() {
  try {
    const snap = await getDocs(collection(db, 'promotions'));
    _all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) { _all = []; }
}

async function loadFlashDeals() {
  try {
    const q    = query(collection(db, 'flashDeals'), where('active', '==', true), limit(10));
    const snap = await getDocs(q);
    const now  = new Date();
    _flash = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => !d.expiresAt || d.expiresAt?.toDate?.() > now);
  } catch(_) { _flash = []; }
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function bindTabs() {
  document.querySelectorAll('.offers-tab').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
}

async function switchTab(tab) {
  if (!TABS.includes(tab)) return;
  _tab = tab;
  document.querySelectorAll('.offers-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));

  const special = ['vouchers', 'bundles', 'subscriptions'];
  const isSpec  = special.includes(tab);

  ['offersGrid','flashDealBanner','offersCatChips','offersSortSelect','.offers-controls','.offers-load-more']
    .forEach(sel => {
      const el = sel.startsWith('.') ? document.querySelector(sel) : document.getElementById(sel);
      if (el) el.classList.toggle('hidden', isSpec);
    });
  document.querySelector('.offers-view-toggle')?.classList.toggle('hidden', isSpec);

  document.getElementById('offersVouchersPanel')?.classList.toggle('hidden',       tab !== 'vouchers');
  document.getElementById('offersBundlesPanel')?.classList.toggle('hidden',        tab !== 'bundles');
  document.getElementById('offersSubscriptionsPanel')?.classList.toggle('hidden',  tab !== 'subscriptions');

  if (isSpec && !_loaded[tab]) {
    _loaded[tab] = true;
    if (tab === 'vouchers')      renderVouchers();
    if (tab === 'bundles')       await renderBundles();
    if (tab === 'subscriptions') await renderSubscriptions();
    return;
  }

  if (!isSpec) render();
}

// ─── CATEGORY CHIPS ───────────────────────────────────────────────────────────

function bindCatChips() {
  document.querySelectorAll('#offersCatChips .market-cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      _cat = btn.dataset.cat;
      document.querySelectorAll('#offersCatChips .market-cat-chip').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === _cat));
      render();
    });
  });
}

// ─── VIEW TOGGLE ──────────────────────────────────────────────────────────────

function setView(mode) {
  _view = mode;
  const grid = document.getElementById('offersGrid');
  if (grid) {
    grid.classList.toggle('offers-grid--list', mode === 'list');
  }
  document.getElementById('offersViewGrid')?.classList.toggle('active', mode === 'grid');
  document.getElementById('offersViewList')?.classList.toggle('active', mode === 'list');
  render();
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

function render(showAll = false) {
  const el = document.getElementById('offersGrid');
  if (!el) return;

  const now = Date.now();
  let docs  = [..._all];

  // Tab filter
  if (_tab === 'active') {
    docs = docs.filter(p => {
      const e = p.endsAt?.toDate?.();
      return !e || e.getTime() > now;
    });
    // Include flash deals merged in
    const flashCards = _flash.map(f => ({
      id: f.id, title: f.serviceName || 'Flash Deal', businessId: f.businessId,
      businessName: f.businessName, photoURL: f.businessPhoto,
      originalPrice: f.originalPrice, discountPrice: f.discountedPrice,
      discountPercent: f.discountPercent, endsAt: f.expiresAt, _isFlash: true,
    }));
    docs = [...flashCards, ...docs];
  } else if (_tab === 'expiring') {
    const soon = now + 3 * 24 * 3600000;
    docs = docs.filter(p => {
      const e = p.endsAt?.toDate?.();
      return e && e.getTime() > now && e.getTime() <= soon;
    });
  } else if (_tab === 'coupons') {
    const user = window.App?.user;
    if (!user) {
      el.innerHTML = emptyState('lock', 'Zaloguj się, aby zobaczyć swoje kupony', '?page=auth', 'Zaloguj się');
      return;
    }
    docs = docs.filter(p => p.userId === user.uid);
  } else if (_tab === 'saved') {
    const saved = getSaved();
    docs = docs.filter(p => saved.includes(p.id));
  }

  // Category filter
  if (_cat) {
    docs = docs.filter(p => (p.category || p.businessCategory || '') === _cat);
  }

  // Sort
  if (_sort === 'discount') {
    docs.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  } else if (_sort === 'expiry') {
    docs.sort((a, b) => {
      const ea = a.endsAt?.toDate?.()?.getTime() ?? Infinity;
      const eb = b.endsAt?.toDate?.()?.getTime() ?? Infinity;
      return ea - eb;
    });
  } else if (_sort === 'popular') {
    docs.sort((a, b) => (b.bookings || b.views || 0) - (a.bookings || a.views || 0));
  } else {
    docs.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return tb - ta;
    });
  }

  const PAGE   = 12;
  const total  = docs.length;
  const sliced = showAll ? docs : docs.slice(0, PAGE);

  if (!sliced.length) {
    el.innerHTML = emptyState('local_offer', 'Brak ofert w tej kategorii', null, null);
    document.getElementById('offersLoadMoreBtn')?.classList.add('hidden');
    return;
  }

  el.className = 'offers-grid' + (_view === 'list' ? ' offers-grid--list' : '');
  el.innerHTML = sliced.map(p => renderOfferCard(p)).join('');

  const moreBtn = document.getElementById('offersLoadMoreBtn');
  if (moreBtn) moreBtn.classList.toggle('hidden', showAll || total <= PAGE);

  startCountdowns();
}

function renderOfferCard(p) {
  const disc    = p.discountPercent ?? (p.originalPrice && p.discountPrice
    ? Math.round((1 - p.discountPrice / p.originalPrice) * 100) : 0);
  const discPrice = p.discountPrice ?? (p.originalPrice && disc
    ? Math.round(p.originalPrice * (1 - disc / 100)) : null);
  const ends    = p.endsAt?.toDate?.() ?? p.expiresAt?.toDate?.() ?? null;
  const soon    = ends && (ends - Date.now()) < 3 * 24 * 3600000;
  const isSaved = getSaved().includes(p.id);
  const isFlash = !!p._isFlash;

  const imgHtml = p.photoURL
    ? `<img src="${escHtml(p.photoURL)}" alt="${escHtml(p.title)}" class="offer-card-img" loading="lazy">`
    : `<div class="offer-card-img-ph"><span class="material-icons">local_offer</span></div>`;

  const badgeHtml = disc > 0
    ? `<div class="offer-card-badge${isFlash ? ' offer-card-badge--flash' : ''}">${isFlash ? '<span class="material-icons" style="font-size:.85rem">bolt</span>' : ''}-${disc}%</div>`
    : '';

  const urgentBadge = soon && ends
    ? `<div class="offer-card-badge offer-card-badge--urgent"><span class="material-icons" style="font-size:.85rem">timer</span> Kończy się</div>`
    : '';

  const priceHtml = (p.originalPrice || discPrice)
    ? `<div class="offer-price-row">
        ${p.originalPrice ? `<span class="offer-price-orig">${p.originalPrice} zł</span>` : ''}
        ${discPrice       ? `<span class="offer-price-disc">${discPrice} zł</span>` : ''}
      </div>`
    : '';

  const countdownHtml = ends
    ? `<div class="offer-countdown" data-ends="${ends.toISOString()}"></div>`
    : '';

  return `<div class="offer-card offer-card--v2${_view === 'list' ? ' offer-card--list' : ''}" role="listitem">
    <div class="offer-card-media">
      ${imgHtml}
      ${badgeHtml}${urgentBadge}
    </div>
    <div class="offer-card-body">
      ${p.businessName ? `<div class="offer-card-biz"><span class="material-icons">storefront</span>${escHtml(p.businessName)}</div>` : ''}
      <h3 class="offer-card-title">${escHtml(p.title)}</h3>
      ${priceHtml}
      ${countdownHtml}
    </div>
    <div class="offer-card-footer">
      <a href="?page=business&id=${escHtml(p.businessId || '')}" class="btn btn-accent btn-sm offer-book-btn">
        <span class="material-icons">event_available</span> Zarezerwuj
      </a>
      <button class="offer-icon-btn${isSaved ? ' offer-icon-btn--saved' : ''}"
        onclick="toggleSaveOffer('${escHtml(p.id)}')"
        title="${isSaved ? 'Usuń z zapisanych' : 'Zapisz'}">
        <span class="material-icons">${isSaved ? 'bookmark' : 'bookmark_border'}</span>
      </button>
      <button class="offer-icon-btn"
        onclick="openShareOffer('${escHtml(p.id)}','${escHtml(p.title).replace(/'/g, "\\'")}')"
        title="Udostępnij">
        <span class="material-icons">share</span>
      </button>
    </div>
  </div>`;
}

function emptyState(icon, msg, href, label) {
  return `<div class="biz-empty" style="grid-column:1/-1">
    <span class="material-icons">${icon}</span>
    <p>${msg}</p>
    ${href ? `<a href="${href}" class="btn btn-accent btn-sm">${label}</a>` : ''}
  </div>`;
}

// ─── FLASH BANNER ─────────────────────────────────────────────────────────────

function renderFlashBanner() {
  if (!_flash.length) return;
  const f  = _flash[0];
  const el = document.getElementById('flashDealBanner');
  if (!el) return;

  document.getElementById('flashDealText').textContent =
    `${f.serviceName || 'Flash Deal'} w ${f.businessName || 'salonie'} — ${f.discountedPrice || ''}zł (−${f.discountPercent || ''}%)`;

  const exp = f.expiresAt?.toDate?.();
  if (exp) {
    const timerEl = document.getElementById('flashDealTimer');
    const tick = () => {
      const d = exp - Date.now();
      if (d <= 0) { el.classList.add('hidden'); return; }
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      const s = Math.floor((d % 60000) / 1000);
      if (timerEl) timerEl.textContent = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      setTimeout(tick, 1000);
    };
    tick();
  }

  document.getElementById('flashDealBtn')?.addEventListener('click', () => {
    if (f.businessId) window.location.href = `?page=business&id=${f.businessId}`;
  });

  el.classList.remove('hidden');
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

function startCountdowns() {
  document.querySelectorAll('.offer-countdown').forEach(el => {
    const end = new Date(el.dataset.ends);
    const tick = () => {
      const d = end - Date.now();
      if (d <= 0) { el.textContent = 'Wygasła'; el.style.color = '#ef4444'; return; }
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      if (h < 24) {
        el.innerHTML = `<span class="material-icons" style="font-size:.8rem;vertical-align:middle;color:#f59e0b">timer</span> Koniec za: ${h}h ${m}m`;
      } else {
        const days = Math.ceil(d / 86400000);
        el.innerHTML = `<span class="material-icons" style="font-size:.8rem;vertical-align:middle;color:var(--zinc-400)">event</span> ${days} dni`;
      }
      setTimeout(tick, 60000);
    };
    tick();
  });
}

// ─── SAVE / SHARE ─────────────────────────────────────────────────────────────

function getSaved() {
  try { return JSON.parse(localStorage.getItem('lumina_saved_offers') || '[]'); }
  catch(_) { return []; }
}

function toggleSaveOffer(id) {
  const saved = getSaved();
  const idx   = saved.indexOf(id);
  if (idx === -1) saved.push(id);
  else            saved.splice(idx, 1);
  localStorage.setItem('lumina_saved_offers', JSON.stringify(saved));
  render(_tab === 'saved');

  // Optimistic icon update without full re-render
  const btn = document.querySelector(`.offer-icon-btn[onclick*="'${id}'"]`);
  if (btn) {
    const icon = btn.querySelector('.material-icons');
    if (icon) icon.textContent = saved.includes(id) ? 'bookmark' : 'bookmark_border';
    btn.classList.toggle('offer-icon-btn--saved', saved.includes(id));
  }
}

function openShareOffer(id, title) {
  const url = `${window.location.origin}${window.location.pathname}?page=offers&offer=${id}`;
  const inp  = document.getElementById('shareOfferLink');
  if (inp) inp.value = url;
  const heading = document.getElementById('shareOfferTitle');
  if (heading) heading.textContent = `Podziel się: ${title}`;
  document.getElementById('shareOfferModal')?.classList.remove('hidden');
}

// ─── PROMO CODE ───────────────────────────────────────────────────────────────

async function applyPromo() {
  const code = document.getElementById('promoCodeInput')?.value?.trim();
  if (!code) return;
  let result;
  try { result = await validateCode(code); } catch(_) { return; }
  if (!result?.valid) return;
  const el = document.getElementById('promoApplied');
  if (el) {
    el.classList.remove('hidden');
    el.textContent = `Kod ${result.promo.code}: -${result.promo.value}${result.promo.type === 'percent' ? '%' : ' zł'}`;
  }
  document.getElementById('promoRemoveBtn')?.classList.remove('hidden');
}

// ─── VOUCHERS ─────────────────────────────────────────────────────────────────

function renderVouchers() {
  const el = document.getElementById('offersVouchersGrid');
  if (!el) return;

  const amounts = [
    { amount: 50,  label: '50 zł',  desc: 'Drobny upominek'        },
    { amount: 100, label: '100 zł', desc: 'Idealny prezent',   popular: true },
    { amount: 200, label: '200 zł', desc: 'Luksusowe doświadczenie' },
    { amount: 500, label: '500 zł', desc: 'Kompletny dzień spa'     },
  ];

  el.innerHTML = amounts.map(v => `
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
      <span class="material-icons">open_in_new</span> Marketplace
    </a>
  </div>`;
}

// ─── BUNDLES ──────────────────────────────────────────────────────────────────

async function renderBundles() {
  const el = document.getElementById('offersBundlesGrid');
  if (!el) return;
  el.innerHTML = '<div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>';

  let bundles = [];
  try {
    const snap = await getDocs(query(collection(db, 'bundles'), where('active', '==', true), limit(6)));
    bundles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!bundles.length) bundles = defaultBundles();

  el.innerHTML = bundles.map(b => {
    const disc = b.totalValue && b.price ? Math.round((1 - b.price / b.totalValue) * 100) : 0;
    const svcs = Array.isArray(b.services)
      ? b.services.map(s => `<li><span class="material-icons">check_circle</span>${escHtml(typeof s === 'string' ? s : s.name)}</li>`).join('')
      : '';
    return `<div class="mkt-bundle-card">
      ${disc > 0 ? `<div class="mkt-bundle-disc-badge">-${disc}%</div>` : ''}
      <div class="mkt-bundle-cat">${escHtml(b.category || '')}</div>
      <h3 class="mkt-bundle-name">${escHtml(b.name)}</h3>
      <ul class="mkt-bundle-services">${svcs}</ul>
      <div class="mkt-bundle-price-row">
        ${b.totalValue ? `<span class="mkt-bundle-orig">${b.totalValue} zł</span>` : ''}
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
    { id:'b1', name:'Dzień Spa',          category:'Masaż',       totalValue:350, price:270,
      services:['Masaż relaksacyjny 60 min','Zabieg na twarz','Manicure'] },
    { id:'b2', name:'Pełna metamorfoza',  category:'Fryzjer',     totalValue:400, price:320,
      services:['Strzyżenie','Koloryzacja','Pielęgnacja'] },
    { id:'b3', name:'Pakiet panny młodej',category:'Kosmetyczka', totalValue:600, price:480,
      services:['Fryzura ślubna','Makijaż','Manicure hybryda','Pedicure'] },
    { id:'b4', name:'Mani + Pedi',        category:'Paznokcie',   totalValue:180, price:150,
      services:['Manicure hybrydowy','Pedicure hybrydowy'] },
    { id:'b5', name:'Barber Classic',     category:'Barber',      totalValue:130, price:100,
      services:['Strzyżenie','Golenie brzytwą','Pielęgnacja brody'] },
    { id:'b6', name:'Relax Weekend',      category:'Masaż',       totalValue:280, price:220,
      services:['Masaż sportowy 45 min','Masaż stóp','Sauna 30 min'] },
  ];
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

async function renderSubscriptions() {
  const el = document.getElementById('offersSubsGrid');
  if (!el) return;
  el.innerHTML = '<div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>';

  let subs = [];
  try {
    const snap = await getDocs(query(collection(db, 'subscriptions'), where('active', '==', true), limit(4)));
    subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!subs.length) {
    subs = [
      { id:'s1', name:'Basic',    visitsPerMonth:1, service:'Strzyżenie lub manicure',            price:89,  highlight:false },
      { id:'s2', name:'Standard', visitsPerMonth:2, service:'Dowolna usługa podstawowa',           price:169, highlight:true  },
      { id:'s3', name:'Premium',  visitsPerMonth:4, service:'Dowolna usługa',                      price:299, highlight:false },
      { id:'s4', name:'VIP',      visitsPerMonth:8, service:'Priorytetowe terminy + usługi premium',price:499, highlight:false },
    ];
  }

  el.innerHTML = subs.map(s => `
    <div class="mkt-sub-card${s.highlight || s.popular ? ' mkt-sub-popular' : ''}">
      ${s.highlight || s.popular ? '<div class="mkt-sub-popular-badge">Najpopularniejszy</div>' : ''}
      <div class="mkt-sub-name">${escHtml(s.name)}</div>
      <div class="mkt-sub-price"><strong>${s.price}</strong> <span>zł / miesiąc</span></div>
      <div class="mkt-sub-visits">
        <span class="material-icons">event_available</span>
        ${s.visitsPerMonth}× wizyta miesięcznie
      </div>
      <div class="mkt-sub-service">${escHtml(s.service || '')}</div>
      <a href="/luminaphp/?page=explore" class="btn ${s.highlight || s.popular ? 'btn-accent' : 'btn-ghost'} mkt-sub-btn">
        Wybierz salon
      </a>
    </div>`).join('');
}
