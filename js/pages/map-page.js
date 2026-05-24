import { loadBusinesses } from '../modules/businesses.js';
import { clusterMarkers, filterVisible, getMap } from '../modules/map-cluster.js';
import { readFiltersFromDOM, applyFilters, buildFilterQuery } from '../modules/advanced-search.js';
import { escHtml } from '../modules/utils.js';

let _businesses = [];
let _heatLayer  = null;
let _heatOn     = false;

export async function initMap() {
  _businesses = await loadBusinesses();
  clusterMarkers(_businesses);
  renderSidebarList(_businesses);

  document.getElementById('mapApplyFilters')?.addEventListener('click', applyMapFilters);
  document.getElementById('mapClearFilters')?.addEventListener('click', () => {
    document.querySelectorAll('.map-filters input, .map-filters select').forEach(i => {
      if (i.type === 'checkbox') i.checked = false; else i.value = '';
    });
    applyMapFilters();
  });
  document.getElementById('mapHeatToggle')?.addEventListener('click', toggleHeatmap);
}

function toggleHeatmap() {
  const btn = document.getElementById('mapHeatToggle');
  const map = getMap();
  if (!map || !window.L?.heatLayer) return;

  _heatOn = !_heatOn;
  if (btn) btn.setAttribute('aria-pressed', _heatOn);
  if (btn) btn.classList.toggle('btn-accent', _heatOn);
  if (btn) btn.classList.toggle('btn-ghost', !_heatOn);

  if (_heatOn) {
    const points = _businesses
      .filter(b => b.lat && b.lng)
      .map(b => [b.lat, b.lng, 0.6]);
    _heatLayer = L.heatLayer(points, { radius: 35, blur: 25, maxZoom: 15, gradient: { 0.2: '#6366f1', 0.5: '#f43f5e', 1: '#f97316' } });
    _heatLayer.addTo(map);
  } else {
    _heatLayer?.remove();
    _heatLayer = null;
  }
}

function applyMapFilters() {
  const filters = {
    city: document.getElementById('filterCity')?.value?.toLowerCase(),
    category: document.getElementById('filterCategory')?.value,
    minRating: document.getElementById('filterMinRating')?.value,
    maxDistance: document.getElementById('filterMaxDistance')?.value,
    availableToday: document.getElementById('filterAvailableToday')?.checked,
  };
  const filtered = applyFilters(_businesses, buildFilterQuery(filters));
  clusterMarkers(filtered);
  filterVisible({ category: filters.category });
  renderSidebarList(filtered);
}

const CAT_COLOR = {
  'Barber':       '#3b82f6',
  'Fryzjer':      '#8b5cf6',
  'Paznokcie':    '#ec4899',
  'Kosmetyczka':  '#f43f5e',
  'Masaż':        '#14b8a6',
  'Brwi i Rzęsy': '#f59e0b',
  'Fizjoterapia': '#22c55e',
  'Tatuaż':       '#475569',
};

function renderSidebarList(biz) {
  const el = document.getElementById('mapSidebarList');
  if (!el) return;

  if (!biz.length) {
    el.innerHTML = `<div class="map-sidebar-empty">
      <span class="material-icons">search_off</span>
      Brak salonów w tym obszarze
    </div>`;
    return;
  }

  el.innerHTML = biz.slice(0, 25).map(b => {
    const color = CAT_COLOR[b.category] || '#a1a1aa';
    return `
      <a href="?page=business&id=${escHtml(b.id)}" class="map-sidebar-item">
        <span class="map-sidebar-dot" style="background:${color}"></span>
        <div class="map-sidebar-item-body">
          <strong class="map-sidebar-item-name">${escHtml(b.name)}</strong>
          <div class="map-sidebar-item-meta">
            <span class="map-sidebar-cat" style="color:${color}">${escHtml(b.category)}</span>
            ${b.city ? `<span class="map-sidebar-city">· ${escHtml(b.city)}</span>` : ''}
          </div>
        </div>
        <span class="material-icons map-sidebar-arrow">chevron_right</span>
      </a>`;
  }).join('');
}
