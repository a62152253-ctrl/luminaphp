<?php
$mapCategories = ['Barber','Fryzjer','Paznokcie','Kosmetyczka','Masaż','Brwi i Rzęsy','Fizjoterapia','Tatuaż'];
?>
<div class="map-page">
  <aside class="map-sidebar" aria-label="Filtry mapy salonów">
    <h2>Salony na mapie</h2>
    <div class="map-filters" role="search" aria-label="Filtruj salony">

      <label for="filterCity">Miasto</label>
      <input type="text" id="filterCity" class="auth-input" placeholder="np. Warszawa"
        autocomplete="address-level2" aria-label="Filtruj po mieście">

      <label for="filterCategory">Kategoria</label>
      <select id="filterCategory" class="auth-input" aria-label="Filtruj po kategorii">
        <option value="">Wszystkie kategorie</option>
        <?php foreach ($mapCategories as $c): ?>
        <option value="<?= htmlspecialchars($c, ENT_QUOTES, 'UTF-8') ?>">
          <?= htmlspecialchars($c, ENT_QUOTES, 'UTF-8') ?>
        </option>
        <?php endforeach; ?>
      </select>

      <label for="filterMaxDistance">
        Odległość max (km)
        <input type="range" id="filterMaxDistance" min="1" max="50" value="20"
          aria-valuemin="1" aria-valuemax="50" aria-valuenow="20" aria-valuetext="20 km">
      </label>

      <label for="filterMinRating">
        Min. ocena
        <input type="number" id="filterMinRating" min="1" max="5" step="0.5"
          placeholder="4.0" aria-label="Minimalna ocena od 1 do 5">
      </label>

      <label class="filter-checkbox">
        <input type="checkbox" id="filterAvailableToday" aria-label="Pokaż tylko salony dostępne dziś">
        Dostępne dziś
      </label>

      <button id="mapApplyFilters" class="btn btn-accent btn-block">
        <span class="material-icons" aria-hidden="true">filter_list</span> Filtruj
      </button>
      <button id="mapClearFilters" class="btn btn-ghost btn-block">Wyczyść filtry</button>
      <button id="mapHeatToggle" class="btn btn-ghost btn-block" style="margin-top:.5rem" aria-pressed="false">
        <span class="material-icons" aria-hidden="true">whatshot</span> Mapa gęstości
      </button>
    </div>

    <div id="mapSidebarList" class="map-sidebar-list" aria-live="polite" aria-label="Lista salonów"></div>
  </aside>

  <div id="mapContainer" class="map-container"
    role="application" aria-label="Interaktywna mapa salonów beauty"></div>
</div>

<!-- Leaflet CSS loaded by index.php for map/explore/business pages — only load MarkerCluster here -->
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
  crossorigin="anonymous">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
  crossorigin="anonymous">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLs=" crossorigin="anonymous"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
  crossorigin="anonymous"></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"
  crossorigin="anonymous"></script>
