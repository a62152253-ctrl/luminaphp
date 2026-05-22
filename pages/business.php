<?php
// $bizId injected by index.php — provide fallback for IDE / direct include
$bizId ??= '';

$portfolioImgs = [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&auto=format&fit=crop',
];
?>

<!-- HERO -->
<div class="biz-detail-hero" role="banner">
  <img id="bizHeroImg"
    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&amp;w=1200&amp;auto=format&amp;fit=crop"
    alt="Zdjęcie salonu" fetchpriority="high">
  <div class="biz-detail-overlay" aria-hidden="true"></div>
  <div class="biz-detail-info">
    <div class="container">
      <span id="bizCat" class="biz-detail-cat" aria-label="Kategoria salonu">Ładowanie…</span>
      <h1 id="bizNameText" class="biz-detail-name">Ładowanie…</h1>
      <div class="biz-detail-meta" aria-label="Informacje o salonie">
        <span><span class="material-icons" style="font-size:1rem" aria-hidden="true">near_me</span><span id="bizCity">—</span></span>
        <span><span class="material-icons" style="font-size:1rem;color:#fbbf24" aria-hidden="true">star</span><span id="bizRating" aria-label="Ocena">—</span></span>
        <span><span class="material-icons" style="font-size:1rem" aria-hidden="true">schedule</span><span id="bizHoursText">—</span></span>
        <span id="bizOpenBadge" class="biz-status-badge" style="display:none"></span>
      </div>
    </div>
  </div>
</div>

<!-- BODY -->
<div class="container">
  <div class="biz-detail-body">

    <!-- Left column -->
    <div>
      <!-- Services -->
      <section class="biz-panel" style="margin-bottom:1.5rem" aria-labelledby="svc-heading">
        <div class="biz-panel-header"><h2 id="svc-heading">Usługi</h2></div>
        <div id="servicesList">
          <div class="spinner" style="margin:2rem auto" role="status" aria-label="Ładowanie usług"></div>
        </div>
      </section>

      <!-- Promotions -->
      <section class="biz-panel" id="bizPromosPanel" style="display:none;margin-bottom:1.5rem"
        aria-labelledby="promo-heading">
        <div class="biz-panel-header"><h2 id="promo-heading">Promocje</h2></div>
        <div id="bizPromosList" class="biz-promos-list"></div>
      </section>

      <!-- Staff -->
      <section class="biz-panel" style="margin-bottom:1.5rem" aria-labelledby="staff-heading">
        <div class="biz-panel-header"><h2 id="staff-heading">Specjaliści</h2></div>
        <div id="staffGrid" class="staff-grid">
          <div class="spinner" style="margin:2rem auto" role="status" aria-label="Ładowanie pracowników"></div>
        </div>
      </section>

      <!-- Portfolio -->
      <section class="biz-panel" style="margin-bottom:1.5rem" aria-labelledby="portfolio-heading">
        <div class="biz-panel-header"><h2 id="portfolio-heading">Portfolio</h2></div>
        <div class="portfolio-grid" role="list" aria-label="Galeria zdjęć salonu">
          <?php foreach ($portfolioImgs as $i => $img):
            $imgSrc = htmlspecialchars($img, ENT_QUOTES | ENT_HTML5, 'UTF-8');
          ?>
          <div class="portfolio-img" role="listitem">
            <img src="<?= $imgSrc ?>"
              alt="Zdjęcie portfolio <?= $i + 1 ?>"
              loading="lazy" decoding="async">
          </div>
          <?php endforeach; ?>
        </div>
      </section>

      <!-- Reviews -->
      <section class="biz-panel" id="bizReviewsPanel" style="margin-top:1.5rem"
        aria-labelledby="reviews-heading">
        <div class="biz-panel-header"><h2 id="reviews-heading">Opinie</h2></div>
        <div id="bizReviewsSummary">
          <div class="spinner" style="margin:1.5rem auto" role="status" aria-label="Ładowanie opinii"></div>
        </div>
        <div id="bizReviewsList"></div>
        <div id="bizReviewForm"></div>
      </section>
    </div>

    <!-- Right: Booking Panel -->
    <aside class="booking-panel" aria-label="Panel rezerwacji">
      <div class="biz-panel">
        <div class="biz-panel-header"><h2>Zarezerwuj wizytę</h2></div>

        <div style="padding:1.25rem 2rem .5rem">
          <p style="font-size:.6875rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--zinc-400);margin-bottom:.75rem"
            id="datepicker-label">Wybierz datę</p>
        </div>
        <div id="dateGrid" class="date-grid" role="group" aria-labelledby="datepicker-label"></div>

        <div style="padding:1.25rem 2rem .5rem">
          <p style="font-size:.6875rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--zinc-400);margin-bottom:.75rem"
            id="timepicker-label">Wybierz godzinę</p>
        </div>
        <div id="timeGrid" class="time-grid" role="group" aria-labelledby="timepicker-label"></div>

        <div class="booking-summary" aria-label="Podsumowanie rezerwacji">
          <h3>Podsumowanie</h3>
          <div class="booking-row"><span>Usługa</span><strong id="sumService">—</strong></div>
          <div class="booking-row"><span>Specjalista</span><strong id="sumStaff">—</strong></div>
          <div class="booking-row"><span>Termin</span><strong id="sumTime">—</strong></div>
          <div class="booking-total"><span>Łącznie</span><span class="price" id="sumPrice">0 zł</span></div>
        </div>

        <button id="bookBtn" class="book-btn" onclick="confirmBooking()" disabled
          aria-disabled="true" aria-label="Zarezerwuj wizytę">
          Zarezerwuj wizytę
        </button>

        <button class="reclaim-trigger" id="reclaimTrigger"
          onclick="window.openReclaimModal()"
          aria-label="Zgłoś roszczenie do tego salonu">
          <span class="material-icons" style="font-size:.875rem" aria-hidden="true">flag</span>
          To mój salon — zgłoś roszczenie
        </button>
      </div>
    </aside>

  </div>
</div>

<!-- RECLAIM MODAL -->
<div class="modal-overlay hidden" id="reclaimModal"
  role="dialog" aria-modal="true" aria-labelledby="reclaim-title">
  <div class="modal-box reclaim-modal-box">
    <div class="modal-header">
      <h3 class="modal-title" id="reclaim-title">To mój salon — zgłoś roszczenie</h3>
      <button class="modal-close" onclick="window.closeReclaimModal()"
        aria-label="Zamknij formularz roszczenia">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>

    <div id="reclaimStep1">
      <p class="reclaim-desc">
        Wypełnij formularz. System automatycznie weryfikuje dane —
        legalne zgłoszenia otrzymują bezpośredni kontakt z administracją.
      </p>

      <div id="reclaimExistingStatus" class="reclaim-status-card hidden" role="alert"></div>

      <div class="reclaim-form-body">
        <div class="reclaim-section-label">Twoje dane</div>

        <div class="auth-field">
          <label for="reclaimName">Imię i nazwisko *</label>
          <input id="reclaimName" type="text" class="auth-input" placeholder="Jan Kowalski"
            autocomplete="name" required aria-required="true">
        </div>
        <div class="auth-field">
          <label for="reclaimEmail">Email</label>
          <input id="reclaimEmail" type="email" class="auth-input" readonly
            autocomplete="email" aria-readonly="true"
            style="opacity:.65;cursor:default">
        </div>
        <div class="auth-field">
          <label for="reclaimPhone">Numer telefonu *</label>
          <input id="reclaimPhone" type="tel" class="auth-input" placeholder="+48 600 000 000"
            autocomplete="tel" required aria-required="true">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field">
            <label for="reclaimRole">Rola w salonie *</label>
            <select id="reclaimRole" class="auth-input" required aria-required="true">
              <option value="owner">Właściciel</option>
              <option value="manager">Manager</option>
              <option value="employee">Pracownik z upoważnieniem</option>
              <option value="agency">Agencja / obsługa marketingowa</option>
            </select>
          </div>
          <div class="auth-field">
            <label for="reclaimAction">Co chcesz zrobić? *</label>
            <select id="reclaimAction" class="auth-input" required aria-required="true">
              <option value="claim_ownership">Przejąć zarządzanie profilem</option>
              <option value="update_data">Poprawić dane salonu</option>
              <option value="remove_listing">Zgłosić usunięcie profilu</option>
            </select>
          </div>
        </div>

        <div class="reclaim-section-label">Dane firmy</div>

        <div class="auth-field">
          <label for="reclaimNip">NIP firmy *</label>
          <div class="reclaim-input-row">
            <input id="reclaimNip" type="text" class="auth-input"
              placeholder="1234567890" maxlength="10" inputmode="numeric"
              autocomplete="off" required aria-required="true"
              aria-describedby="reclaimNipStatus"
              oninput="window.reclaimNipCheck(this.value)">
            <span id="reclaimNipStatus" class="reclaim-field-status" aria-live="polite"></span>
          </div>
        </div>
        <div class="auth-field">
          <label for="reclaimRegon">REGON <span class="reclaim-optional">(opcjonalnie)</span></label>
          <input id="reclaimRegon" type="text" class="auth-input"
            placeholder="123456789" maxlength="14" inputmode="numeric">
        </div>
        <div class="auth-field">
          <label for="reclaimSocial">Strona / social media salonu <span class="reclaim-optional">(opcjonalnie)</span></label>
          <input id="reclaimSocial" type="url" class="auth-input"
            placeholder="https://facebook.com/twoj-salon">
        </div>
        <div class="auth-field">
          <label for="reclaimDoc">Link do dokumentu KRS / CEIDG <span class="reclaim-optional">(opcjonalnie)</span></label>
          <input id="reclaimDoc" type="url" class="auth-input"
            placeholder="np. skan z Google Drive">
        </div>

        <div class="reclaim-section-label">Opis</div>

        <div class="auth-field">
          <label for="reclaimMsg">Dlaczego ten salon należy do Ciebie? *</label>
          <textarea id="reclaimMsg" class="auth-input" rows="4"
            placeholder="Opisz sytuację: kiedy założyłeś/aś salon, od jak dawna go prowadzisz…"
            required aria-required="true" aria-describedby="reclaimMsgCounter"
            oninput="window.reclaimMsgCount(this.value)"></textarea>
          <span id="reclaimMsgCounter" class="reclaim-char-count" aria-live="polite">0 / min. 80 znaków</span>
        </div>

        <label class="reclaim-consent">
          <input type="checkbox" id="reclaimConsent" required aria-required="true">
          <span>Potwierdzam, że mam prawo reprezentować ten salon, a podane dane są zgodne z prawdą.</span>
        </label>

        <!-- Honeypot — bots fill this, humans don't see it -->
        <input type="text" id="reclaimHp" name="website_url" autocomplete="off" tabindex="-1"
          style="position:absolute;left:-9999px;opacity:0;height:0;pointer-events:none"
          aria-hidden="true">
      </div>

      <div id="reclaimError" class="reclaim-error-box" role="alert"></div>

      <div class="reclaim-submit-wrap">
        <button class="auth-submit" id="reclaimSubmitBtn" onclick="window.submitReclaim()">
          <span class="material-icons" aria-hidden="true">verified_user</span> Wyślij i zweryfikuj
        </button>
      </div>
    </div>

    <!-- Step 2: result injected by JS -->
    <div id="reclaimStep2" class="hidden" aria-live="polite"></div>
  </div>
</div>
