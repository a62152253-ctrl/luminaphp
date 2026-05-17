import { loadBusinesses } from '../modules/businesses.js';
import { clusterMarkers, filterVisible } from '../modules/map-cluster.js';
import { readFiltersFromDOM, applyFilters, buildFilterQuery } from '../modules/advanced-search.js';
import { escHtml } from '../modules/utils.js';

let _businesses = [];

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

function renderSidebarList(biz) {
  const el = document.getElementById('mapSidebarList');
  if (!el) return;
  el.innerHTML = biz.slice(0, 20).map(b => `
    <a href="?page=business&id=${escHtml(b.id)}" class="map-sidebar-item">
      <strong>${escHtml(b.name)}</strong>
      <span>${escHtml(b.category)} · ${escHtml(b.city || '')}</span>
    </a>`).join('');
}
