// Leaflet map integration — Leaflet must be loaded via CDN before this module runs
let _map = null;
let _markers = [];

export function initMap(containerId, businesses) {
  const el = document.getElementById(containerId);
  if (!el || typeof L === 'undefined') return;

  if (_map) { _map.remove(); _map = null; _markers = []; }

  _map = L.map(containerId, { zoomControl: true, scrollWheelZoom: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(_map);

  addMarkers(businesses);

  if (businesses.length) {
    const bounds = L.latLngBounds(businesses.map(b => [b.lat || 52.23, b.lng || 21.01]));
    _map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  } else {
    _map.setView([52.23, 19.0], 6);
  }
}

export function addMarkers(businesses) {
  if (!_map) return;
  _markers.forEach(m => m.remove());
  _markers = [];

  const icon = L.divIcon({
    className: '',
    html: `<div class="map-marker"><span class="material-icons">location_on</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  businesses.forEach(b => {
    if (!b.lat || !b.lng) return;
    const marker = L.marker([b.lat, b.lng], { icon }).addTo(_map);
    marker.bindPopup(`
      <div class="map-popup">
        <img src="${b.photoURL}" alt="${b.name}" class="map-popup-img">
        <div class="map-popup-body">
          <span class="map-popup-cat">${b.category}</span>
          <strong class="map-popup-name">${b.name}</strong>
          <span class="map-popup-addr">${b.address}, ${b.city}</span>
          <div class="map-popup-footer">
            <span style="font-size:.625rem;font-weight:900;display:flex;align-items:center;gap:.25rem">
              <span class="material-icons" style="font-size:.875rem;color:#fbbf24">star</span>${b.rating}
            </span>
            <a href="?page=business&id=${b.id}" class="map-popup-btn">Zarezerwuj</a>
          </div>
        </div>
      </div>
    `, { maxWidth: 260 });
    _markers.push(marker);
  });
}

export function destroyMap() {
  if (_map) { _map.remove(); _map = null; _markers = []; }
}
