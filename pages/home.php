<?php
$homeCategories = [
    ['name' => 'Barber',       'icon' => 'content_cut',             'color' => '#1e3a5f', 'img' => 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1'],
    ['name' => 'Paznokcie',    'icon' => 'colorize',                'color' => '#5b1e6e', 'img' => 'https://images.unsplash.com/photo-1604654894610-df63bc536371'],
    ['name' => 'Fryzjer',      'icon' => 'face',                    'color' => '#1a4731', 'img' => 'https://images.unsplash.com/photo-1560066984-138dadb4c035'],
    ['name' => 'Masaż',        'icon' => 'spa',                     'color' => '#1e3a5f', 'img' => 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874'],
    ['name' => 'Kosmetyczka',  'icon' => 'face_retouching_natural', 'color' => '#6b1e3a', 'img' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881'],
    ['name' => 'Brwi i Rzęsy', 'icon' => 'visibility',              'color' => '#1e2a4a', 'img' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'],
    ['name' => 'Fizjoterapia', 'icon' => 'healing',                 'color' => '#1a4a3a', 'img' => 'https://images.unsplash.com/photo-1519824145371-296894a0daa9'],
    ['name' => 'Tatuaż',       'icon' => 'brush',                   'color' => '#2a1a1a', 'img' => 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d'],
];

$trendingServices = [
    ['label' => 'Balayage',       'icon' => 'brush',        'hot' => true],
    ['label' => 'Mani+Pedi',      'icon' => 'colorize',     'hot' => false],
    ['label' => 'Regulacja brwi', 'icon' => 'visibility',   'hot' => true],
    ['label' => 'Masaż relaks',   'icon' => 'spa',          'hot' => false],
    ['label' => 'Strzyżenie',     'icon' => 'content_cut',  'hot' => false],
    ['label' => 'Henna brwi',     'icon' => 'auto_fix_high','hot' => true],
];
?>

<!-- HERO -->
<section class="hero-booksy" aria-label="Strona główna Lumina">
  <div class="hero-booksy-bg" aria-hidden="true">
    <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1920&auto=format&fit=crop"
      alt="" role="presentation" fetchpriority="high">
    <div class="hero-booksy-overlay"></div>
  </div>
  <div class="hero-booksy-content">
    <div class="hero-booksy-label" aria-hidden="true">
      <span class="hero-booksy-label-dot"></span>
      <span>12 000+ salonów w Polsce</span>
    </div>
    <h1>Znajdź i zarezerwuj<br><span>najlepsze salony</span></h1>
    <p>Barber, fryzjer, kosmetyczka, masaż i wiele więcej. Szybko, łatwo, online.</p>

    <div class="booksy-search-bar" role="search">
      <div class="booksy-search-inputs">
        <div class="booksy-search-field">
          <span class="material-icons" aria-hidden="true">search</span>
          <input type="search" id="homeSearchService" placeholder="Czego szukasz? np. fryzjer, manicure"
            autocomplete="off" aria-label="Szukaj usługi lub salonu">
        </div>
        <div class="booksy-search-divider" aria-hidden="true"></div>
        <div class="booksy-search-field">
          <span class="material-icons" aria-hidden="true">location_on</span>
          <input type="search" id="homeSearchLocation" placeholder="Gdzie? np. Warszawa"
            autocomplete="address-level2" aria-label="Miasto lub adres">
        </div>
        <button class="booksy-search-btn" id="homeSearchBtn">Szukaj</button>
      </div>
    </div>

    <div class="booksy-hero-actions" role="group" aria-label="Szybkie akcje">
      <a href="/luminaphp/?page=explore" class="btn btn-accent btn-lg">
        <span class="material-icons" aria-hidden="true">travel_explore</span>
        Zobacz top salonów
      </a>
      <a href="/luminaphp/?page=map" class="btn btn-ghost btn-lg">
        <span class="material-icons" aria-hidden="true">map</span>
        Otwórz mapę
      </a>
    </div>

    <div class="booksy-quick-stats" aria-label="Statystyki platformy">
      <div class="booksy-stat"><span class="booksy-stat-number">12k+</span><span class="booksy-stat-label">Salonów</span></div>
      <div class="booksy-stat"><span class="booksy-stat-number">500k+</span><span class="booksy-stat-label">Wizyt miesięcznie</span></div>
      <div class="booksy-stat"><span class="booksy-stat-number">4.9</span><span class="booksy-stat-label">Średnia ocena</span></div>
    </div>
  </div>
</section>

<!-- KATEGORIE -->
<section class="categories-booksy-section" aria-labelledby="cats-heading">
  <div class="container">
    <div class="booksy-section-header">
      <h2 id="cats-heading">Popularne kategorie</h2>
      <a href="/luminaphp/?page=explore" class="booksy-see-all">Zobacz wszystkie <span class="material-icons" aria-hidden="true">arrow_forward</span></a>
    </div>
    <div class="categories-booksy-grid" role="list">
      <?php foreach ($homeCategories as $cat):
        $n = htmlspecialchars($cat['name'],  ENT_QUOTES|ENT_HTML5, 'UTF-8');
        $c = htmlspecialchars($cat['color'], ENT_QUOTES|ENT_HTML5, 'UTF-8');
        $i = htmlspecialchars($cat['img'].'?w=400&auto=format&fit=crop', ENT_QUOTES|ENT_HTML5, 'UTF-8');
      ?>
      <a href="/luminaphp/?page=explore&amp;cat=<?= urlencode($cat['name']) ?>"
         class="category-booksy-card" style="background:<?= $c ?>" role="listitem" aria-label="Kategoria <?= $n ?>">
        <div class="category-booksy-img" aria-hidden="true">
          <img src="<?= $i ?>" alt="" loading="lazy" decoding="async">
          <div class="category-booksy-overlay"></div>
        </div>
        <div class="category-booksy-content">
          <span class="material-icons category-booksy-icon" aria-hidden="true"><?= htmlspecialchars($cat['icon'], ENT_QUOTES|ENT_HTML5, 'UTF-8') ?></span>
          <span class="category-booksy-name"><?= $n ?></span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- POLECANE SALONY -->
<section class="featured-booksy-section" aria-labelledby="featured-heading">
  <div class="container">
    <div class="booksy-section-header">
      <h2 id="featured-heading">Polecane salony w Twojej okolicy</h2>
      <a href="/luminaphp/?page=explore" class="booksy-see-all">Zobacz wszystkie <span class="material-icons" aria-hidden="true">arrow_forward</span></a>
    </div>
    <div class="swiper featured-swiper">
      <div class="swiper-wrapper" id="featuredGrid" aria-live="polite" aria-busy="true">
        <div class="swiper-slide" style="display:flex;justify-content:center;padding:2rem 0">
          <div class="spinner" role="status" aria-label="Ładowanie salonów"></div>
        </div>
      </div>
      <div class="swiper-pagination featured-swiper-pagination"></div>
      <div class="swiper-button-prev featured-swiper-prev"></div>
      <div class="swiper-button-next featured-swiper-next"></div>
    </div>
  </div>
</section>

<!-- PROMOCJE (pokazywane przez JS gdy są dane) -->
<section class="promotions-booksy-section" id="promoSection" style="display:none" aria-labelledby="promo-heading">
  <div class="container">
    <div class="booksy-section-header">
      <h2 id="promo-heading">Promocje i rabaty</h2>
      <a href="/luminaphp/?page=offers" class="booksy-see-all">Zobacz wszystkie <span class="material-icons" aria-hidden="true">arrow_forward</span></a>
    </div>
    <div class="swiper promos-swiper">
      <div class="swiper-wrapper" id="promotionsGrid" aria-live="polite">
        <div class="swiper-slide" style="display:flex;justify-content:center;padding:1rem 0">
          <div class="spinner" role="status" aria-label="Ładowanie promocji"></div>
        </div>
      </div>
      <div class="swiper-pagination promos-swiper-pagination"></div>
    </div>
  </div>
</section>

<!-- TRENDY DZISIAJ -->
<section class="trending-booksy-section" aria-labelledby="trending-heading">
  <div class="container">
    <div class="booksy-section-header">
      <h2 id="trending-heading">Trendy dzisiaj</h2>
      <a href="/luminaphp/?page=explore" class="booksy-see-all">Zobacz więcej <span class="material-icons" aria-hidden="true">arrow_forward</span></a>
    </div>
    <div class="trending-chips-row" role="list">
      <?php foreach ($trendingServices as $ts): ?>
      <a href="/luminaphp/?page=explore&amp;q=<?= urlencode($ts['label']) ?>" class="trending-chip" role="listitem">
        <span class="material-icons" aria-hidden="true"><?= htmlspecialchars($ts['icon'], ENT_QUOTES|ENT_HTML5, 'UTF-8') ?></span>
        <?= htmlspecialchars($ts['label'], ENT_QUOTES|ENT_HTML5, 'UTF-8') ?>
        <?php if ($ts['hot']): ?><span class="trending-hot-badge">HOT</span><?php endif; ?>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- JAK TO DZIAŁA -->
<section class="how-it-works-booksy" aria-labelledby="how-heading">
  <div class="container">
    <div class="booksy-section-header center">
      <h2 id="how-heading">Jak to działa?</h2>
      <p>Zarezerwuj wizytę w 3 prostych krokach</p>
    </div>
    <ol class="how-steps-grid">
      <li class="how-step-card"><div class="how-step-number" aria-hidden="true">1</div><h3>Znajdź salon</h3><p>Przeglądaj salony w okolicy, czytaj opinie i porównuj ceny</p></li>
      <li class="how-step-card"><div class="how-step-number" aria-hidden="true">2</div><h3>Wybierz termin</h3><p>Dostępne terminy w czasie rzeczywistym</p></li>
      <li class="how-step-card"><div class="how-step-number" aria-hidden="true">3</div><h3>Potwierdź</h3><p>Zarezerwuj online i otrzymaj potwierdzenie. Zero telefonów!</p></li>
    </ol>
  </div>
</section>

<!-- SEZONOWE KAMPANIE -->
<section class="seasonal-booksy-section" aria-labelledby="seasonal-heading">
  <div class="container">
    <div class="booksy-section-header">
      <h2 id="seasonal-heading">Sezonowe promocje</h2>
      <a href="/luminaphp/?page=marketplace#seasonal" class="booksy-see-all">
        Zobacz wszystkie <span class="material-icons" aria-hidden="true">arrow_forward</span>
      </a>
    </div>
    <?php
    $homeMonth = (int) date('n');
    $homeSeasonalCampaigns = [
      ['icon' => 'favorite',           'title' => 'Sezon ślubny',         'desc' => 'Pakiety dla nowożeńców i par',      'color' => '#db2777', 'bg' => '#fdf2f8', 'cat' => 'Kosmetyczka', 'active' => ($homeMonth >= 4 && $homeMonth <= 9)],
      ['icon' => 'school',             'title' => 'Powrót do szkoły',     'desc' => 'Zadbaj o wygląd na nowy rok',       'color' => '#7c3aed', 'bg' => '#f5f3ff', 'cat' => 'Fryzjer',     'active' => ($homeMonth === 8 || $homeMonth === 9)],
      ['icon' => 'wb_sunny',           'title' => 'Lato w pełni',         'desc' => 'Beach body i piękna skóra',         'color' => '#f59e0b', 'bg' => '#fffbeb', 'cat' => 'Masaż',       'active' => ($homeMonth >= 6 && $homeMonth <= 8)],
      ['icon' => 'park',               'title' => 'Jesienna pielęgnacja', 'desc' => 'Regeneracja po lecie',              'color' => '#d97706', 'bg' => '#fef3c7', 'cat' => 'Kosmetyczka', 'active' => ($homeMonth >= 9 && $homeMonth <= 11)],
      ['icon' => 'star',               'title' => 'Świąteczny glamour',   'desc' => 'Wyglądaj olśniewająco na imprezach','color' => '#dc2626', 'bg' => '#fef2f2', 'cat' => 'Fryzjer',     'active' => ($homeMonth === 11 || $homeMonth === 12)],
      ['icon' => 'volunteer_activism', 'title' => 'Walentynki',           'desc' => 'Romantyczne pakiety dla par',       'color' => '#e11d48', 'bg' => '#fff1f2', 'cat' => 'Masaż',       'active' => ($homeMonth === 1 || $homeMonth === 2)],
    ];
    ?>
    <div class="seasonal-home-grid" role="list">
      <?php foreach ($homeSeasonalCampaigns as $sc):
        $scTitle = htmlspecialchars($sc['title'], ENT_QUOTES|ENT_HTML5, 'UTF-8');
        $scDesc  = htmlspecialchars($sc['desc'],  ENT_QUOTES|ENT_HTML5, 'UTF-8');
        $scIcon  = htmlspecialchars($sc['icon'],  ENT_QUOTES|ENT_HTML5, 'UTF-8');
        $scCat   = urlencode($sc['cat']);
      ?>
      <a href="/luminaphp/?page=explore&amp;cat=<?= $scCat ?>"
        class="seasonal-home-card<?= $sc['active'] ? ' seasonal-home-card--active' : '' ?>"
        role="listitem"
        style="--sc-color:<?= htmlspecialchars($sc['color'], ENT_QUOTES|ENT_HTML5, 'UTF-8') ?>;--sc-bg:<?= htmlspecialchars($sc['bg'], ENT_QUOTES|ENT_HTML5, 'UTF-8') ?>">
        <div class="seasonal-home-icon">
          <span class="material-icons" aria-hidden="true"><?= $scIcon ?></span>
        </div>
        <div class="seasonal-home-body">
          <strong><?= $scTitle ?></strong>
          <p><?= $scDesc ?></p>
          <?php if ($sc['active']): ?>
          <span class="seasonal-home-live" aria-label="Kampania aktywna">Aktywna</span>
          <?php endif; ?>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- POBIERZ APLIKACJĘ -->
<section class="app-download-section" aria-labelledby="app-heading">
  <div class="container">
    <div class="app-download-card">
      <div class="app-download-copy">
        <span class="app-download-label">Lumina — aplikacja mobilna</span>
        <h2 id="app-heading">Miej salony zawsze przy sobie</h2>
        <p>Rezerwuj jednym kliknięciem, otrzymuj powiadomienia push i korzystaj z ekskluzywnych ofert.</p>
        <div class="app-download-btns">
          <a href="#" class="app-store-btn" aria-label="Pobierz w App Store">
            <span class="material-icons">apple</span><span><small>Pobierz w</small><strong>App Store</strong></span>
          </a>
          <a href="#" class="app-store-btn" aria-label="Pobierz w Google Play">
            <span class="material-icons">android</span><span><small>Dostępne w</small><strong>Google Play</strong></span>
          </a>
        </div>
      </div>
      <span class="material-icons app-download-phone-icon" aria-hidden="true">smartphone</span>
    </div>
  </div>
</section>

<!-- Floating Quick-Book Button -->
<a href="/luminaphp/?page=explore" id="quickBookFab" class="quick-book-fab" aria-label="Szybka rezerwacja">
  <span class="material-icons">add</span>
  <span class="fab-label">Zarezerwuj</span>
</a>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
