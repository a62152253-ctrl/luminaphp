<?php /* Public photo gallery for a salon */ ?>

<div class="gallery-page">
  <div class="gallery-page-head" style="margin-bottom:1.5rem">
    <div class="container" style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div>
        <h1>Galeria salonu</h1>
        <p>Przegląd zdjęć i inspiracji z sesji salonu</p>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap">
        <button type="button" class="btn btn-ghost btn-sm">Siatka</button>
        <button type="button" class="btn btn-ghost btn-sm">Pełny ekran</button>
        <button type="button" class="btn btn-accent btn-sm">Zapisz ulubione</button>
      </div>
    </div>
  </div>
  <div id="galleryBizInfo">
    <div class="spinner" style="margin:4rem auto"></div>
  </div>
  <div id="galleryGrid" class="gallery-public-grid" style="display:none">
    <!-- Photos rendered by JS -->
  </div>
</div>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
