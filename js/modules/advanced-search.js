import { escHtml } from './utils.js';

const STORAGE_KEY = 'lumina_saved_searches';

export function buildFilterQuery(filters = {}) {
  const q = {};
  if (filters.category) q.category = filters.category;
  if (filters.city) q.city = filters.city.toLowerCase();
  if (filters.minPrice != null) q.minPrice = Number(filters.minPrice);
  if (filters.maxPrice != null) q.maxPrice = Number(filters.maxPrice);
  if (filters.minRating != null) q.minRating = Number(filters.minRating);
  if (filters.service) q.service = filters.service.toLowerCase();
  if (filters.maxDistance != null) q.maxDistance = Number(filters.maxDistance);
  if (filters.availableToday) q.availableToday = true;
  return q;
}

export function applyFilters(businesses, filters, userCoords = null) {
  let result = [...businesses];

  if (filters.category) {
    result = result.filter(b => b.category === filters.category);
  }
  if (filters.city) {
    result = result.filter(b => (b.city || '').toLowerCase().includes(filters.city));
  }
  if (filters.minRating != null) {
    result = result.filter(b => (parseFloat(b.rating) || 0) >= filters.minRating);
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    result = result.filter(b => {
      const price = b.minPrice ?? b.priceFrom ?? 0;
      if (filters.minPrice != null && price < filters.minPrice) return false;
      if (filters.maxPrice != null && price > filters.maxPrice) return false;
      return true;
    });
  }
  if (filters.service) {
    result = result.filter(b =>
      (b.services || []).some(s => s.name?.toLowerCase().includes(filters.service))
    );
  }
  if (filters.maxDistance != null && userCoords && window.App?.userLocation) {
    result = result.filter(b => {
      if (!b.lat || !b.lng) return true;
      const d = haversine(userCoords, { lat: b.lat, lng: b.lng });
      return d <= filters.maxDistance;
    });
    result.sort((a, b) => {
      const da = haversine(userCoords, { lat: a.lat, lng: a.lng });
      const db = haversine(userCoords, { lat: b.lat, lng: b.lng });
      return da - db;
    });
  }
  if (filters.availableToday) {
    result = result.filter(b => b.openToday !== false);
  }

  return result;
}

function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function saveSearch(name, filters) {
  const saved = loadSavedSearches();
  saved.unshift({ name, filters, savedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 10)));
}

export function loadSavedSearches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function clearAll(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.querySelectorAll('input, select').forEach(i => {
    if (i.type === 'checkbox') i.checked = false;
    else i.value = '';
  });
}

export function readFiltersFromDOM(prefix = 'filter') {
  const get = id => document.getElementById(`${prefix}${id}`)?.value;
  const getCheck = id => document.getElementById(`${prefix}${id}`)?.checked;
  return buildFilterQuery({
    category: get('Category'),
    city: get('City'),
    minPrice: get('MinPrice'),
    maxPrice: get('MaxPrice'),
    minRating: get('MinRating'),
    service: get('Service'),
    maxDistance: get('MaxDistance'),
    availableToday: getCheck('AvailableToday'),
  });
}

export function renderFilterChips(filters, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const chips = Object.entries(filters)
    .filter(([, v]) => v != null && v !== '' && v !== false)
    .map(([k, v]) => `<span class="filter-chip">${escHtml(k)}: ${escHtml(String(v))}</span>`);
  el.innerHTML = chips.join('');
}
