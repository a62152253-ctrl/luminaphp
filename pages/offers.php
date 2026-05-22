<?php /* Promocje i pakiety */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Promocje i pakiety</h1>
    <p>Kody rabatowe i oferty specjalne salonów</p>
  </header>

  <!-- Kod rabatowy -->
  <div class="promo-apply-bar">
    <input type="text" id="promoCodeInput" class="auth-input" placeholder="Wpisz kod rabatowy">
    <button id="promoApplyBtn" class="btn btn-accent">
      <span class="material-icons">local_offer</span> Zastosuj
    </button>
    <button id="promoRemoveBtn" class="btn btn-ghost hidden" onclick="window.removePromo?.()">
      <span class="material-icons">cancel</span> Usuń
    </button>
    <button id="scanQrBtn" class="btn btn-ghost" title="Zeskanuj kod QR">
      <span class="material-icons">qr_code_scanner</span>
    </button>
  </div>
  <div id="promoApplied" class="promo-applied hidden"></div>

  <!-- Toolbar: tabs + sort + view -->
  <div class="offers-toolbar">
    <div class="offers-tabs" role="tablist" aria-label="Kategorie ofert">
      <button class="offers-tab active" role="tab" data-tab="all">
        Wszystkie
      </button>
      <button class="offers-tab" role="tab" data-tab="active">
        <span class="material-icons">bolt</span> Aktywne
      </button>
      <button class="offers-tab" role="tab" data-tab="expiring">
        <span class="material-icons">timer</span> Wygasające
      </button>
      <button class="offers-tab" role="tab" data-tab="coupons">
        <span class="material-icons">confirmation_number</span> Moje kupony
      </button>
      <button class="offers-tab" role="tab" data-tab="saved">
        <span class="material-icons">bookmark</span> Zapisane
      </button>
      <button class="offers-tab" role="tab" data-tab="vouchers">
        <span class="material-icons">card_giftcard</span> Vouchery
      </button>
      <button class="offers-tab" role="tab" data-tab="bundles">
        <span class="material-icons">inventory_2</span> Pakiety
      </button>
      <button class="offers-tab" role="tab" data-tab="subscriptions">
        <span class="material-icons">autorenew</span> Subskrypcje
      </button>
    </div>

    <div class="offers-controls">
      <label for="offersSortSelect" class="sr-only">Sortuj oferty</label>
      <select id="offersSortSelect" class="auth-input offers-sort">
        <option value="newest">Najnowsze</option>
        <option value="discount">Największy rabat</option>
        <option value="expiry">Kończą się</option>
        <option value="popular">Popularne</option>
      </select>

      <div class="offers-view-toggle">
        <button id="offersViewGrid" class="view-btn-booksy active" title="Widok siatki">
          <span class="material-icons">grid_view</span>
        </button>
        <button id="offersViewList" class="view-btn-booksy" title="Widok listy">
          <span class="material-icons">view_list</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Category chip filters -->
  <div class="market-cat-chips" id="offersCatChips" role="group" aria-label="Filtruj kategorię">
    <button type="button" class="market-cat-chip active" data-cat="">Wszystkie</button>
    <button type="button" class="market-cat-chip" data-cat="Barber">Barber</button>
    <button type="button" class="market-cat-chip" data-cat="Fryzjer">Fryzjer</button>
    <button type="button" class="market-cat-chip" data-cat="Paznokcie">Paznokcie</button>
    <button type="button" class="market-cat-chip" data-cat="Masaż">Masaż</button>
    <button type="button" class="market-cat-chip" data-cat="Kosmetyczka">Kosmetyczka</button>
  </div>

  <!-- Flash deal countdown banner -->
  <div id="flashDealBanner" class="flash-deal-banner hidden">
    <span class="material-icons">flash_on</span>
    <strong>Oferta flash!</strong>
    <span id="flashDealText"></span>
    <span class="flash-deal-timer" id="flashDealTimer"></span>
    <button id="flashDealBtn" class="btn btn-accent btn-sm">Skorzystaj</button>
  </div>

  <div id="offersGrid" class="offers-grid" role="list" aria-live="polite"></div>

  <!-- Vouchers panel -->
  <div id="offersVouchersPanel" class="hidden">
    <div class="offers-panel-head">
      <h2><span class="material-icons">card_giftcard</span> Vouchery prezentowe</h2>
      <p>Kup voucher i podaruj go bliskiej osobie</p>
    </div>
    <div class="mkt-vouchers-grid" id="offersVouchersGrid">
      <div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>
    </div>
    <div class="offers-panel-cta">
      <a href="/luminaphp/?page=marketplace#giftVouchers" class="btn btn-accent">
        <span class="material-icons">open_in_new</span> Pełna oferta voucherów
      </a>
    </div>
  </div>

  <!-- Bundles panel -->
  <div id="offersBundlesPanel" class="hidden">
    <div class="offers-panel-head">
      <h2><span class="material-icons">inventory_2</span> Pakiety usług</h2>
      <p>Zestawy usług w jednej, korzystnej cenie</p>
    </div>
    <div class="mkt-bundles-grid" id="offersBundlesGrid">
      <div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>
    </div>
  </div>

  <!-- Subscriptions panel -->
  <div id="offersSubscriptionsPanel" class="hidden">
    <div class="offers-panel-head">
      <h2><span class="material-icons">autorenew</span> Miesięczne pakiety</h2>
      <p>Regularne wizyty w stałej, korzystnej cenie</p>
    </div>
    <div class="mkt-subs-grid" id="offersSubsGrid">
      <div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>
    </div>
  </div>

  <div class="offers-load-more">
    <button id="offersLoadMoreBtn" class="btn btn-ghost hidden">
      <span class="material-icons">expand_more</span> Pokaż więcej
    </button>
  </div>
</div>

<!-- Share Offer Modal -->
<div id="shareOfferModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="shareOfferTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="profile-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <h2 id="shareOfferTitle">Podziel się ofertą</h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('shareOfferModal').classList.add('hidden')"
        aria-label="Zamknij">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="profile-modal-body">
      <div class="share-link-row">
        <input type="text" id="shareOfferLink" class="auth-input" readonly>
        <button id="copyShareLinkBtn" class="btn btn-accent btn-sm">
          <span class="material-icons">content_copy</span> Kopiuj
        </button>
      </div>
      <div class="share-socials">
        <button class="btn btn-ghost share-social-btn" data-platform="whatsapp">
          <span class="material-icons">chat</span> WhatsApp
        </button>
        <button class="btn btn-ghost share-social-btn" data-platform="facebook">
          <span class="material-icons">thumb_up</span> Facebook
        </button>
        <button class="btn btn-ghost share-social-btn" data-platform="copy">
          <span class="material-icons">link</span> Kopiuj link
        </button>
      </div>
    </div>
  </div>
</div>
