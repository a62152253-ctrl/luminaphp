<?php /* Widok mapy */ ?>
<div class="map-page">
  <aside class="map-sidebar">
    <h2>Salony na mapie</h2>
    <div class="map-filters">
      <input type="text" id="filterCity" class="auth-input" placeholder="Miasto">
      <select id="filterCategory" class="auth-input">
        <option value="">Wszystkie kategorie</option>
        <?php foreach (['Barber','Fryzjer','Paznokcie','Kosmetyczka','Masaż'] as $c): ?>
        <option value="<?= $c ?>"><?= $c ?></option>
        <?php endforeach; ?>
      </select>
      <label>Odległość max (km)
        <input type="range" id="filterMaxDistance" min="1" max="50" value="20">
      </label>
      <label>Min. ocena
        <input type="number" id="filterMinRating" min="1" max="5" step="0.5" placeholder="4">
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" id="filterAvailableToday"> Dostępne dziś
      </label>
      <button id="mapApplyFilters" class="btn btn-accent btn-block">Filtruj</button>
      <button id="mapClearFilters" class="btn btn-ghost btn-block">Wyczyść</button>
    </div>
    <div id="mapSidebarList" class="map-sidebar-list"></div>
  </aside>
  <div id="mapContainer" class="map-container"></div>
</div>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
