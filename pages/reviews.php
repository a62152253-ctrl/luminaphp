<?php
$bizId ??= '';
?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Opinie salonu</h1>
    <p>Recenzje klientów ze zdjęciami przed/po</p>
  </header>

  <!-- Rating summary panel -->
  <div class="reviews-summary-panel" id="reviewsSummary">
    <div class="reviews-avg-block">
      <span class="reviews-avg-num" id="reviewsAvgScore">—</span>
      <div id="reviewsAvgStars" class="reviews-avg-stars"></div>
      <span class="text-muted" id="reviewsAvgTotal"></span>
    </div>
    <div class="reviews-bars" aria-label="Rozkład ocen">
      <?php foreach ([5,4,3,2,1] as $s): ?>
      <div class="reviews-bar-row">
        <span class="reviews-bar-label"><?= $s ?> ★</span>
        <div class="reviews-bar-track">
          <div class="reviews-bar-fill" id="reviewsBar<?= $s ?>" style="width:0%"></div>
        </div>
        <span class="reviews-bar-pct" id="reviewsPct<?= $s ?>">0%</span>
      </div>
      <?php endforeach; ?>
    </div>
  </div>

  <!-- Toolbar: filters + view toggle -->
  <div class="reviews-toolbar" role="search" aria-label="Filtruj opinie">
    <label for="reviewFilterRating" class="sr-only">Filtruj po ocenie</label>
    <select id="reviewFilterRating" class="auth-input" aria-label="Filtruj po ocenie">
      <option value="">Wszystkie oceny</option>
      <option value="5">5 gwiazdek</option>
      <option value="4">4+ gwiazdki</option>
      <option value="3">3+ gwiazdki</option>
    </select>
    <button id="reviewHighlightBtn" class="btn btn-ghost btn-sm" type="button">
      <span class="material-icons">highlight</span> Najlepsze opinie
    </button>

    <label for="reviewFilterSort" class="sr-only">Sortuj opinie</label>
    <select id="reviewFilterSort" class="auth-input" aria-label="Sortuj opinie">
      <option value="newest">Najnowsze</option>
      <option value="highest">Najwyżej ocenione</option>
      <option value="most_helpful">Najbardziej pomocne</option>
      <option value="with_photos">Ze zdjęciami</option>
    </select>

    <!-- View toggle: cards / gallery -->
    <div class="reviews-view-toggle">
      <button id="reviewsViewCards" class="view-btn-booksy active" title="Widok kart">
        <span class="material-icons">view_agenda</span>
      </button>
      <button id="reviewsViewGallery" class="view-btn-booksy" title="Galeria zdjęć">
        <span class="material-icons">photo_library</span>
      </button>
    </div>

    <button id="addReviewBtn" class="btn btn-accent" aria-label="Dodaj swoją opinię">
      <span class="material-icons" aria-hidden="true">rate_review</span> Dodaj opinię
    </button>
  </div>

  <!-- Photo gallery view (hidden by default) -->
  <div id="reviewsPhotoGallery" class="reviews-photo-gallery hidden" aria-label="Galeria zdjęć z opinii"></div>

  <div id="reviewsList" class="reviews-grid" aria-live="polite" aria-label="Lista opinii"></div>
  <div id="scrollSkeleton" class="hidden" aria-hidden="true"></div>
  <div id="scrollSentinel" aria-hidden="true"></div>

  <!-- Add Review Modal -->
  <div id="reviewModal" class="profile-overlay hidden"
    role="dialog" aria-modal="true" aria-labelledby="reviewModalTitle"
    onclick="if(event.target===this)this.classList.add('hidden')">
    <div class="profile-modal" onclick="event.stopPropagation()">
      <div class="profile-modal-head">
        <h2 id="reviewModalTitle">Dodaj opinię</h2>
        <button class="profile-modal-close"
          onclick="document.getElementById('reviewModal').classList.add('hidden')"
          aria-label="Zamknij formularz opinii">
          <span class="material-icons" aria-hidden="true">close</span>
        </button>
      </div>

      <div class="profile-modal-body">
        <div id="reviewStars" class="review-stars-input"
          role="group" aria-label="Wybierz ocenę od 1 do 5 gwiazdek"></div>

        <div class="auth-field">
          <label for="reviewText">Twoja opinia</label>
          <textarea id="reviewText" class="auth-input" rows="4"
            placeholder="Opisz swoje doświadczenie…"
            aria-label="Napisz opinię o salonie" maxlength="1000"></textarea>
          <small id="reviewCharCount" class="text-muted" style="float:right">0 / 1000</small>
        </div>

        <!-- Aspect tags -->
        <div class="auth-field">
          <label>Oceń aspekty (opcjonalnie)</label>
          <div class="review-aspect-tags" role="group" aria-label="Aspekty wizyty">
            <?php foreach (['Czystość','Punktualność','Jakość usługi','Obsługa','Cena'] as $asp): ?>
            <label class="review-aspect-tag">
              <input type="checkbox" name="reviewAspect" value="<?= $asp ?>">
              <span><?= $asp ?></span>
            </label>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="auth-field">
          <label for="reviewPhotos">Zdjęcia (opcjonalnie)</label>
          <input type="file" id="reviewPhotos" accept="image/*" multiple
            aria-label="Dodaj zdjęcia do opinii (opcjonalnie)">
        </div>
        <div id="reviewPhotoPreview" aria-live="polite"></div>
      </div>

      <div class="profile-modal-foot">
        <button class="profile-cancel-btn"
          onclick="document.getElementById('reviewModal').classList.add('hidden')"
          aria-label="Anuluj dodawanie opinii">Anuluj</button>
        <button id="submitReviewBtn" class="profile-save-btn"
          aria-label="Wyślij opinię">
          <span class="material-icons" aria-hidden="true">send</span> Wyślij
        </button>
      </div>
    </div>
  </div>
</div>

<input type="hidden" id="reviewsBizId" value="<?= htmlspecialchars($bizId, ENT_QUOTES, 'UTF-8') ?>">

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
