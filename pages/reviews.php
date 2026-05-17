<?php $bizId = $_GET['id'] ?? ''; ?>
<div class="features-page container">
  <header class="features-hero">
    <h1>Opinie salonu</h1>
    <p>Recenzje klientów ze zdjęciami przed/po</p>
  </header>

  <div class="reviews-toolbar">
    <select id="reviewFilterRating" class="auth-input">
      <option value="">Wszystkie oceny</option>
      <option value="5">5 gwiazdek</option>
      <option value="4">4+ gwiazdek</option>
      <option value="3">3+ gwiazdek</option>
    </select>
    <select id="reviewFilterSort" class="auth-input">
      <option value="newest">Najnowsze</option>
      <option value="highest">Najwyżej ocenione</option>
    </select>
    <button id="addReviewBtn" class="btn btn-accent"><span class="material-icons">rate_review</span> Dodaj opinię</button>
  </div>

  <div id="reviewsList" class="reviews-grid"></div>
  <div id="scrollSkeleton" class="hidden"></div>
  <div id="scrollSentinel"></div>

  <div id="reviewModal" class="profile-overlay hidden">
    <div class="profile-modal" onclick="event.stopPropagation()">
      <h2>Dodaj opinię</h2>
      <div id="reviewStars" class="review-stars-input"></div>
      <textarea id="reviewText" class="auth-input" rows="4" placeholder="Opisz swoje doświadczenie…"></textarea>
      <input type="file" id="reviewPhotos" accept="image/*" multiple>
      <div id="reviewPhotoPreview"></div>
      <div class="profile-modal-foot">
        <button class="profile-cancel-btn" onclick="document.getElementById('reviewModal').classList.add('hidden')">Anuluj</button>
        <button id="submitReviewBtn" class="profile-save-btn">Wyślij</button>
      </div>
    </div>
  </div>
</div>
<input type="hidden" id="reviewsBizId" value="<?= htmlspecialchars($bizId) ?>">
