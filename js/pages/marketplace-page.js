// marketplace-page.js — Discovery hub: Flash Deals, Top of Week, Vouchers, Bundles, Subs, Group Booking
import { db, collection, getDocs, addDoc, query, where, orderBy, limit, serverTimestamp }
  from '../firebase-config.js';
import { loadBusinesses } from '../modules/businesses.js';
import { escHtml, debounce, formatDateKey, toast } from '../modules/utils.js';

let _businesses = [];

export async function initMarketplace() {
  _businesses = await loadBusinesses();

  await Promise.all([
    loadFlashDeals(),
    loadTopWeek(),
    loadBundles(),
    loadSubscriptions(),
  ]);

  renderSeasonal();

  document.getElementById('flashRefreshBtn')?.addEventListener('click', loadFlashDeals);
  document.getElementById('topWeekRefreshBtn')?.addEventListener('click', loadTopWeek);

  window.openVoucherModal      = openVoucherModal;
  window.purchaseVoucher       = purchaseVoucher;
  window.openGroupBookingModal = openGroupBookingModal;
  window.submitGroupBooking    = submitGroupBooking;
  window.selectGroupSalon      = selectGroupSalon;
}

// ─── FLASH DEALS ──────────────────────────────────────────────────────────────

async function loadFlashDeals() {
  const el = document.getElementById('flashDealsGrid');
  if (!el) return;
  el.innerHTML = `<div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>`;

  let deals = [];
  try {
    const snap = await getDocs(query(
      collection(db, 'flashDeals'),
      where('active', '==', true),
      orderBy('expiresAt', 'asc'),
      limit(8)
    ));
    deals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!deals.length && _businesses.length) {
    const now = new Date();
    deals = _businesses.slice(0, 6).map((b, i) => {
      const hoursAhead = 2 + i;
      const slotTime = new Date(now.getTime() + hoursAhead * 3600000);
      const expiry   = new Date(slotTime.getTime() - 30 * 60000);
      return {
        id: `mock_${b.id}`,
        businessId: b.id,
        businessName: b.name,
        businessPhoto: b.photoURL,
        category: b.category,
        serviceName: 'Wizyta',
        originalPrice: b.minPrice || 100,
        discount: 30,
        slotTime: slotTime.toISOString(),
        expiresAt: { toDate: () => expiry },
      };
    });
  }

  if (!deals.length) {
    el.innerHTML = `<div class="mkt-empty-state">
      <span class="material-icons">flash_off</span>
      <p>Brak aktywnych flash deali. Sprawdź za chwilę.</p>
    </div>`;
    return;
  }

  el.innerHTML = deals.map(flashDealCard).join('');
  startFlashCountdowns();
}

function flashDealCard(d) {
  const disc   = Number(d.discount) || 30;
  const orig   = Number(d.originalPrice) || 100;
  const price  = Math.round(orig * (1 - disc / 100));
  const slot   = d.slotTime ? new Date(d.slotTime) : null;
  const slotStr = slot
    ? slot.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : '';
  const expiryTs = d.expiresAt?.toDate?.()?.toISOString() || '';

  return `<div class="mkt-flash-card">
    <div class="mkt-flash-discount-badge">-${disc}%</div>
    <div class="mkt-flash-img">
      <img src="${escHtml(d.businessPhoto || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400')}"
        alt="${escHtml(d.businessName || '')}" loading="lazy">
    </div>
    <div class="mkt-flash-body">
      <div class="mkt-flash-cat">${escHtml(d.category || '')}</div>
      <h3>${escHtml(d.businessName || '')}</h3>
      <div class="mkt-flash-service">${escHtml(d.serviceName || 'Wizyta')}</div>
      <div class="mkt-flash-price-row">
        <span class="mkt-flash-orig">${orig} zł</span>
        <span class="mkt-flash-price">${price} zł</span>
      </div>
      ${slotStr ? `<div class="mkt-flash-slot"><span class="material-icons">schedule</span> Wolny slot: ${slotStr}</div>` : ''}
      ${expiryTs ? `<div class="mkt-flash-timer" data-expires="${escHtml(expiryTs)}">Ładowanie...</div>` : ''}
    </div>
    <a href="/luminaphp/?page=business&id=${escHtml(d.businessId || '')}"
      class="btn btn-accent btn-sm mkt-flash-book-btn">
      <span class="material-icons">flash_on</span> Zarezerwuj teraz
    </a>
  </div>`;
}

function startFlashCountdowns() {
  document.querySelectorAll('.mkt-flash-timer[data-expires]').forEach(el => {
    const end = new Date(el.dataset.expires);
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        el.textContent = 'Wygasła';
        el.classList.add('mkt-flash-expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = `<span class="material-icons" style="font-size:.875rem;vertical-align:middle">timer</span> Kończy się za: ${m}m ${s}s`;
      setTimeout(tick, 1000);
    };
    tick();
  });
}

// ─── TOP OF THE WEEK ──────────────────────────────────────────────────────────

async function loadTopWeek() {
  const el = document.getElementById('topWeekList');
  if (!el) return;
  el.innerHTML = `<div class="spinner" style="margin:3rem auto"></div>`;

  const sorted = [..._businesses]
    .filter(b => b.rating)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  if (!sorted.length) {
    el.innerHTML = `<div class="mkt-empty-state">
      <span class="material-icons">emoji_events</span><p>Brak danych rankingowych</p>
    </div>`;
    return;
  }

  el.innerHTML = sorted.map((b, i) => `
    <a class="mkt-top-row" href="/luminaphp/?page=business&id=${escHtml(b.id)}">
      <div class="mkt-top-rank ${i < 3 ? 'mkt-top-rank-medal' : ''}">
        ${i === 0
          ? '<span class="material-icons" style="color:#f59e0b">emoji_events</span>'
          : i === 1
            ? '<span class="material-icons" style="color:#94a3b8">emoji_events</span>'
            : i === 2
              ? '<span class="material-icons" style="color:#b45309">emoji_events</span>'
              : `<span>${i + 1}</span>`}
      </div>
      <div class="mkt-top-img">
        <img src="${escHtml(b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80')}"
          alt="${escHtml(b.name)}" loading="lazy">
      </div>
      <div class="mkt-top-info">
        <strong>${escHtml(b.name)}</strong>
        <span>${escHtml(b.category || '')}${b.city ? ' · ' + escHtml(b.city) : ''}</span>
      </div>
      <div class="mkt-top-rating">
        <span class="material-icons" style="color:#f59e0b;font-size:1rem">star</span>
        <strong>${b.rating || '—'}</strong>
        ${b.reviewCount ? `<span class="mkt-top-review-count">(${b.reviewCount})</span>` : ''}
      </div>
      ${b.minPrice ? `<div class="mkt-top-price">od ${b.minPrice} zł</div>` : ''}
    </a>`).join('');
}

// ─── BUNDLES ──────────────────────────────────────────────────────────────────

async function loadBundles() {
  const el = document.getElementById('bundlesGrid');
  if (!el) return;

  let bundles = [];
  try {
    const snap = await getDocs(query(collection(db, 'bundles'), where('active', '==', true), limit(6)));
    bundles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!bundles.length) bundles = defaultBundles();

  el.innerHTML = bundles.map(bundleCard).join('');
}

function defaultBundles() {
  return [
    { id: 'b1', name: 'Dzień Spa', category: 'Masaż',       originalPrice: 350, price: 270,
      services: ['Masaż relaksacyjny 60 min', 'Zabieg na twarz', 'Manicure'] },
    { id: 'b2', name: 'Pełna metamorfoza', category: 'Fryzjer', originalPrice: 400, price: 320,
      services: ['Strzyżenie', 'Koloryzacja', 'Pielęgnacja'] },
    { id: 'b3', name: 'Pakiet panny młodej', category: 'Kosmetyczka', originalPrice: 600, price: 480,
      services: ['Fryzura ślubna', 'Makijaż', 'Manicure hybryda', 'Pedicure'] },
    { id: 'b4', name: 'Mani + Pedi', category: 'Paznokcie', originalPrice: 180, price: 150,
      services: ['Manicure hybrydowy', 'Pedicure hybrydowy'] },
    { id: 'b5', name: 'Barber Classic', category: 'Barber',  originalPrice: 130, price: 100,
      services: ['Strzyżenie', 'Golenie brzytwą', 'Pielęgnacja brody'] },
    { id: 'b6', name: 'Relax Weekend', category: 'Masaż',   originalPrice: 280, price: 220,
      services: ['Masaż sportowy 45 min', 'Masaż stóp', 'Sauna 30 min'] },
  ];
}

function bundleCard(b) {
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
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

async function loadSubscriptions() {
  const el = document.getElementById('subscriptionsGrid');
  if (!el) return;

  let subs = [];
  try {
    const snap = await getDocs(query(collection(db, 'subscriptions'), where('active', '==', true), limit(4)));
    subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) {}

  if (!subs.length) subs = defaultSubscriptions();

  el.innerHTML = subs.map(subCard).join('');
}

function defaultSubscriptions() {
  return [
    { id: 's1', name: 'Basic',    visitsPerMonth: 1, service: 'Strzyżenie lub manicure',          price: 89,  highlight: false },
    { id: 's2', name: 'Standard', visitsPerMonth: 2, service: 'Dowolna usługa podstawowa',         price: 169, highlight: true  },
    { id: 's3', name: 'Premium',  visitsPerMonth: 4, service: 'Dowolna usługa',                    price: 299, highlight: false },
    { id: 's4', name: 'VIP',      visitsPerMonth: 8, service: 'Priorytetowe terminy + usługi premium', price: 499, highlight: false },
  ];
}

function subCard(s) {
  return `<div class="mkt-sub-card${s.highlight ? ' mkt-sub-popular' : ''}">
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
  </div>`;
}

// ─── SEASONAL CAMPAIGNS ───────────────────────────────────────────────────────

function renderSeasonal() {
  const el = document.getElementById('seasonalGrid');
  if (!el) return;

  const month = new Date().getMonth() + 1;

  const campaigns = [
    { icon: 'favorite',          title: 'Sezon ślubny',          desc: 'Wyjątkowe pakiety dla nowożeńców i par',         color: '#db2777', bg: '#fdf2f8', active: month >= 4 && month <= 9,  cat: 'Kosmetyczka' },
    { icon: 'school',            title: 'Powrót do szkoły',      desc: 'Zadbaj o swój wygląd przed nowym rokiem',        color: '#7c3aed', bg: '#f5f3ff', active: month === 8 || month === 9, cat: 'Fryzjer' },
    { icon: 'wb_sunny',          title: 'Lato w pełni',          desc: 'Przygotuj się na sezon: beach body, piękna skóra', color: '#f59e0b', bg: '#fffbeb', active: month >= 6 && month <= 8,  cat: 'Masaż' },
    { icon: 'park',              title: 'Jesienna pielęgnacja',  desc: 'Regeneracja po lecie — zadbaj o siebie',          color: '#d97706', bg: '#fef3c7', active: month >= 9 && month <= 11, cat: 'Kosmetyczka' },
    { icon: 'star',              title: 'Świąteczny glamour',    desc: 'Wyglądaj olśniewająco na świątecznych imprezach', color: '#dc2626', bg: '#fef2f2', active: month === 11 || month === 12, cat: 'Fryzjer' },
    { icon: 'volunteer_activism',title: 'Walentynki',            desc: 'Romantyczne pakiety dla par',                     color: '#e11d48', bg: '#fff1f2', active: month === 1 || month === 2,  cat: 'Masaż' },
  ];

  el.innerHTML = campaigns.map(c => `
    <a href="/luminaphp/?page=explore&cat=${encodeURIComponent(c.cat)}"
      class="mkt-seasonal-card${c.active ? ' mkt-seasonal-active' : ''}">
      <div class="mkt-seasonal-icon" style="background:${c.bg};color:${c.color}">
        <span class="material-icons">${c.icon}</span>
      </div>
      <div class="mkt-seasonal-body">
        <strong style="color:${c.color}">${escHtml(c.title)}</strong>
        <p>${escHtml(c.desc)}</p>
        ${c.active ? '<span class="mkt-seasonal-live-badge">Aktywna</span>' : ''}
      </div>
    </a>`).join('');
}

// ─── VOUCHER FLOW ─────────────────────────────────────────────────────────────

function openVoucherModal(amount = 0) {
  const el = document.getElementById('voucherModal');
  if (!el) return;
  const amountEl = document.getElementById('voucherAmount');
  if (amountEl) {
    if (amount > 0) {
      amountEl.value = amount;
    } else {
      const custom = parseFloat(document.getElementById('customVoucherAmount')?.value) || 0;
      amountEl.value = custom || '';
    }
  }
  el.classList.remove('hidden');
}

async function purchaseVoucher() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const amount         = parseFloat(document.getElementById('voucherAmount')?.value);
  const recipientName  = document.getElementById('voucherRecipientName')?.value.trim();
  const recipientEmail = document.getElementById('voucherRecipientEmail')?.value.trim();
  const message        = document.getElementById('voucherMessage')?.value.trim() || '';

  if (!amount || amount < 10) { toast('Minimalna wartość vouchera to 10 zł', 'error'); return; }
  if (!recipientName)          { toast('Podaj imię obdarowanego', 'error'); return; }
  if (!recipientEmail || !recipientEmail.includes('@')) {
    toast('Podaj prawidłowy adres e-mail', 'error'); return;
  }

  const code = 'V-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000);

  try {
    await addDoc(collection(db, 'vouchers'), {
      code,
      amount,
      senderUid: user.uid,
      senderEmail: user.email || '',
      recipientName,
      recipientEmail,
      message,
      used: false,
      createdAt: serverTimestamp(),
      expiresAt,
    });
    document.getElementById('voucherModal')?.classList.add('hidden');
    toast(`Voucher ${code} (${amount} zł) wysłany do ${recipientEmail}!`);
  } catch(e) {
    toast('Błąd zapisu vouchera', 'error');
  }
}

// ─── GROUP BOOKING ────────────────────────────────────────────────────────────

function openGroupBookingModal() {
  const modal = document.getElementById('groupBookingModal');
  if (!modal) return;

  const dateEl = document.getElementById('groupDate');
  if (dateEl) dateEl.value = formatDateKey();

  modal.classList.remove('hidden');

  const searchEl = document.getElementById('groupSalonSearch');
  if (searchEl) {
    searchEl.oninput = debounce(e => {
      const q = e.target.value.toLowerCase();
      const matches = _businesses
        .filter(b => (b.name || '').toLowerCase().includes(q) || (b.city || '').toLowerCase().includes(q))
        .slice(0, 5);
      const res = document.getElementById('groupSalonResults');
      if (!res) return;
      res.innerHTML = matches.map(b =>
        `<div class="mkt-group-salon-result"
          onclick="window.selectGroupSalon('${escHtml(b.id)}','${escHtml(b.name)}')">
          <strong>${escHtml(b.name)}</strong>
          <span>${escHtml(b.city || '')}</span>
        </div>`
      ).join('');
    }, 250);
  }
}

function selectGroupSalon(id, name) {
  const searchEl = document.getElementById('groupSalonSearch');
  if (searchEl) {
    searchEl.value = name;
    searchEl.dataset.bizId = id;
  }
  const res = document.getElementById('groupSalonResults');
  if (res) res.innerHTML = '';
}

async function submitGroupBooking() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const searchEl = document.getElementById('groupSalonSearch');
  const bizId    = searchEl?.dataset.bizId || '';
  const bizName  = searchEl?.value.trim() || '';
  const people   = parseInt(document.getElementById('groupPeople')?.value) || 2;
  const date     = document.getElementById('groupDate')?.value || '';
  const service  = document.getElementById('groupService')?.value.trim() || '';
  const note     = document.getElementById('groupNote')?.value.trim() || '';

  if (!bizName) { toast('Wybierz salon', 'error'); return; }
  if (!date)    { toast('Wybierz datę', 'error');  return; }

  try {
    await addDoc(collection(db, 'groupBookings'), {
      userId: user.uid,
      userEmail: user.email || '',
      businessId: bizId,
      businessName: bizName,
      people,
      date,
      service,
      note,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    document.getElementById('groupBookingModal')?.classList.add('hidden');
    toast('Zapytanie o rezerwację grupową wysłane! Salon skontaktuje się z Tobą.');
  } catch(e) {
    toast('Błąd zapisu', 'error');
  }
}
