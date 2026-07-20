<?php
// $activeCat injected by index.php — provide fallback for IDE / direct include
$activeCat ??= '';
$exploreCats = ['Barber','Paznokcie','Fryzjer','Masaż','Kosmetyczka','Brwi i Rzęsy','Fizjoterapia','Tatuaż'];
?>

<!-- EXPLORE HEADER -->
<div class="explore-booksy-header">
  <div class="container">
    <header class="lumina-page-head">
      <h1>Eksploruj salony</h1>
      <p>Znajdź najlepsze salony w Twojej okolicy</p>
    </header>

    <div class="explore-booksy-search" role="search" aria-label="Wyszukaj salon">
      <div class="explore-search-field">
        <span class="material-icons" aria-hidden="true">search</span>
        <label for="exploreSearch" class="sr-only">Szukaj salonu lub usługi</label>
        <input type="search" id="exploreSearch"
          placeholder="Szukaj salonu, usługi..." autocomplete="off"
          aria-label="Szukaj salonu lub usługi">
      </div>
      <div class="explore-search-field">
        <span class="material-icons" aria-hidden="true">location_on</span>
        <label for="exploreLocation" class="sr-only">Miasto lub adres</label>
        <input type="search" id="exploreLocation"
          placeholder="Miasto lub adres"
          autocomplete="address-level2" aria-label="Miasto lub adres">
      </div>
      <button class="explore-search-btn" aria-label="Szukaj">Szukaj</button>
    </div>

    <div class="market-cat-chips" id="marketCatChips" role="group" aria-label="Szybki filtr kategorii">
      <button type="button" class="market-cat-chip active" data-cat="">Wszystkie</button>
      <?php foreach ($exploreCats as $cat):
        $catEsc = htmlspecialchars($cat, ENT_QUOTES | ENT_HTML5, 'UTF-8');
      ?>
      <button type="button" class="market-cat-chip" data-cat="<?= $catEsc ?>"><?= $catEsc ?></button>
      <?php endforeach; ?>
    </div>
    <div class="explore-quick-actions" role="group" aria-label="Szybkie akcje eksploracji" style="margin:1rem 0;display:flex;gap:.75rem;flex-wrap:wrap">
      <button type="button" class="btn btn-ghost btn-sm">Sortuj według oceny</button>
      <button type="button" class="btn btn-ghost btn-sm">Filtrowanie cenowe</button>
      <button type="button" class="btn btn-accent btn-sm">Najbliższe salony</button>
    </div>
 
    <div id="recentSearches" class="market-recent hidden" aria-live="polite"></div>

    <!-- Beauty SOS -->
    <div class="sos-banner-wrap">
      <button id="beautySosBtn" class="sos-btn" aria-label="Beauty SOS – znajdź salon otwarty teraz">
        <span class="sos-pulse-ring" aria-hidden="true"></span>
        <span class="sos-pulse-ring sos-pulse-ring--2" aria-hidden="true"></span>
        <span class="sos-btn-dot" aria-hidden="true"></span>
        <span class="sos-btn-text">
          <strong>Beauty SOS</strong>
          <small>Znajdź wolne miejsce w 2h — teraz</small>
        </span>
        <span class="material-icons sos-btn-arrow" aria-hidden="true">chevron_right</span>
      </button>
    </div>
  </div>
</div>

<!-- Beauty SOS Modal -->
<div id="sosModal" class="sos-modal hidden"
  role="dialog" aria-modal="true" aria-labelledby="sosModalTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
</div>

<!-- EXPLORE BODY -->
<div class="explore-booksy-body">
  <div class="container">
    <div class="explore-booksy-layout">

      <!-- Sidebar Filters -->
      <aside class="explore-filters-sidebar" aria-label="Filtry wyszukiwania">
        <div class="filters-header">
          <h3>Filtry</h3>
          <button class="filters-clear" aria-label="Wyczyść wszystkie filtry">Wyczyść</button>
        </div>

        <!-- Category Filter -->
        <div class="filter-section" id="filterCat">
          <h4 id="catFilterLabel">Kategoria</h4>
          <div class="filter-options" role="group" aria-labelledby="catFilterLabel">
            <?php foreach ($exploreCats as $cat):
              $catEsc = htmlspecialchars($cat, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            ?>
            <label class="filter-checkbox">
              <input type="checkbox" value="<?= $catEsc ?>"
                <?= $cat === $activeCat ? 'checked' : '' ?>>
              <span><?= $catEsc ?></span>
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
            <label class="filter-checkbox">
              <input type="checkbox" id="openWeekend">
              <span>Otwarte w weekend</span>
            </label>
          </div>
        </div>

        <!-- Distance Filter -->
        <div class="filter-section">
          <h4>Odległość</h4>
          <div class="distance-slider-row">
            <input type="range" id="distanceSlider" min="1" max="50" value="10" step="1"
              class="distance-slider" aria-label="Maksymalna odległość">
            <span id="distanceLabel" class="distance-label">10 km</span>
          </div>
          <button id="nearbyBtn" class="btn btn-ghost btn-sm" style="width:100%;margin-top:.4rem">
            <span class="material-icons">my_location</span> Użyj mojej lokalizacji
          </button>
        </div>

        <!-- Amenities Filter -->
        <div class="filter-section">
          <h4>Udogodnienia</h4>
          <div class="filter-options">
            <label class="filter-checkbox">
              <input type="checkbox" id="filterParking">
              <span>Parking</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" id="filterWifi">
              <span>Wi-Fi</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" id="filterCard">
              <span>Płatność kartą</span>
            </label>
          </div>
        </div>

        <div class="filters-action-row">
          <button class="filters-apply">
            <span class="material-icons">filter_list</span> Zastosuj filtry
          </button>
          <button id="saveSearchBtn" class="btn btn-ghost btn-sm">
            <span class="material-icons">bookmark_add</span> Zapisz wyszukiwanie
          </button>
        </div>
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
              <option value="newest">Najnowsze</option>
            </select>
          </div>

          <div class="explore-toolbar-extras">
            <button id="compareBtn" class="btn btn-ghost btn-sm" title="Wybierz 2–3 salony do porównania">
              <span class="material-icons">compare</span>
              <span>Porównaj (<span id="compareCount">0</span>)</span>
            </button>
            <button id="shareResultsBtn" class="btn btn-ghost btn-sm">
              <span class="material-icons">share</span>
            </button>
          </div>

          <div class="results-count">
            <span id="resultsCount">0</span> wyników
          </div>
        </div>

        <!-- Saved searches bar -->
        <div id="savedSearchesBar" class="saved-searches-bar hidden" aria-label="Zapisane wyszukiwania"></div>
        
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

<!-- Compare Bar (sticky bottom) -->
<div id="compareBar" class="compare-bar hidden" role="status" aria-live="polite">
  <div class="compare-bar-inner container">
    <div class="compare-bar-slots" id="compareBarSlots"></div>
    <div class="compare-bar-actions">
      <button class="btn btn-accent" id="compareOpenBtn">
        <span class="material-icons">compare</span> Porównaj
      </button>
      <button class="btn btn-ghost btn-sm" id="compareClearBtn">
        <span class="material-icons">close</span> Wyczyść
      </button>
    </div>
  </div>
</div>

<!-- Comparison Modal -->
<div id="compareModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="compareModalTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="compare-modal-inner" onclick="event.stopPropagation()">
    <div class="compare-modal-head">
      <h2 id="compareModalTitle">
        <span class="material-icons">compare</span> Porównanie salonów
      </h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('compareModal').classList.add('hidden')"
        aria-label="Zamknij">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="compare-modal-body" id="compareModalBody"></div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
