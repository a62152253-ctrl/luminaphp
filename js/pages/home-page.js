import { loadBusinesses, getPopularCategories } from '../modules/businesses.js';
import { loadFavoriteIds, isFavorite, toggleFavorite } from '../modules/favorites.js';
import { db, collection, getDocs } from '../firebase-config.js';
import { localStore, waitForGlobal } from '../modules/utils.js';

const RECENTLY_VIEWED_KEY = 'lumina_recently_viewed';
let _homeBusinesses = [];

function bindSearch() {
  const btn = document.getElementById('homeSearchBtn');
  if (!btn) return;

  const go = () => {
    const q    = document.getElementById('homeSearchService')?.value.trim();
    const city = document.getElementById('homeSearchLocation')?.value.trim();
    let url = '/luminaphp/?page=explore';
    if (q)    url += '&q='    + encodeURIComponent(q);
    if (city) url += '&city=' + encodeURIComponent(city);
    window.location.href = url;
  };

  btn.addEventListener('click', go);
  ['homeSearchService', 'homeSearchLocation'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });

  // Keyboard shortcut: focus search on "/"
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('homeSearchService')?.focus();
    }
  });
}

function renderRecentlyViewed() {
  const wrap = document.getElementById('recentlyViewedRow');
  if (!wrap) return;
  const items = localStore(RECENTLY_VIEWED_KEY) || [];
  if (!items.length) { wrap.closest?.('[data-section="recently-viewed"]')?.remove(); return; }
  wrap.innerHTML = items.map(b => `
    <a href="?page=business&id=${b.id}" class="recently-viewed-chip">
      <img src="${b.photoURL || 'https://i.pravatar.cc/64'}" alt="${b.name}" onerror="this.src='https://i.pravatar.cc/64'">
      <span>${b.name}</span>
    </a>`).join('');
}

function renderPopularCategories() {
  const wrap = document.getElementById('popularCategoriesRow');
  if (!wrap) return;
  const cats = getPopularCategories(6);
  if (!cats.length) return;
  const icons = { 'Barber': 'content_cut', 'Fryzjer': 'face', 'Kosmetyczka': 'spa', 'Masaż': 'self_improvement', 'Paznokcie': 'brush', 'Inne': 'storefront' };
  wrap.innerHTML = cats.map(({ cat, count }) => `
    <a href="?page=explore&cat=${encodeURIComponent(cat)}" class="category-chip">
      <span class="material-icons">${icons[cat] || 'storefront'}</span>
      <span>${cat}</span>
      <span class="cat-count">${count}</span>
    </a>`).join('');
}

let _featuredSwiper = null;
let _promosSwiper   = null;

function initSwipers() {
  waitForGlobal('Swiper', () => {
    if (!_featuredSwiper) {
      _featuredSwiper = new Swiper('.featured-swiper', {
        slidesPerView: 1.1, spaceBetween: 16, centeredSlides: false,
        pagination: { el: '.featured-swiper-pagination', clickable: true },
        navigation: { nextEl: '.featured-swiper-next', prevEl: '.featured-swiper-prev' },
        breakpoints: {
          640:  { slidesPerView: 2.1, spaceBetween: 20 },
          1024: { slidesPerView: 3,   spaceBetween: 24, centeredSlides: false },
        },
        a11y: { prevSlideMessage: 'Poprzedni salon', nextSlideMessage: 'Następny salon' },
      });
    }
    if (!_promosSwiper) {
      _promosSwiper = new Swiper('.promos-swiper', {
        slidesPerView: 1.1, spaceBetween: 16,
        pagination: { el: '.promos-swiper-pagination', clickable: true },
        breakpoints: {
          640:  { slidesPerView: 2.1, spaceBetween: 20 },
          1024: { slidesPerView: 3,   spaceBetween: 24 },
        },
        a11y: { prevSlideMessage: 'Poprzednia promocja', nextSlideMessage: 'Następna promocja' },
      });
    }
  }, { intervalMs: 80 });
}

export async function initHome() {
  bindSearch();
  _homeBusinesses = await loadBusinesses();
  renderFeatured(_homeBusinesses);
  renderRecentlyViewed();
  renderPopularCategories();
  await loadPromos();
  initSwipers();

  // Override toggleFav to re-render hearts on home page
  const origToggle = window.toggleFav;
  window.toggleFav = async (bizId) => {
    const user = window.App?.user;
    if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
    window.App.favorites = await toggleFavorite(user.uid, bizId, window.App.favorites);
    renderFeatured(_homeBusinesses);
    if (_featuredSwiper) _featuredSwiper.update();
    if (typeof origToggle === 'function') origToggle(bizId);
  };
}

function renderFeatured(businesses) {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const featured = businesses.slice(0, 4);
  if (!featured.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:3rem 0">
      <div class="empty-state-icon"><span class="material-icons">storefront</span></div>
      <h3>Brak salonów</h3>
      <p>Salony pojawią się po rejestracji pierwszego właściciela.</p>
    </div>`;
    return;
  }

  const favIds = (window.App?.favorites || []).map(f => f.bizId);

  grid.innerHTML = featured.map(b => {
    const isFav = favIds.includes(b.id);
    return `
    <div class="swiper-slide">
    <a href="?page=business&id=${b.id}" class="salon-booksy-card">
      <div class="salon-booksy-img">
        <img src="${b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop'}" alt="${b.name}" loading="lazy">
        <button class="salon-booksy-fav${isFav ? ' active' : ''}" onclick="event.preventDefault();window.toggleFav('${b.id}')">
          <span class="material-icons">${isFav ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
      <div class="salon-booksy-body">
        <div class="salon-booksy-cat">${b.category}</div>
        <h3 class="salon-booksy-name">${b.name}</h3>
        <div class="salon-booksy-meta">
          <span class="salon-booksy-rating"><span class="material-icons">star</span> ${b.rating || '—'}</span>
          <span>${b.city}</span>
        </div>
        <div class="salon-booksy-price">${b.address || ''}</div>
        <button class="salon-booksy-book">Umów wizytę</button>
      </div>
    </a>
    </div>`;
  }).join('');
  if (_featuredSwiper) _featuredSwiper.update();
}

async function loadPromos() {
  const grid = document.getElementById('promotionsGrid');
  const section = document.getElementById('promoSection');
  if (!grid) return;

  try {
    const snap = await getDocs(collection(db, 'promotions'));
    const promos = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.active !== false);

    if (section) section.style.display = '';

    if (!promos.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:2rem 0">
        <div class="empty-state-icon"><span class="material-icons">local_offer</span></div>
        <h3>Brak aktywnych promocji</h3>
        <p>Sprawdź ponownie wkrótce — salony regularnie dodają nowe oferty.</p>
      </div>`;
      return;
    }

    grid.innerHTML = promos.map(p => {
      const pct = p.discountPercent || Math.round((1 - p.discountPrice / p.originalPrice) * 100);
      const photo = p.photoURL || p.bizPhotoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop';
      return `
      <div class="swiper-slide">
      <a href="?page=business&id=${p.businessId}" class="promo-booksy-card">
        <div class="promo-booksy-tag">-${pct}%</div>
        <div class="promo-booksy-img">
          <img src="${photo}" alt="${p.title}" loading="lazy">
        </div>
        <div class="promo-booksy-content">
          <h3>${p.title}</h3>
          <p>${p.businessName}</p>
          <div class="promo-booksy-price">
            <span class="promo-new">${p.discountPrice} zł</span>
            <span class="promo-old">${p.originalPrice} zł</span>
          </div>
        </div>
      </a>
      </div>`;
    }).join('');
    if (_promosSwiper) _promosSwiper.update();
  } catch(e) {
    if (section) section.style.display = '';
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:2rem 0">
      <div class="empty-state-icon"><span class="material-icons">wifi_off</span></div>
      <h3>Nie udało się załadować promocji</h3>
      <p>Sprawdź połączenie z internetem i <button onclick="location.reload()" style="text-decoration:underline;color:inherit;background:none;border:none;cursor:pointer;font:inherit">odśwież stronę</button>.</p>
    </div>`;
  }
}
