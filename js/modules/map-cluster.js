import { escHtml } from './utils.js';

let _map = null;
let _markers = [];
let _clusterGroup = null;

export function initMapCluster(mapId, businesses, options = {}) {
  if (!window.L) return null;
  const el = document.getElementById(mapId);
  if (!el) return null;

  if (_map) { _map.remove(); _map = null; }
  _map = L.map(mapId).setView(options.center || [52.23, 21.01], options.zoom || 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(_map);

  _markers = businesses.filter(b => b.lat && b.lng).map(b => {
    const marker = L.marker([b.lat, b.lng]);
    marker.bindPopup(renderInfoWindow(b));
    marker._bizData = b;
    return marker;
  });

  if (window.L.markerClusterGroup) {
    _clusterGroup = L.markerClusterGroup();
    _markers.forEach(m => _clusterGroup.addLayer(m));
    _map.addLayer(_clusterGroup);
  } else {
    _markers.forEach(m => m.addTo(_map));
  }

  if (_markers.length) fitBounds();
  return _map;
}

export function clusterMarkers(businesses) {
  return initMapCluster('mapContainer', businesses);
}

export function fitBounds() {
  if (!_map || !_markers.length) return;
  const group = L.featureGroup(_markers);
  _map.fitBounds(group.getBounds().pad(0.1));
}

export function renderInfoWindow(biz) {
  return `<div class="map-popup">
    <strong>${escHtml(biz.name)}</strong>
    <p>${escHtml(biz.category)} · ${escHtml(biz.city || '')}</p>
    <a href="?page=business&id=${escHtml(biz.id)}" class="btn btn-accent btn-sm">Zobacz</a>
  </div>`;
}

export function filterVisible(filters) {
  if (!_clusterGroup && !_markers.length) return;
  _markers.forEach(m => {
    const b = m._bizData;
    const show = !filters.category || b.category === filters.category;
    if (_clusterGroup) {
      if (show) _clusterGroup.addLayer(m);
      else _clusterGroup.removeLayer(m);
    } else {
      if (show && !_map.hasLayer(m)) m.addTo(_map);
      if (!show && _map.hasLayer(m)) _map.removeLayer(m);
    }
  });
}

export function getMap() { return _map; }
