<?php /* Explore Page - Booksy Style */ ?>

<!-- BOOKSY STYLE EXPLORE HEADER -->
<div class="explore-booksy-header">
  <div class="container">
    <h1>Eksploruj salony</h1>
    <p>Znajdź najlepsze salony w Twojej okolicy</p>
    
    <!-- Booksy Search Bar -->
    <div class="explore-booksy-search">
      <div class="explore-search-field">
        <span class="material-icons">search</span>
        <input type="text" placeholder="Szukaj salonu, usługi..." id="exploreSearch">
      </div>
      <div class="explore-search-field">
        <span class="material-icons">location_on</span>
        <input type="text" placeholder="Miasto lub adres" id="exploreLocation">
      </div>
      <button class="explore-search-btn">Szukaj</button>
    </div>
  </div>
</div>

<!-- BOOKSY STYLE EXPLORE BODY -->
<div class="explore-booksy-body">
  <div class="container">
    <div class="explore-booksy-layout">
      
      <!-- Sidebar Filters -->
      <aside class="explore-filters-sidebar">
        <div class="filters-header">
          <h3>Filtry</h3>
          <button class="filters-clear">Wyczyść</button>
        </div>
        
        <!-- Category Filter -->
        <div class="filter-section" id="filterCat">
          <h4>Kategoria</h4>
          <div class="filter-options">
            <?php
            $cats = ['Barber','Paznokcie','Fryzjer','Masaż','Kosmetyczka','Brwi i Rzęsy','Fizjoterapia','Tatuaż'];
            $activeCat = $_GET['cat'] ?? '';
            foreach ($cats as $cat): ?>
            <label class="filter-checkbox">
              <input type="checkbox" value="<?= htmlspecialchars($cat) ?>" <?= $cat===$activeCat?'checked':'' ?>>
              <span><?= htmlspecialchars($cat) ?></span>
            </label>
            <?php endforeach; ?>
          </div>
        </div>
        
        <!-- Price Filter -->
        <div class="filter-section">
          <h4>Cena</h4>
          <div class="price-range">
            <input type="number" placeholder="Min" class="price-input" id="priceMin" min="0" autocomplete="off">
            <span>-</span>
            <input type="number" placeholder="Max" class="price-input" id="priceMax" min="0" autocomplete="off">
          </div>
        </div>
        
        <!-- Rating Filter -->
        <div class="filter-section" id="filterRating">
          <h4>Ocena</h4>
          <div class="filter-options">
            <label class="filter-checkbox">
              <input type="checkbox" value="4.5">
              <span>4.5+ ⭐</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" value="4.0">
              <span>4.0+ ⭐</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" value="3.5">
              <span>3.5+ ⭐</span>
            </label>
          </div>
        </div>
        
        <!-- Open Now Filter -->
        <div class="filter-section">
          <h4>Dostępność</h4>
          <div class="filter-options">
            <label class="filter-checkbox">
              <input type="checkbox" id="openNow">
              <span>Otwarte teraz</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" id="openToday">
              <span>Otwarte dzisiaj</span>
            </label>
          </div>
        </div>
        
        <button class="filters-apply">Zastosuj filtry</button>
      </aside>
      
      <!-- Main Content -->
      <main class="explore-booksy-main">
        <!-- View Toggle & Sort -->
        <div class="explore-toolbar">
          <div class="view-toggle-booksy">
            <button id="viewList" class="view-btn-booksy active">
              <span class="material-icons">list</span>
            </button>
            <button id="viewMap" class="view-btn-booksy">
              <span class="material-icons">map</span>
            </button>
          </div>
          
          <div class="sort-dropdown">
            <select id="sortSelect" class="sort-select">
              <option value="recommended">Polecane</option>
              <option value="rating">Najlepiej oceniane</option>
              <option value="distance">Najbliżej</option>
              <option value="price_low">Cena: rosnąco</option>
              <option value="price_high">Cena: malejąco</option>
            </select>
          </div>
          
          <div class="results-count">
            <span id="resultsCount">0</span> wyników
          </div>
        </div>
        
        <!-- List View -->
        <div id="listView" class="explore-list-view">
          <div id="exploreGrid" class="explore-booksy-grid">
            <div class="spinner" style="margin:4rem auto;grid-column:1/-1"></div>
          </div>
        </div>
        
        <!-- Map View -->
        <div id="mapView" class="explore-map-view hidden">
          <div id="mapContainer" class="map-container-booksy"></div>
        </div>
      </main>
    </div>
  </div>
</div>
