import { loadBusinesses } from '../modules/businesses.js';
import { initMap, addMarkers, destroyMap } from '../modules/map-view.js';
import { debounce, escHtml, localStore, truncate } from '../modules/utils.js';
import { toggleFavorite } from '../modules/favorites.js';
import { getUserLocation, sortByDistance, formatDistance } from '../modules/geo.js';

const RECENT_KEY  = 'lumina_recent_searches';
const RECENT_MAX  = 6;
const VIEWED_KEY  = 'lumina_recently_viewed';
const VIEWED_MAX  = 8;

function saveRecentSearch(q) {
  if (!q || q.length < 2) return;
  const prev = localStore(RECENT_KEY) || [];
  const next = [q, ...prev.filter(s => s !== q)].slice(0, RECENT_MAX);
  localStore(RECENT_KEY, next);
}

function renderRecentSearches() {
  const wrap = document.getElementById('recentSearches');
  if (!wrap) return;
  const items = localStore(RECENT_KEY) || [];
  if (!items.length) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  wrap.innerHTML = `<span class="recent-label">Ostatnie:</span>` +
    items.map(s => `<button class="recent-chip" onclick="window._setSearch(${JSON.stringify(s)})">${escHtml(s)}</button>`).join('') +
    `<button class="recent-clear" onclick="window._clearRecent()">wyczyść</button>`;
}

export function trackRecentlyViewed(biz) {
  if (!biz?.id) return;
  const prev = localStore(VIEWED_KEY) || [];
  const next = [{ id: biz.id, name: biz.name, category: biz.category, photoURL: biz.photoURL },
    ...prev.filter(b => b.id !== biz.id)].slice(0, VIEWED_MAX);
  localStore(VIEWED_KEY, next);
}

// ─── STATE ────────────────────────────────────────────────────────────────────
let _all             = [];
let _userLoc         = null;
let _sortMode        = 'recommended';
let _currentView     = 'list';
let _search          = '';
let _locationSearch  = '';
let _categories      = [];   // checked category values
let _minPrice        = null;
let _maxPrice        = null;
let _minRating       = null;
let _filterOpenNow   = false;
let _filterOpenToday = false;

// ─── INIT ─────────────────────────────────────────────────────────────────────
export async function initExplore(initialCat = '') {
  const params        = new URLSearchParams(location.search);
  const initialQ      = params.get('q')    || '';
  const initialCity   = params.get('city') || '';
  _search             = [initialQ, initialCity].filter(Boolean).join(' ');

  if (initialCat) _categories = [initialCat];

  _all = await loadBusinesses();

  // Pre-fill search boxes
  const searchEl = document.getElementById('exploreSearch');
  if (searchEl && _search) searchEl.value = _search;

  // Pre-check category from URL
  if (initialCat) {
    document.querySelectorAll('#filterCat input[type=checkbox]').forEach(cb => {
      if (cb.value === initialCat) cb.checked = true;
    });
  }

  bindEvents();
  requestLocation();
  applyAndRender();
  renderRecentSearches();
}

// ─── EVENT BINDING ────────────────────────────────────────────────────────────
function bindEvents() {
  // Global keyboard: "/" to focus search, Escape to clear
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { clearFilters(); applyAndRender(); renderRecentSearches(); }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('exploreSearch')?.focus();
    }
  });

  // Window globals for recent chips
  window._setSearch = (q) => {
    _search = q;
    const el = document.getElementById('exploreSearch');
    if (el) el.value = q;
    saveRecentSearch(q);
    renderRecentSearches();
    applyAndRender();
  };
  window._clearRecent = () => {
    localStore(RECENT_KEY, []);
    renderRecentSearches();
  };

  // Search header inputs — debounced live search
  document.getElementById('exploreSearch')?.addEventListener('input', debounce(() => {
    _search = document.getElementById('exploreSearch').value;
    saveRecentSearch(_search);
    renderRecentSearches();
    applyAndRender();
  }, 350));

  document.getElementById('exploreLocation')?.addEventListener('input', debounce(() => {
    _locationSearch = document.getElementById('exploreLocation').value;
    applyAndRender();
  }, 300));

  // "Szukaj" button
  document.querySelector('.explore-search-btn')?.addEventListener('click', () => {
    _search         = document.getElementById('exploreSearch')?.value   || '';
    _locationSearch = document.getElementById('exploreLocation')?.value || '';
    saveRecentSearch(_search);
    renderRecentSearches();
    applyAndRender();
  });

  // "Zastosuj filtry" button
  document.querySelector('.filters-apply')?.addEventListener('click', () => {
    collectSidebarFilters();
    applyAndRender();
  });

  // "Wyczyść" button
  document.querySelector('.filters-clear')?.addEventListener('click', () => {
    clearFilters();
    applyAndRender();
  });

  // Sort dropdown
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    _sortMode = e.target.value;
    applyAndRender();
  });

  // View toggle
  document.getElementById('viewList')?.addEventListener('click', () => setView('list'));
  document.getElementById('viewMap')?.addEventListener('click',  () => setView('map'));

  // Favorites — re-render on toggle
  window.toggleFav = async (bizId, e) => {
    e?.stopPropagation();
    const user = window.App?.user;
    if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
    window.App.favorites = await toggleFavorite(user.uid, bizId, window.App.favorites);
    applyAndRender();
  };
}

function collectSidebarFilters() {
  // Categories — multi-select checkboxes
  _categories = [...document.querySelectorAll('#filterCat input[type=checkbox]:checked')]
    .map(cb => cb.value);

  // Price
  const pMin = document.getElementById('priceMin')?.value;
  const pMax = document.getElementById('priceMax')?.value;
  _minPrice = pMin ? parseFloat(pMin) : null;
  _maxPrice = pMax ? parseFloat(pMax) : null;

  // Rating — take highest checked value (strictest filter)
  const checkedRatings = [...document.querySelectorAll('#filterRating input[type=checkbox]:checked')]
    .map(cb => parseFloat(cb.value));
  _minRating = checkedRatings.length ? Math.max(...checkedRatings) : null;

  // Availability
  _filterOpenNow   = document.getElementById('openNow')?.checked   || false;
  _filterOpenToday = document.getElementById('openToday')?.checked || false;
}

function clearFilters() {
  _categories = []; _minPrice = null; _maxPrice = null;
  _minRating = null; _filterOpenNow = false; _filterOpenToday = false;
  _search = ''; _locationSearch = '';

  document.querySelectorAll('.filter-checkbox input[type=checkbox]').forEach(cb => cb.checked = false);
  document.getElementById('priceMin') && (document.getElementById('priceMin').value = '');
  document.getElementById('priceMax') && (document.getElementById('priceMax').value = '');
  document.getElementById('exploreSearch')  && (document.getElementById('exploreSearch').value  = '');
  document.getElementById('exploreLocation') && (document.getElementById('exploreLocation').value = '');
}

// ─── GEOLOCATION ──────────────────────────────────────────────────────────────
async function requestLocation() {
  const loc = await getUserLocation();
  if (!loc) return;
  _userLoc  = loc;
  _sortMode = 'distance';
  const sel = document.getElementById('sortSelect');
  if (sel) sel.value = 'distance';
  showGeoBanner();
  applyAndRender();
}

function showGeoBanner() {
  const toolbar = document.querySelector('.explore-toolbar');
  if (!toolbar || document.getElementById('geoBanner')) return;
  const div = document.createElement('div');
  div.id = 'geoBanner';
  div.className = 'geo-banner';
  div.innerHTML = `<span class="material-icons" style="font-size:1rem;color:var(--accent)">my_location</span>
    Sortowanie według odległości od Twojej lokalizacji`;
  toolbar.insertAdjacentElement('afterend', div);
}

// ─── OPEN NOW HELPERS ─────────────────────────────────────────────────────────
function todayBizIndex() {
  // Biz hours: 0=Pon, 1=Wt, ..., 6=Nd. JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat.
  return (new Date().getDay() + 6) % 7;
}

function isOpenNow(biz) {
  const h = biz.hours?.[todayBizIndex()];
  if (!h || h.closed) return false;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const [oh, om] = (h.open  || '00:00').split(':').map(Number);
  const [ch, cm] = (h.close || '00:00').split(':').map(Number);
  return now >= oh * 60 + om && now < ch * 60 + cm;
}

function isOpenToday(biz) {
  const h = biz.hours?.[todayBizIndex()];
  return !!(h && !h.closed);
}

// ─── FILTER + SORT + RENDER ───────────────────────────────────────────────────
function applyAndRender() {
  let list = [..._all];

  // Text search (name, city, category)
  if (_search) {
    const q = _search.toLowerCase();
    list = list.filter(b =>
      (b.name     || '').toLowerCase().includes(q) ||
      (b.city     || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q)
    );
  }

  // Location text search
  if (_locationSearch) {
    const q = _locationSearch.toLowerCase();
    list = list.filter(b =>
      (b.city    || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q)
    );
  }

  // Category filter (any of selected)
  if (_categories.length) {
    list = list.filter(b => _categories.includes(b.category || ''));
  }

  // Price filter (against minPrice field on biz doc — set if available)
  if (_minPrice !== null) list = list.filter(b => (b.minPrice ?? 0) >= _minPrice);
  if (_maxPrice !== null) list = list.filter(b => (b.minPrice ?? Infinity) <= _maxPrice);

  // Rating filter
  if (_minRating !== null) list = list.filter(b => (b.rating || 0) >= _minRating);

  // Open now / today
  if (_filterOpenNow)   list = list.filter(b => isOpenNow(b));
  if (_filterOpenToday) list = list.filter(b => isOpenToday(b));

  // Sort
  switch (_sortMode) {
    case 'distance':
      list = _userLoc ? sortByDistance(list, _userLoc.lat, _userLoc.lng) : list;
      break;
    case 'rating':
      list = list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'price_low':
      list = list.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
      break;
    case 'price_high':
      list = list.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      break;
    default:
      if (_userLoc) list = sortByDistance(list, _userLoc.lat, _userLoc.lng);
  }

  // Update count
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = list.length;

  renderGrid(list);
  if (_currentView === 'map' && typeof L !== 'undefined') addMarkers(list);
}

// ─── CARD TEMPLATE ────────────────────────────────────────────────────────────
function renderGrid(list) {
  const grid = document.getElementById('exploreGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--zinc-400)">
      <span class="material-icons" style="font-size:3rem;display:block;margin-bottom:1rem">search_off</span>
      <strong>Nic nie znaleźliśmy</strong><br>Spróbuj zmienić filtry lub wyszukiwaną frazę.
    </div>`;
    return;
  }

  const favIds = (window.App?.favorites || []).map(f => f.bizId);

  grid.innerHTML = list.map(b => {
    const dist = (b._distance != null && b._distance !== Infinity)
      ? `<span class="explore-distance"><span class="material-icons" style="font-size:.875rem;vertical-align:middle">near_me</span> ${formatDistance(b._distance)}</span>`
      : '';
    const openTag = isOpenNow(b)
      ? `<span class="tag" style="background:#dcfce7;color:#15803d">Otwarte</span>` : '';
    const fav = favIds.includes(b.id);

    const reviewCount = b.reviewCount ? `<span style="color:var(--zinc-400);font-size:.8rem">(${b.reviewCount})</span>` : '';
    const desc = b.description ? `<p class="explore-salon-desc">${esc(truncate(b.description, 80))}</p>` : '';

    return `<div class="explore-salon-card" data-biz-id="${b.id}" role="article"
        onclick="if(!event.target.closest('.explore-fav-btn,.explore-book-btn')){trackRecentlyViewed_${b.id}();window.location.href='?page=business&id=${b.id}'}"
        style="cursor:pointer">
      <div class="explore-salon-img">
        <img src="${b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'}"
          alt="${esc(b.name)}" loading="lazy">
        <button class="explore-fav-btn" onclick="window.toggleFav('${b.id}',event)" title="${fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}" aria-pressed="${fav}">
          <span class="material-icons" style="color:${fav ? '#ef4444' : '#94a3b8'}">${fav ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
      <div class="explore-salon-body">
        <div class="explore-salon-cat">${esc(b.category || '')}</div>
        <h3 class="explore-salon-name">${esc(b.name)}</h3>
        <div class="explore-salon-meta">
          <span class="explore-rating">
            <span class="material-icons">star</span> ${b.rating || '—'} ${reviewCount}
          </span>
          ${dist}
        </div>
        ${desc}
        <div class="explore-salon-address">${esc(b.address || '')}, ${esc(b.city || '')}</div>
        ${b.minPrice ? `<div class="explore-salon-price">od ${b.minPrice} zł</div>` : ''}
        <div class="explore-salon-tags">${openTag}</div>
        <button class="explore-book-btn"
          onclick="trackRecentlyViewed_${b.id}();window.location.href='?page=business&id=${b.id}'">
          Umów wizytę
        </button>
      </div>
    </div>`;
  }).join('');

  // Expose per-card tracked view helpers via closure-safe global
  list.forEach(b => {
    window[`trackRecentlyViewed_${b.id}`] = () => trackRecentlyViewed(b);
  });
}

// ─── VIEW SWITCH ──────────────────────────────────────────────────────────────
function setView(mode) {
  _currentView = mode;
  document.getElementById('viewList')?.classList.toggle('active', mode === 'list');
  document.getElementById('viewMap')?.classList.toggle('active',  mode === 'map');
  document.getElementById('listView')?.classList.toggle('hidden', mode !== 'list');
  document.getElementById('mapView')?.classList.toggle('hidden',  mode !== 'map');

  if (mode === 'map') {
    setTimeout(() => {
      let filtered = [..._all];
      if (_search) {
        const q = _search.toLowerCase();
        filtered = filtered.filter(b =>
          (b.name || '').toLowerCase().includes(q) || (b.city || '').toLowerCase().includes(q));
      }
      if (_categories.length) filtered = filtered.filter(b => _categories.includes(b.category || ''));
      initMap('mapView', filtered);
    }, 50);
  } else {
    destroyMap();
  }
}

const esc = escHtml;
