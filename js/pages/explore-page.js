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
let _compareList     = [];   // up to 3 biz ids being compared

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
  bindCategoryChips(initialCat);
  requestLocation();
  applyAndRender();
  renderRecentSearches();
}

function bindCategoryChips(initialCat = '') {
  const chips = document.querySelectorAll('.market-cat-chip');
  if (!chips.length) return;

  const sync = (cat) => {
    chips.forEach(c => c.classList.toggle('active', (c.dataset.cat || '') === (cat || '')));
    document.querySelectorAll('#filterCat input[type=checkbox]').forEach(cb => {
      cb.checked = cat ? cb.value === cat : false;
    });
  };

  if (initialCat) sync(initialCat);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat || '';
      _categories = cat ? [cat] : [];
      sync(cat);
      applyAndRender();
    });
  });
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
  window._clearExploreFilters = () => {
    clearFilters();
    applyAndRender();
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

  // Compare
  document.getElementById('compareBtn')?.addEventListener('click', openCompareModal);
  document.getElementById('compareOpenBtn')?.addEventListener('click', openCompareModal);
  document.getElementById('compareClearBtn')?.addEventListener('click', clearCompare);

  // Beauty SOS
  document.getElementById('beautySosBtn')?.addEventListener('click', openSOSModal);

  window.toggleCompare = (bizId, e) => {
    e?.stopPropagation();
    const idx = _compareList.indexOf(bizId);
    if (idx !== -1) {
      _compareList.splice(idx, 1);
    } else {
      if (_compareList.length >= 3) { return; }
      _compareList.push(bizId);
    }
    updateCompareUI();
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
  document.querySelectorAll('.market-cat-chip').forEach(c => {
    c.classList.toggle('active', !(c.dataset.cat || ''));
  });
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
  toolbar.after(div);
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

  list = applySortMode(list);

  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = list.length;

  renderGrid(list);
  if (_currentView === 'map' && typeof L !== 'undefined') addMarkers(list);
}

function applySortMode(list) {
  switch (_sortMode) {
    case 'distance':  return _userLoc ? sortByDistance(list, _userLoc.lat, _userLoc.lng) : list;
    case 'rating':    return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'price_low': return list.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
    case 'price_high':return list.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
    default:          return _userLoc ? sortByDistance(list, _userLoc.lat, _userLoc.lng) : list;
  }
}

// ─── CARD TEMPLATE ────────────────────────────────────────────────────────────
function renderGrid(list) {
  const grid = document.getElementById('exploreGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div class="market-empty">
      <span class="material-icons">search_off</span>
      <strong>Nic nie znaleźliśmy</strong>
      <p>Spróbuj zmienić filtry, kategorię lub wyszukiwaną frazę.</p>
      <button type="button" class="btn btn-primary" onclick="window._clearExploreFilters?.()">
        <span class="material-icons" style="font-size:1rem">refresh</span> Wyczyść filtry
      </button>
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

    const inCompare = _compareList.includes(b.id);
    return `<div class="explore-salon-card${inCompare ? ' explore-card-comparing' : ''}" data-biz-id="${b.id}" role="article"
        onclick="if(!event.target.closest('.explore-fav-btn,.explore-book-btn,.explore-compare-btn')){trackRecentlyViewed_${b.id}();window.location.href='?page=business&id=${b.id}'}"
        style="cursor:pointer">
      <div class="explore-salon-img">
        <img src="${b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'}"
          alt="${esc(b.name)}" loading="lazy">
        <button class="explore-fav-btn" onclick="window.toggleFav('${b.id}',event)" title="${fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}" aria-pressed="${fav}">
          <span class="material-icons" style="color:${fav ? '#ef4444' : '#94a3b8'}">${fav ? 'favorite' : 'favorite_border'}</span>
        </button>
        <button class="explore-compare-btn${inCompare ? ' active' : ''}"
          onclick="window.toggleCompare('${b.id}',event)"
          title="${inCompare ? 'Usuń z porównania' : 'Dodaj do porównania'}"
          aria-pressed="${inCompare}">
          <span class="material-icons">compare</span>
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
      initMap('mapContainer', filtered);
    }, 50);
  } else {
    destroyMap();
  }
}

// ─── BEAUTY SOS ───────────────────────────────────────────────────────────────

async function openSOSModal() {
  const btn = document.getElementById('beautySosBtn');
  if (btn) btn.classList.add('sos-loading');

  if (!_userLoc) {
    const loc = await getUserLocation();
    if (loc) { _userLoc = loc; }
  }

  let results = _all.filter(b => isOpenNow(b));

  if (_userLoc) {
    results = sortByDistance(results, _userLoc.lat, _userLoc.lng)
      .filter(b => b._distance !== Infinity && b._distance <= 15);
  }

  if (btn) btn.classList.remove('sos-loading');

  renderSOSModal(results);
}

function renderSOSModal(list) {
  const modal = document.getElementById('sosModal');
  if (!modal) return;

  const distNote = _userLoc ? ' w promieniu 15 km' : '';

  modal.innerHTML = `
    <div class="sos-modal-inner" onclick="event.stopPropagation()">
      <div class="sos-modal-head">
        <div class="sos-modal-title-row">
          <span class="sos-live-dot" aria-hidden="true"></span>
          <h2 id="sosModalTitle">Beauty SOS</h2>
        </div>
        <p class="sos-modal-sub">
          ${list.length
            ? `Znaleziono <strong>${list.length}</strong> salonów otwartych teraz${distNote}`
            : `Brak otwartych salonów${distNote}`}
        </p>
        <button class="sos-modal-close"
          onclick="document.getElementById('sosModal').classList.add('hidden')"
          aria-label="Zamknij">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="sos-modal-list">
        ${list.length ? list.map(b => {
          const dist = (b._distance != null && b._distance !== Infinity)
            ? `<span class="sos-card-dist"><span class="material-icons">near_me</span>${formatDistance(b._distance)}</span>`
            : '';
          const rating = b.rating
            ? `<span class="sos-card-rating"><span class="material-icons">star</span>${b.rating}</span>`
            : '';
          return `<div class="sos-salon-card"
              onclick="window.location.href='?page=business&id=${b.id}'"
              role="button" tabindex="0"
              onkeydown="if(event.key==='Enter')window.location.href='?page=business&id=${b.id}'">
            <img class="sos-card-img"
              src="${esc(b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=120')}"
              alt="${esc(b.name)}" loading="lazy">
            <div class="sos-card-info">
              <div class="sos-card-cat">${esc(b.category || '')}</div>
              <div class="sos-card-name">${esc(b.name)}</div>
              <div class="sos-card-meta">${esc(b.city || '')} ${dist} ${rating}</div>
            </div>
            <button class="sos-book-btn"
              onclick="event.stopPropagation();window.location.href='?page=business&id=${b.id}'"
              aria-label="Zarezerwuj w ${esc(b.name)}">
              Zarezerwuj
              <span class="material-icons">chevron_right</span>
            </button>
          </div>`;
        }).join('') : `<div class="sos-empty">
          <span class="material-icons">sentiment_dissatisfied</span>
          <p>Żaden salon nie jest teraz otwarty w pobliżu.</p>
          <p class="sos-empty-sub">Spróbuj ponownie później lub przeglądaj wszystkie salony.</p>
        </div>`}
      </div>
    </div>`;

  modal.classList.remove('hidden');
}

// ─── COMPARE ─────────────────────────────────────────────────────────────────

function updateCompareUI() {
  const count = _compareList.length;
  const countEl = document.getElementById('compareCount');
  if (countEl) countEl.textContent = count;

  const btn = document.getElementById('compareBtn');
  if (btn) btn.classList.toggle('btn-accent', count >= 2);

  const bar = document.getElementById('compareBar');
  if (bar) bar.classList.toggle('hidden', count === 0);

  const slots = document.getElementById('compareBarSlots');
  if (slots) {
    slots.innerHTML = _compareList.map(id => {
      const b = _all.find(x => x.id === id);
      return b ? `<div class="compare-bar-slot">
        <img src="${esc(b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=60')}" alt="${esc(b.name)}">
        <span>${esc(b.name)}</span>
        <button onclick="window.toggleCompare('${b.id}',event)">
          <span class="material-icons">close</span>
        </button>
      </div>` : '';
    }).join('');
  }
}

function clearCompare() {
  _compareList = [];
  updateCompareUI();
  applyAndRender();
}

function openCompareModal() {
  if (_compareList.length < 2) return;

  const salons = _compareList.map(id => _all.find(b => b.id === id)).filter(Boolean);
  const body   = document.getElementById('compareModalBody');
  if (!body) return;

  const rows = [
    { label: 'Zdjęcie',    render: b => `<img src="${esc(b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200')}" alt="${esc(b.name)}" class="compare-row-img">` },
    { label: 'Nazwa',      render: b => `<strong>${esc(b.name)}</strong>` },
    { label: 'Kategoria',  render: b => esc(b.category || '—') },
    { label: 'Ocena',      render: b => b.rating ? `<span class="material-icons" style="color:#f59e0b;font-size:1rem;vertical-align:middle">star</span> ${b.rating}${b.reviewCount ? ` (${b.reviewCount})` : ''}` : '—' },
    { label: 'Adres',      render: b => esc((b.address ? b.address + ', ' : '') + (b.city || '')) || '—' },
    { label: 'Cena od',    render: b => b.minPrice ? `${b.minPrice} zł` : '—' },
    { label: 'Otwarte',    render: b => isOpenNow(b) ? '<span style="color:#16a34a;font-weight:600">Teraz</span>' : '<span style="color:#71717a">Zamknięte</span>' },
  ];

  body.innerHTML = `
    <div class="compare-table" style="grid-template-columns:9rem repeat(${salons.length},1fr)">
      ${rows.map(row => `
        <div class="compare-row-label">${esc(row.label)}</div>
        ${salons.map(b => `<div class="compare-row-cell">${row.render(b)}</div>`).join('')}
      `).join('')}
      <div class="compare-row-label">Rezerwacja</div>
      ${salons.map(b => `<div class="compare-row-cell">
        <a href="/luminaphp/?page=business&id=${esc(b.id)}" class="btn btn-accent btn-sm">Umów wizytę</a>
      </div>`).join('')}
    </div>`;

  document.getElementById('compareModal')?.classList.remove('hidden');
}

const esc = escHtml;
