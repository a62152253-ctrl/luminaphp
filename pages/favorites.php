<?php /* Ulubione salony */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Ulubione salony</h1>
    <p>Twoje zapisane miejsca — szybka rezerwacja</p>
    <div class="favorites-actions" role="group" aria-label="Akcje ulubionych salonów" style="margin-top:1rem;display:flex;gap:.75rem;flex-wrap:wrap">
      <button type="button" class="btn btn-ghost btn-sm">Sortuj według oceny</button>
      <button type="button" class="btn btn-ghost btn-sm">Pokaż tylko otwarte</button>
      <a href="/luminaphp/?page=explore" class="btn btn-accent btn-sm">Znajdź nowe</a>
    </div>
  </header>
  <div id="favoritesGrid" class="favorites-grid"></div>
</div>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
