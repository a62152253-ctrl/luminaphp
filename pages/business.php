<?php /* Business Detail Page */
$bizId = $_GET['id'] ?? '';
?>

<!-- HERO -->
<div class="biz-detail-hero">
  <img id="bizHeroImg" src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop" alt="Salon">
  <div class="biz-detail-overlay"></div>
  <div class="biz-detail-info">
    <div class="container">
      <span id="bizCat" class="biz-detail-cat">Ładowanie...</span>
      <h1 id="bizNameText" class="biz-detail-name">Ładowanie...</h1>
      <div class="biz-detail-meta">
        <span><span class="material-icons" style="font-size:1rem">near_me</span><span id="bizCity">—</span></span>
        <span><span class="material-icons" style="font-size:1rem;color:#fbbf24">star</span><span id="bizRating">—</span></span>
        <span><span class="material-icons" style="font-size:1rem">schedule</span><span id="bizHoursText">—</span></span>
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
      <div class="biz-panel" style="margin-bottom:1.5rem">
        <div class="biz-panel-header"><h2>Usługi</h2></div>
        <div id="servicesList"><div class="spinner" style="margin:2rem auto"></div></div>
      </div>

      <!-- Promotions (hidden until loaded) -->
      <div class="biz-panel" id="bizPromosPanel" style="display:none;margin-bottom:1.5rem">
        <div class="biz-panel-header"><h2>Promocje</h2></div>
        <div id="bizPromosList" class="biz-promos-list"></div>
      </div>

      <!-- Staff -->
      <div class="biz-panel" style="margin-bottom:1.5rem">
        <div class="biz-panel-header"><h2>Specjaliści</h2></div>
        <div id="staffGrid" class="staff-grid"><div class="spinner" style="margin:2rem auto"></div></div>
      </div>

      <!-- Portfolio -->
      <div class="biz-panel" style="margin-bottom:1.5rem">
        <div class="biz-panel-header"><h2>Portfolio</h2></div>
        <div class="portfolio-grid">
          <?php
          $imgs = [
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
            'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400',
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
            'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400',
            'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400',
          ];
          foreach ($imgs as $img): ?>
          <div class="portfolio-img">
            <img src="<?= $img ?>&auto=format&fit=crop" alt="Portfolio" loading="lazy">
          </div>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Reviews -->
      <div class="biz-panel" id="bizReviewsPanel" style="margin-top:1.5rem">
        <div class="biz-panel-header"><h2>Opinie</h2></div>
        <div id="bizReviewsSummary"><div class="spinner" style="margin:1.5rem auto"></div></div>
        <div id="bizReviewsList"></div>
        <div id="bizReviewForm"></div>
      </div>
    </div>

    <!-- Right: Booking Panel -->
    <div class="booking-panel">
      <div class="biz-panel">
        <div class="biz-panel-header"><h2>Zarezerwuj wizytę</h2></div>

        <!-- Date picker -->
        <div style="padding:1.25rem 2rem .5rem">
          <p style="font-size:.6875rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--zinc-400);margin-bottom:.75rem">Wybierz datę</p>
        </div>
        <div id="dateGrid" class="date-grid"></div>

        <!-- Time picker -->
        <div style="padding:1.25rem 2rem .5rem">
          <p style="font-size:.6875rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--zinc-400);margin-bottom:.75rem">Wybierz godzinę</p>
        </div>
        <div id="timeGrid" class="time-grid"></div>

        <!-- Summary -->
        <div class="booking-summary">
          <h3>Podsumowanie</h3>
          <div class="booking-row"><span>Usługa</span><strong id="sumService">—</strong></div>
          <div class="booking-row"><span>Specjalista</span><strong id="sumStaff">—</strong></div>
          <div class="booking-row"><span>Termin</span><strong id="sumTime">—</strong></div>
          <div class="booking-total"><span>Łącznie</span><span class="price" id="sumPrice">0 zł</span></div>
        </div>

        <button id="bookBtn" class="book-btn" onclick="confirmBooking()" disabled>
          Zarezerwuj wizytę
        </button>

        <button class="reclaim-trigger" id="reclaimTrigger" onclick="window.openReclaimModal()">
          <span class="material-icons" style="font-size:.875rem">flag</span>
          To mój salon — zgłoś roszczenie
        </button>
      </div>
    </div>

  </div>
</div>

<!-- ===== RECLAIM MODAL ===== -->
<div class="modal-overlay hidden" id="reclaimModal">
  <div class="modal-box reclaim-modal-box">
    <div class="modal-header">
      <h3 class="modal-title">To mój salon — zgłoś roszczenie</h3>
      <button class="modal-close" onclick="window.closeReclaimModal()">
        <span class="material-icons">close</span>
      </button>
    </div>

    <div id="reclaimStep1">
      <p class="reclaim-desc">
        Wypełnij formularz. System automatycznie weryfikuje dane —
        legalne zgłoszenia otrzymują bezpośredni kontakt z administracją.
      </p>

      <div id="reclaimExistingStatus" class="reclaim-status-card hidden"></div>

      <div class="reclaim-form-body">

        <div class="reclaim-section-label">Twoje dane</div>

        <div class="auth-field">
          <label for="reclaimName">Imię i nazwisko *</label>
          <input id="reclaimName" type="text" class="auth-input" placeholder="Jan Kowalski">
        </div>
        <div class="auth-field">
          <label for="reclaimEmail">Email</label>
          <input id="reclaimEmail" type="email" class="auth-input" readonly style="opacity:.65;cursor:default">
        </div>
        <div class="auth-field">
          <label for="reclaimPhone">Numer telefonu *</label>
          <input id="reclaimPhone" type="tel" class="auth-input" placeholder="+48 600 000 000">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field">
            <label for="reclaimRole">Rola w salonie *</label>
            <select id="reclaimRole" class="auth-input">
              <option value="owner">Właściciel</option>
              <option value="manager">Manager</option>
              <option value="employee">Pracownik z upoważnieniem</option>
              <option value="agency">Agencja / obsługa marketingowa</option>
            </select>
          </div>
          <div class="auth-field">
            <label for="reclaimAction">Co chcesz zrobić? *</label>
            <select id="reclaimAction" class="auth-input">
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
            <input id="reclaimNip" type="text" class="auth-input" placeholder="1234567890" maxlength="10"
              oninput="window.reclaimNipCheck(this.value)">
            <span id="reclaimNipStatus" class="reclaim-field-status"></span>
          </div>
        </div>
        <div class="auth-field">
          <label for="reclaimRegon">REGON <span class="reclaim-optional">(opcjonalnie)</span></label>
          <input id="reclaimRegon" type="text" class="auth-input" placeholder="123456789" maxlength="14">
        </div>
        <div class="auth-field">
          <label for="reclaimSocial">Strona / social media salonu <span class="reclaim-optional">(opcjonalnie)</span></label>
          <input id="reclaimSocial" type="url" class="auth-input" placeholder="https://facebook.com/twoj-salon">
        </div>
        <div class="auth-field">
          <label for="reclaimDoc">Link do dokumentu KRS / CEIDG <span class="reclaim-optional">(opcjonalnie)</span></label>
          <input id="reclaimDoc" type="url" class="auth-input" placeholder="np. skan z Google Drive">
        </div>

        <div class="reclaim-section-label">Opis</div>

        <div class="auth-field">
          <label for="reclaimMsg">Dlaczego ten salon należy do Ciebie? *</label>
          <textarea id="reclaimMsg" class="auth-input" rows="4"
            placeholder="Opisz sytuację: kiedy założyłeś/aś salon, od jak dawna go prowadzisz, co się stało..."
            oninput="window.reclaimMsgCount(this.value)"></textarea>
          <span id="reclaimMsgCounter" class="reclaim-char-count">0 / min. 80 znaków</span>
        </div>

        <label class="reclaim-consent">
          <input type="checkbox" id="reclaimConsent">
          <span>Potwierdzam, że mam prawo reprezentować ten salon, a podane dane są zgodne z prawdą.</span>
        </label>

        <!-- Honeypot — bots fill this, humans don't see it -->
        <input type="text" id="reclaimHp" autocomplete="off" name="website_url" tabindex="-1"
          style="position:absolute;left:-9999px;opacity:0;height:0;pointer-events:none">

      </div>

      <div id="reclaimError" class="reclaim-error-box"></div>

      <div class="reclaim-submit-wrap">
        <button class="auth-submit" id="reclaimSubmitBtn" onclick="window.submitReclaim()">
          <span class="material-icons">verified_user</span> Wyślij i zweryfikuj
        </button>
      </div>
    </div>

    <!-- Step 2: result injected by JS -->
    <div id="reclaimStep2" class="hidden"></div>
  </div>
</div>
