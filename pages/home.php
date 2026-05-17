<?php /* Landing Page - Booksy Style */ ?>

<!-- HERO with Search -->
<section class="hero-booksy">
  <div class="hero-booksy-bg">
    <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1920&auto=format&fit=crop" alt="Salon">
    <div class="hero-booksy-overlay"></div>
  </div>
  <div class="hero-booksy-content">
    <div class="hero-booksy-label">
      <span class="hero-booksy-label-dot"></span>
      <span>12 000+ salonów w Polsce</span>
    </div>
    <div class="hero-booksy-text">
      <h1>Znajdź i zarezerwuj<br><span>najlepsze salony</span></h1>
      <p>Barber, fryzjer, kosmetyczka, masaż i wiele więcej. Szybko, łatwo, online.</p>
    </div>
    
    <!-- Search Bar - Booksy Style -->
    <div class="booksy-search-bar">
      <div class="booksy-search-inputs">
        <div class="booksy-search-field">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Czego szukasz? np. fryzjer, manicure" id="homeSearchService">
        </div>
        <div class="booksy-search-divider"></div>
        <div class="booksy-search-field">
          <span class="material-icons">location_on</span>
          <input type="text" placeholder="Gdzie? np. Warszawa" id="homeSearchLocation">
        </div>
        <button class="booksy-search-btn" id="homeSearchBtn">
          Szukaj
        </button>
      </div>
    </div>
    
    <!-- Quick Stats -->
    <div class="booksy-quick-stats">
      <div class="booksy-stat">
        <span class="booksy-stat-number">12k+</span>
        <span class="booksy-stat-label">Salonów</span>
      </div>
      <div class="booksy-stat">
        <span class="booksy-stat-number">500k+</span>
        <span class="booksy-stat-label">Wizyt miesięcznie</span>
      </div>
      <div class="booksy-stat">
        <span class="booksy-stat-number">4.9</span>
        <span class="booksy-stat-label">Średnia ocena</span>
      </div>
    </div>
  </div>
</section>

<!-- CATEGORIES - Booksy Style -->
<section class="categories-booksy-section">
  <div class="container">
    <div class="booksy-section-header">
      <h2>Popularne kategorie</h2>
      <a href="/luminaphp/?page=explore" class="booksy-see-all">Zobacz wszystkie <span class="material-icons">arrow_forward</span></a>
    </div>
    <div class="categories-booksy-grid">
      <?php
      $cats = [
        ['name'=>'Barber',       'icon'=>'content_cut',           'img'=>'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 'color'=>'#1e3a5f'],
        ['name'=>'Paznokcie',    'icon'=>'colorize',              'img'=>'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 'color'=>'#5b1e6e'],
        ['name'=>'Fryzjer',      'icon'=>'face',                  'img'=>'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',    'color'=>'#1a4731'],
        ['name'=>'Masaż',        'icon'=>'spa',                   'img'=>'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',    'color'=>'#1e3a5f'],
        ['name'=>'Kosmetyczka',  'icon'=>'face_retouching_natural','img'=>'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 'color'=>'#6b1e3a'],
        ['name'=>'Brwi i Rzęsy', 'icon'=>'visibility',            'img'=>'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', 'color'=>'#1e2a4a'],
        ['name'=>'Fizjoterapia', 'icon'=>'healing',               'img'=>'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=400', 'color'=>'#1a4a3a'],
        ['name'=>'Tatuaż',       'icon'=>'brush',                 'img'=>'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400', 'color'=>'#2a1a1a'],
      ];
      foreach ($cats as $cat): ?>
      <a href="/luminaphp/?page=explore&cat=<?= urlencode($cat['name']) ?>" class="category-booksy-card"
         style="background:<?= $cat['color'] ?>">
        <div class="category-booksy-img">
          <img src="<?= $cat['img'] ?>&auto=format&fit=crop" alt="<?= $cat['name'] ?>"
               onerror="this.style.display='none'">
          <div class="category-booksy-overlay"></div>
        </div>
        <div class="category-booksy-content">
          <span class="material-icons category-booksy-icon"><?= $cat['icon'] ?></span>
          <span class="category-booksy-name"><?= $cat['name'] ?></span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- FEATURED SALONS - Booksy Style -->
<section class="featured-booksy-section">
  <div class="container">
    <div class="booksy-section-header">
      <h2>Polecane salony w Twojej okolicy</h2>
      <a href="/luminaphp/?page=explore" class="booksy-see-all">Zobacz wszystkie <span class="material-icons">arrow_forward</span></a>
    </div>
    <div class="salons-booksy-grid" id="featuredGrid">
      <div class="spinner" style="margin:3rem auto;grid-column:1/-1"></div>
    </div>
  </div>
</section>

<!-- PROMOTIONS - Booksy Style -->
<section class="promotions-booksy-section" id="promoSection" style="display:none">
  <div class="container">
    <div class="booksy-section-header">
      <h2>Promocje i rabaty</h2>
      <a href="/luminaphp/?page=explore" class="booksy-see-all">Zobacz wszystkie <span class="material-icons">arrow_forward</span></a>
    </div>
    <div class="promotions-booksy-grid" id="promotionsGrid">
      <div class="spinner" style="margin:3rem auto;grid-column:1/-1"></div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS - Booksy Style -->
<section class="how-it-works-booksy">
  <div class="container">
    <div class="booksy-section-header center">
      <h2>Jak to działa?</h2>
      <p>Zarezerwuj wizytę w 3 prostych krokach</p>
    </div>
    <div class="how-steps-grid">
      <div class="how-step-card">
        <div class="how-step-number">1</div>
        <h3>Znajdź salon</h3>
        <p>Przeglądaj salony w Twojej okolicy, czytaj opinie i porównuj ceny</p>
      </div>
      <div class="how-step-card">
        <div class="how-step-number">2</div>
        <h3>Wybierz termin</h3>
        <p>Zobacz dostępne terminy w czasie rzeczywistym i wybierz dogodny dla Ciebie</p>
      </div>
      <div class="how-step-card">
        <div class="how-step-number">3</div>
        <h3>Potwierdź</h3>
        <p>Zarezerwuj online i otrzymaj potwierdzenie. Zero telefonów!</p>
      </div>
    </div>
  </div>
</section>
