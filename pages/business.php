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
      <div class="biz-name-row">
        <h1 id="bizNameText" class="biz-detail-name">Ładowanie…</h1>
        <button class="biz-report-btn" id="reclaimTrigger"
          onclick="window.openReclaimModal()"
          aria-label="Zgłoś problem z tym profilem"
          title="Zgłoś problem">
          <span class="material-icons" aria-hidden="true">flag</span>
        </button>
      </div>
      <div class="biz-detail-meta" aria-label="Informacje o salonie">
        <span><span class="material-icons" style="font-size:1rem" aria-hidden="true">near_me</span><span id="bizCity">—</span></span>
        <span><span class="material-icons" style="font-size:1rem;color:#fbbf24" aria-hidden="true">star</span><span id="bizRating" aria-label="Ocena">—</span></span>
        <span><span class="material-icons" style="font-size:1rem" aria-hidden="true">schedule</span><span id="bizHoursText">—</span></span>
        <span id="bizOpenBadge" class="biz-status-badge" style="display:none"></span>
      </div>
      <div class="biz-detail-actions" role="group" aria-label="Szybkie akcje profilu">
        <a href="/luminaphp/?page=booking&amp;id=<?= htmlspecialchars($bizId, ENT_QUOTES, 'UTF-8') ?>" class="btn btn-accent btn-sm">
          <span class="material-icons" aria-hidden="true">event_available</span> Rezerwuj teraz
        </a>
        <a href="/luminaphp/?page=offers" class="btn btn-ghost btn-sm">
          <span class="material-icons" aria-hidden="true">local_offer</span> Sprawdź promocje
        </a>
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

      </div>
    </aside>

  </div>
</div>

<!-- REPORT MODAL -->
<div class="modal-overlay hidden" id="reclaimModal"
  onclick="if(event.target===this)window.closeReclaimModal()"
  role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
  <div class="modal-box reclaim-modal-box">

    <div class="modal-header">
      <h3 class="modal-title" id="report-modal-title">
        <span class="material-icons" style="font-size:1.1rem;vertical-align:-.15em;color:var(--accent)" aria-hidden="true">flag</span>
        Zgłoś problem
      </h3>
      <button class="modal-close" onclick="window.closeReclaimModal()" aria-label="Zamknij">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>

    <div id="reclaimStep1">
      <p class="reclaim-desc">Co jest nie tak z tym profilem?</p>

      <div class="report-form-body">
        <div class="report-type-grid" id="reportTypeGrid">
          <button class="report-type-btn" data-type="wrong_data"
            onclick="window.selectReportType('wrong_data',this)" type="button">
            <span class="material-icons" aria-hidden="true">edit_note</span>
            Błędne dane
          </button>
          <button class="report-type-btn" data-type="not_exist"
            onclick="window.selectReportType('not_exist',this)" type="button">
            <span class="material-icons" aria-hidden="true">storefront</span>
            Nie istnieje
          </button>
          <button class="report-type-btn" data-type="spam"
            onclick="window.selectReportType('spam',this)" type="button">
            <span class="material-icons" aria-hidden="true">report</span>
            Spam / fałszywy
          </button>
          <button class="report-type-btn" data-type="inappropriate"
            onclick="window.selectReportType('inappropriate',this)" type="button">
            <span class="material-icons" aria-hidden="true">block</span>
            Nieodpowiednie
          </button>
        </div>

        <div class="auth-field" style="margin-top:1rem">
          <label for="reportMsg">Opis <span style="font-weight:400;color:var(--zinc-400)">(opcjonalnie)</span></label>
          <textarea id="reportMsg" class="auth-input" rows="3"
            placeholder="Opisz problem w kilku słowach…"
            oninput="window.reclaimMsgCount(this.value)"
            aria-describedby="reclaimMsgCounter"></textarea>
          <span id="reclaimMsgCounter" class="reclaim-char-count" aria-live="polite"></span>
        </div>

        <!-- Honeypot -->
        <input type="text" id="reclaimHp" name="website_url" autocomplete="off" tabindex="-1"
          style="position:absolute;left:-9999px;opacity:0;height:0;pointer-events:none"
          aria-hidden="true">
      </div>

      <div id="reclaimError" class="reclaim-error-box" role="alert"></div>

      <div class="reclaim-submit-wrap">
        <button class="auth-submit" id="reclaimSubmitBtn" onclick="window.submitReclaim()">
          <span class="material-icons" aria-hidden="true">flag</span> Wyślij zgłoszenie
        </button>
      </div>
    </div>

    <!-- Step 2: result injected by JS -->
    <div id="reclaimStep2" class="hidden" aria-live="polite"></div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
