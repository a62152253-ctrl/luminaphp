import { getBusinessById, loadServices, loadStaff } from '../modules/businesses.js';
import {
  initBookingPanel, selectService, selectStaff, selectDate, selectTime,
  confirmBooking, setServices, setStaff
} from '../modules/booking-mgr.js';
import { toggleFavorite, loadFavoriteIds, isFavorite } from '../modules/favorites.js';
import { toast, onAppReady } from '../modules/utils.js';
import { initReclaim } from '../modules/reclaim-mgr.js';
import { db, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp }
  from '../firebase-config.js';

export async function initBusiness(id) {
  const business = await getBusinessById(id);

  if (!business) {
    document.querySelector('.biz-hero') && (document.querySelector('.biz-hero').innerHTML = `
      <div class="empty-state" style="min-height:40vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div class="empty-state-icon"><span class="material-icons">storefront</span></div>
        <h3>Salon nie znaleziony</h3>
        <p>Ten salon nie istnieje lub został usunięty.</p>
        <a href="?page=explore" class="btn btn-accent" style="margin-top:1.5rem;display:inline-flex">Wróć do eksploracji</a>
      </div>`);
    return;
  }

  const bizImg = document.getElementById('bizHeroImg');
  if (bizImg) bizImg.src = business.photoURL || '';

  const setText = (elId, text) => { const el = document.getElementById(elId); if(el) el.textContent = text; };
  setText('bizCat', business.category);
  setText('bizNameText', business.name);
  setText('bizCity', `${business.address}, ${business.city}`);
  setText('bizRating', business.rating || '—');
  document.title = `${business.name} | Lumina`;
  initReclaim(id, business.name, business.verified ?? false);

  renderHoursHint(business.hours);

  const [services, staff] = await Promise.all([loadServices(id), loadStaff(id)]);
  setServices(services);
  setStaff(staff);

  renderServices(services);
  renderStaff(staff);
  initBookingPanel();

  await initFavButton(id);

  // Load secondary sections — don't block booking panel
  loadAndRenderPromos(id);
  loadAndRenderReviews(id);

  window.selectService  = selectService;
  window.selectStaff    = selectStaff;
  window.selectDate     = selectDate;
  window.selectTime     = selectTime;
  window.confirmBooking = () => confirmBooking(window.App?.user, id, business.name);
  window.submitReview   = () => submitReview(id);
  window.setReviewStar  = setReviewStar;
}

// ===== SERVICES =====
function renderServices(services) {
  const el = document.getElementById('servicesList');
  if (!el) return;
  if (!services.length) {
    el.innerHTML = `<div class="empty-state" style="padding:2rem 0">
      <span class="material-icons" style="font-size:2rem;color:var(--zinc-300)">content_cut</span>
      <p style="color:var(--zinc-400);margin-top:.5rem">Brak usług w ofercie</p>
    </div>`;
    return;
  }
  el.innerHTML = services.map(s => `
    <div class="service-item" data-id="${s.id}" onclick="window.selectService('${s.id}')">
      <div class="service-item-dot"></div>
      <div class="service-item-name">${s.name}</div>
      <div class="service-item-dur">${s.duration} min</div>
      <div class="service-item-price">${s.price} zł</div>
    </div>`).join('');
}

// ===== STAFF =====
function renderStaff(staff) {
  const el = document.getElementById('staffGrid');
  if (!el) return;
  if (!staff.length) {
    el.innerHTML = `<p style="color:var(--zinc-400);font-size:.875rem">Brak przypisanych pracowników</p>`;
    return;
  }
  el.innerHTML = staff.map(s => `
    <div class="staff-card" data-id="${s.id}" onclick="window.selectStaff('${s.id}')">
      <img src="${s.photoURL || 'https://i.pravatar.cc/200'}" alt="${s.name}">
      <div class="staff-card-name">${s.name}</div>
      <div class="staff-card-title">${s.title || ''}</div>
    </div>`).join('');
}

// ===== FAVORITES =====
async function initFavButton(bizId) {
  const btn = document.getElementById('favBtn');
  if (!btn) return;

  const tryLoad = async () => {
    const user = window.App?.user;
    if (!user) return;
    const favs = await loadFavoriteIds(user.uid);
    window.App.favorites = favs;
    updateFavBtn(btn, isFavorite(favs, bizId));
  };

  if (window.App?._ready) {
    await tryLoad();
  } else {
    onAppReady(() => { void tryLoad(); });
  }

  btn.onclick = async () => {
    const user = window.App?.user;
    if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
    const updated = await toggleFavorite(user.uid, bizId, window.App.favorites);
    window.App.favorites = updated;
    updateFavBtn(btn, isFavorite(updated, bizId));
  };
}

function updateFavBtn(btn, active) {
  btn.innerHTML = `<span class="material-icons">${active ? 'favorite' : 'favorite_border'}</span>`;
  btn.classList.toggle('fav-active', active);
}

// ===== HOURS =====
function renderHoursHint(hours) {
  const textEl  = document.getElementById('bizHoursText');
  const badgeEl = document.getElementById('bizOpenBadge');
  if (!textEl) return;

  if (!hours) { textEl.textContent = '—'; return; }

  const today  = new Date();
  const dow    = today.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const dayIdx = dow === 0 ? 6 : dow - 1; // convert to 0=Mon, 6=Sun
  const h      = hours[dayIdx];

  if (!h) { textEl.textContent = '—'; return; }

  if (h.closed) {
    textEl.textContent = 'Dziś: zamknięte';
    if (badgeEl) { badgeEl.textContent = 'Zamknięte'; badgeEl.className = 'biz-status-badge biz-status-closed'; badgeEl.style.display = ''; }
    return;
  }

  textEl.textContent = `Dziś: ${h.open}–${h.close}`;

  const [oh, om] = h.open.split(':').map(Number);
  const [ch, cm] = h.close.split(':').map(Number);
  const nowMin   = today.getHours() * 60 + today.getMinutes();
  const isOpen   = nowMin >= oh * 60 + om && nowMin < ch * 60 + cm;

  if (badgeEl) {
    badgeEl.textContent  = isOpen ? 'Otwarte' : 'Zamknięte';
    badgeEl.className    = `biz-status-badge ${isOpen ? 'biz-status-open' : 'biz-status-closed'}`;
    badgeEl.style.display = '';
  }
}

// ===== PROMOTIONS =====
async function loadAndRenderPromos(bizId) {
  try {
    const snap = await getDocs(query(
      collection(db, 'promotions'),
      where('businessId', '==', bizId),
      where('active', '==', true)
    ));
    const promos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!promos.length) return;

    const panel = document.getElementById('bizPromosPanel');
    const list  = document.getElementById('bizPromosList');
    if (!panel || !list) return;

    panel.style.display = '';
    list.innerHTML = promos.map(p => {
      const pct = p.discountPercent
        || Math.round((1 - Number(p.discountPrice) / Number(p.originalPrice)) * 100);
      return `
        <div class="promo-card">
          ${p.photoURL ? `<div class="promo-img"><img src="${p.photoURL}" alt=""></div>` : ''}
          <div class="promo-body">
            <span class="promo-badge">-${pct}%</span>
            <p class="promo-title">${esc(p.title)}</p>
            <div class="promo-prices">
              <span class="promo-new">${Number(p.discountPrice).toFixed(0)} zł</span>
              <span class="promo-old">${Number(p.originalPrice).toFixed(0)} zł</span>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch(e) { /* promotions are optional — ignore errors */ }
}

// ===== REVIEWS =====
let _bizReviews  = [];
let _selectedStar = 0;

async function loadAndRenderReviews(bizId) {
  const panel = document.getElementById('bizReviewsPanel');
  const listEl = document.getElementById('bizReviewsList');
  if (listEl) listEl.innerHTML = '<div class="spinner" style="margin:2rem auto"></div>';

  try {
    const snap = await getDocs(query(
      collection(db, 'reviews'),
      where('businessId', '==', bizId),
      orderBy('createdAt', 'desc')
    ));
    _bizReviews = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => !r.hidden);

    renderReviewsSummary();
    renderReviewList();
    renderReviewForm(bizId);
  } catch(e) {
    const summary = document.getElementById('bizReviewsSummary');
    if (summary) summary.innerHTML = '';
    renderReviewForm(bizId); // still show login prompt / form even if load failed
    console.error('reviews load:', e);
  }
}

function renderReviewsSummary() {
  const el = document.getElementById('bizReviewsSummary');
  if (!el) return;

  if (!_bizReviews.length) {
    el.innerHTML = `<p class="reviews-empty-hint">Brak opinii — bądź pierwszy!</p>`;
    return;
  }

  const avg  = _bizReviews.reduce((s, r) => s + (r.rating || 0), 0) / _bizReviews.length;
  const cnt  = _bizReviews.length;
  const dist = [5, 4, 3, 2, 1].map(n => ({ n, c: _bizReviews.filter(r => r.rating === n).length }));
  const label = cnt === 1 ? 'opinia' : cnt < 5 ? 'opinie' : 'opinii';

  el.innerHTML = `
    <div class="reviews-summary">
      <div class="reviews-avg">
        <div class="reviews-avg-num">${avg.toFixed(1)}</div>
        <div class="reviews-avg-stars">${starsHtml(avg)}</div>
        <div class="reviews-avg-count">${cnt} ${label}</div>
      </div>
      <div class="reviews-dist">
        ${dist.map(d => `
          <div class="reviews-dist-row">
            <span class="reviews-dist-label">${d.n}★</span>
            <div class="reviews-dist-bar-wrap">
              <div class="reviews-dist-bar" style="width:${cnt ? (d.c / cnt * 100).toFixed(0) : 0}%"></div>
            </div>
            <span class="reviews-dist-count">${d.c}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderReviewList() {
  const el = document.getElementById('bizReviewsList');
  if (!el || !_bizReviews.length) { if (el) el.innerHTML = ''; return; }

  el.innerHTML = _bizReviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-author">
          <div class="review-avatar">${(r.userName || r.displayName || 'A')[0].toUpperCase()}</div>
          <div>
            <div class="review-name">${esc(r.userName || r.displayName || 'Anonim')}</div>
            <div class="review-date">${fmtDate(r.createdAt)}</div>
          </div>
        </div>
        <div class="review-stars">${starsHtml(r.rating || 0)}</div>
      </div>
      ${r.comment ? `<p class="review-comment">${esc(r.comment)}</p>` : ''}
      ${r.ownerReply ? `
        <div class="review-reply">
          <div class="review-reply-label">
            <span class="material-icons" style="font-size:.875rem">storefront</span> Odpowiedź salonu
          </div>
          <p>${esc(r.ownerReply)}</p>
        </div>` : ''}
    </div>`).join('');
}

function renderReviewForm(bizId) {
  const el = document.getElementById('bizReviewForm');
  if (!el) return;
  _selectedStar = 0;

  const renderWhenReady = () => {
    const user = window.App?.user;

    if (!user) {
      el.innerHTML = `
        <div class="review-login-prompt">
          <span class="material-icons">rate_review</span>
          <p>Zaloguj się, aby wystawić opinię temu salonowi.</p>
          <a href="?page=auth" class="btn btn-accent" style="display:inline-flex;margin-top:.75rem">Zaloguj się</a>
        </div>`;
      return;
    }

    if (_bizReviews.find(r => r.userId === user.uid)) {
      el.innerHTML = `
        <div class="review-already">
          <span class="material-icons" style="color:#22c55e;font-size:1.25rem">check_circle</span>
          Twoja opinia została dodana. Dziękujemy!
        </div>`;
      return;
    }

    el.innerHTML = `
      <div class="review-form">
        <h3 class="review-form-title">Wystaw opinię</h3>
        <div class="review-star-selector" id="reviewStarRow">
          ${[1,2,3,4,5].map(n => `
            <span class="review-star-btn material-icons" data-n="${n}"
              onclick="window.setReviewStar(${n})">star_border</span>`).join('')}
        </div>
        <div id="reviewStarError" class="review-field-error"></div>
        <textarea id="reviewComment" class="auth-input" rows="3"
          placeholder="Opisz swoje wrażenia… (opcjonalnie)"
          style="resize:vertical;margin-top:.75rem"></textarea>
        <button class="auth-submit" style="margin-top:1rem" onclick="window.submitReview()">
          <span class="material-icons" style="font-size:1rem;vertical-align:middle">send</span>
          Wyślij opinię
        </button>
      </div>`;
  };

  if (window.App?._ready) {
    renderWhenReady();
  } else {
    el.innerHTML = '';
    onAppReady(renderWhenReady);
  }
}

function setReviewStar(n) {
  _selectedStar = n;
  document.querySelectorAll('.review-star-btn').forEach((el, i) => {
    el.textContent = i < n ? 'star' : 'star_border';
    el.classList.toggle('review-star-active', i < n);
  });
  const err = document.getElementById('reviewStarError');
  if (err) err.textContent = '';
}

async function submitReview(bizId) {
  const user = window.App?.user;
  if (!user) { toast('Musisz być zalogowany', 'error'); return; }

  if (!_selectedStar) {
    const err = document.getElementById('reviewStarError');
    if (err) err.textContent = 'Wybierz ocenę (1–5 gwiazdek).';
    return;
  }

  const comment = document.getElementById('reviewComment')?.value.trim() || '';
  const btn = document.querySelector('#bizReviewForm .auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Wysyłanie…'; }

  try {
    await addDoc(collection(db, 'reviews'), {
      businessId: bizId,
      userId:     user.uid,
      userName:   user.displayName || user.email || 'Anonim',
      rating:     _selectedStar,
      comment,
      createdAt:  serverTimestamp(),
      hidden:     false,
    });
    toast('Dziękujemy za opinię!');
    _selectedStar = 0;
    await loadAndRenderReviews(bizId);
  } catch(e) {
    toast('Błąd wysyłania: ' + e.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Wyślij opinię'; }
  }
}

// ===== HELPERS =====
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function starsHtml(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const r   = rating - i + 1;
    const ico = r >= 1 ? 'star' : r >= 0.5 ? 'star_half' : 'star_border';
    html += `<span class="material-icons" style="font-size:1rem;color:#f59e0b">${ico}</span>`;
  }
  return html;
}

function fmtDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
}
