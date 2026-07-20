<?php /* Marketplace — Discovery, Flash Deals, Vouchery, Pakiety, Subskrypcje, Rezerwacje grupowe */ ?>
<div class="mkt-page">

  <!-- HERO -->
  <section class="mkt-hero">
    <div class="mkt-hero-bg" aria-hidden="true"></div>
    <div class="mkt-hero-content container">
      <div class="mkt-hero-badge"><span class="material-icons">storefront</span> Marketplace</div>
      <h1>Odkryj najlepsze oferty<br><span>beauty w Twojej okolicy</span></h1>
      <p>Flash deale, vouchery prezentowe, pakiety spa i wiele więcej</p>
      <div class="mkt-hero-actions">
        <a href="#flashDeals" class="btn btn-accent">
          <span class="material-icons">flash_on</span> Flash deale
        </a>
        <a href="#topWeek" class="btn btn-ghost mkt-hero-ghost-btn">
          <span class="material-icons">emoji_events</span> Top tygodnia
        </a>
      </div>
      <div class="mkt-hero-subactions" style="margin-top:1rem;display:flex;gap:.75rem;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" type="button">Najlepsze okazje</button>
        <button class="btn btn-ghost btn-sm" type="button">Dziś dostępne</button>
        <button class="btn btn-ghost btn-sm" type="button">Pokaż vouchery</button>
      </div>
    </div>
  </section>

  <!-- FLASH DEALS -->
  <section class="mkt-section" id="flashDeals">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-flash">
            <span class="material-icons">flash_on</span> Flash deale
          </span>
          <h2>Sloty ostatniej chwili</h2>
          <p>Wolne terminy za 2–6 godzin — do 30% taniej</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="flashRefreshBtn">
          <span class="material-icons">refresh</span> Odśwież
        </button>
      </div>
      <div id="flashDealsGrid" class="mkt-flash-grid">
        <div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>
      </div>
    </div>
  </section>

  <!-- TOP OF THE WEEK -->
  <section class="mkt-section mkt-section-alt" id="topWeek">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-top">
            <span class="material-icons">emoji_events</span> Ranking
          </span>
          <h2>Top tygodnia</h2>
          <p>Najlepiej oceniane salony tego tygodnia</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="topWeekRefreshBtn">
          <span class="material-icons">refresh</span> Odśwież
        </button>
      </div>
      <div id="topWeekList" class="mkt-top-list">
        <div class="spinner" style="margin:3rem auto"></div>
      </div>
    </div>
  </section>

  <!-- CATEGORY LANDINGS -->
  <section class="mkt-section" id="catLandings">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-cat">
            <span class="material-icons">category</span> Kategorie
          </span>
          <h2>Eksploruj według kategorii</h2>
          <p>Znajdź specjalistów w swojej dziedzinie</p>
        </div>
      </div>
      <div class="mkt-cat-landings-grid">
        <a href="/luminaphp/?page=explore&amp;cat=Fryzjer" class="mkt-cat-landing" style="--cat-color:#1a4731">
          <div class="mkt-cat-landing-img">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&amp;auto=format" alt="Fryzjer" loading="lazy">
          </div>
          <div class="mkt-cat-landing-body">
            <span class="material-icons">face</span>
            <h3>Fryzjer</h3>
            <p>Strzyżenie, koloryzacja, stylizacja</p>
          </div>
        </a>
        <a href="/luminaphp/?page=explore&amp;cat=Paznokcie" class="mkt-cat-landing" style="--cat-color:#5b1e6e">
          <div class="mkt-cat-landing-img">
            <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&amp;auto=format" alt="Paznokcie" loading="lazy">
          </div>
          <div class="mkt-cat-landing-body">
            <span class="material-icons">colorize</span>
            <h3>Paznokcie</h3>
            <p>Manicure, pedicure, żel, hybryda</p>
          </div>
        </a>
        <a href="/luminaphp/?page=explore&amp;cat=Masa%C5%BC" class="mkt-cat-landing" style="--cat-color:#1e3a5f">
          <div class="mkt-cat-landing-img">
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&amp;auto=format" alt="Masaż i Spa" loading="lazy">
          </div>
          <div class="mkt-cat-landing-body">
            <span class="material-icons">spa</span>
            <h3>Masaż &amp; Spa</h3>
            <p>Relaks, odnowa, wellness</p>
          </div>
        </a>
        <a href="/luminaphp/?page=explore&amp;cat=Barber" class="mkt-cat-landing" style="--cat-color:#1e2a4a">
          <div class="mkt-cat-landing-img">
            <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&amp;auto=format" alt="Barber" loading="lazy">
          </div>
          <div class="mkt-cat-landing-body">
            <span class="material-icons">content_cut</span>
            <h3>Barber</h3>
            <p>Strzyżenie, golenie, broda</p>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- GIFT VOUCHERS -->
  <section class="mkt-section mkt-section-alt" id="giftVouchers">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-voucher">
            <span class="material-icons">card_giftcard</span> Vouchery
          </span>
          <h2>Vouchery prezentowe</h2>
          <p>Podaruj bliskiej osobie wizytę w salonie — wyślij na e-mail</p>
        </div>
      </div>
      <div class="mkt-vouchers-grid">
        <?php
        $voucherAmounts = [
          ['amount' => 50,  'label' => '50 zł',  'desc' => 'Drobny upominek',         'popular' => false],
          ['amount' => 100, 'label' => '100 zł', 'desc' => 'Idealny prezent',          'popular' => true],
          ['amount' => 200, 'label' => '200 zł', 'desc' => 'Luksusowe doświadczenie',  'popular' => false],
          ['amount' => 500, 'label' => '500 zł', 'desc' => 'Kompletny dzień spa',      'popular' => false],
        ];
        foreach ($voucherAmounts as $v):
          $label = htmlspecialchars($v['label'], ENT_QUOTES|ENT_HTML5, 'UTF-8');
          $desc  = htmlspecialchars($v['desc'],  ENT_QUOTES|ENT_HTML5, 'UTF-8');
        ?>
        <div class="mkt-voucher-card<?= $v['popular'] ? ' mkt-voucher-popular' : '' ?>">
          <?php if ($v['popular']): ?>
          <div class="mkt-voucher-popular-badge">Popularny</div>
          <?php endif; ?>
          <div class="mkt-voucher-amount"><?= $label ?></div>
          <div class="mkt-voucher-desc"><?= $desc ?></div>
          <button class="btn btn-accent btn-sm mkt-voucher-btn"
            onclick="window.openVoucherModal?.(<?= $v['amount'] ?>)">
            <span class="material-icons">card_giftcard</span> Kup voucher
          </button>
        </div>
        <?php endforeach; ?>
        <div class="mkt-voucher-card mkt-voucher-custom">
          <div class="mkt-voucher-amount">Dowolna kwota</div>
          <div class="mkt-voucher-desc">Wpisz własną wartość</div>
          <div class="mkt-voucher-custom-input">
            <input type="number" id="customVoucherAmount" class="auth-input"
              placeholder="np. 150" min="10" max="2000" step="10">
            <span>zł</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="window.openVoucherModal?.(0)">
            <span class="material-icons">add</span> Kup voucher
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- BUNDLE PACKAGES -->
  <section class="mkt-section" id="bundles">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-bundle">
            <span class="material-icons">inventory_2</span> Pakiety
          </span>
          <h2>Pakiety usług</h2>
          <p>Zaoszczędź więcej, zamawiając zestawy usług</p>
        </div>
      </div>
      <div id="bundlesGrid" class="mkt-bundles-grid">
        <div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>
      </div>
    </div>
  </section>

  <!-- SUBSCRIPTIONS -->
  <section class="mkt-section mkt-section-alt" id="subscriptions">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-sub">
            <span class="material-icons">autorenew</span> Subskrypcje
          </span>
          <h2>Miesięczne pakiety</h2>
          <p>Regularne wizyty w stałej, korzystnej cenie</p>
        </div>
      </div>
      <div id="subscriptionsGrid" class="mkt-subs-grid">
        <div class="spinner" style="grid-column:1/-1;margin:3rem auto"></div>
      </div>
    </div>
  </section>

  <!-- GROUP BOOKING -->
  <section class="mkt-section" id="groupBookingSection">
    <div class="container">
      <div class="mkt-group-banner">
        <div class="mkt-group-icon"><span class="material-icons">group</span></div>
        <div class="mkt-group-copy">
          <h2>Rezerwacja grupowa</h2>
          <p>Przyjdź z przyjaciółmi lub współpracownikami — zarezerwuj kilka miejsc jednocześnie.
             Idealne na wieczory panieńskie, team building i urodziny.</p>
          <button class="btn btn-accent" onclick="window.openGroupBookingModal?.()">
            <span class="material-icons">group_add</span> Zarezerwuj grupowo
          </button>
        </div>
        <div class="mkt-group-img" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&amp;auto=format"
            alt="" loading="lazy">
        </div>
      </div>
    </div>
  </section>

  <!-- SEASONAL CAMPAIGNS -->
  <section class="mkt-section mkt-section-alt" id="seasonal">
    <div class="container">
      <div class="mkt-section-head">
        <div>
          <span class="mkt-section-badge mkt-badge-seasonal">
            <span class="material-icons">celebration</span> Kampanie
          </span>
          <h2>Sezonowe promocje</h2>
          <p>Specjalne oferty dopasowane do sezonu</p>
        </div>
      </div>
      <div id="seasonalGrid" class="mkt-seasonal-grid"></div>
    </div>
  </section>

</div>

<!-- Voucher Modal -->
<div id="voucherModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="voucherModalTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="profile-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <h2 id="voucherModalTitle">Kup voucher prezentowy</h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('voucherModal').classList.add('hidden')"
        aria-label="Zamknij">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="profile-modal-body">
      <div class="auth-field">
        <label for="voucherAmount">Wartość vouchera (zł)</label>
        <input type="number" id="voucherAmount" class="auth-input"
          placeholder="np. 100" min="10" max="2000" step="10">
      </div>
      <div class="auth-field">
        <label for="voucherRecipientName">Imię obdarowanego</label>
        <input type="text" id="voucherRecipientName" class="auth-input"
          placeholder="Imię i nazwisko" autocomplete="off">
      </div>
      <div class="auth-field">
        <label for="voucherRecipientEmail">E-mail obdarowanego</label>
        <input type="email" id="voucherRecipientEmail" class="auth-input"
          placeholder="adres@email.com" autocomplete="off">
      </div>
      <div class="auth-field">
        <label for="voucherMessage">Wiadomość (opcjonalna)</label>
        <textarea id="voucherMessage" class="auth-input" rows="3"
          placeholder="Życz coś miłego..."></textarea>
      </div>
    </div>
    <div class="profile-modal-foot">
      <button class="profile-cancel-btn"
        onclick="document.getElementById('voucherModal').classList.add('hidden')">Anuluj</button>
      <button class="profile-save-btn" onclick="window.purchaseVoucher?.()">
        <span class="material-icons" style="font-size:1rem">card_giftcard</span> Kup i wyślij
      </button>
    </div>
  </div>
</div>

<!-- Group Booking Modal -->
<div id="groupBookingModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="groupBookingTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="profile-modal mkt-group-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <h2 id="groupBookingTitle">Rezerwacja grupowa</h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('groupBookingModal').classList.add('hidden')"
        aria-label="Zamknij">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="profile-modal-body">
      <div class="auth-field" style="position:relative">
        <label for="groupSalonSearch">Wybierz salon</label>
        <input type="text" id="groupSalonSearch" class="auth-input"
          placeholder="Szukaj salonu..." autocomplete="off">
        <div id="groupSalonResults" class="mkt-group-salon-results"></div>
      </div>
      <div class="auth-field">
        <label for="groupPeople">Liczba osób</label>
        <input type="number" id="groupPeople" class="auth-input"
          min="2" max="20" value="2" placeholder="2">
      </div>
      <div class="auth-field">
        <label for="groupDate">Preferowana data</label>
        <input type="date" id="groupDate" class="auth-input">
      </div>
      <div class="auth-field">
        <label for="groupService">Usługa</label>
        <input type="text" id="groupService" class="auth-input"
          placeholder="np. manicure, strzyżenie...">
      </div>
      <div class="auth-field">
        <label for="groupNote">Dodatkowe informacje</label>
        <textarea id="groupNote" class="auth-input" rows="2"
          placeholder="Okazja, życzenia, uwagi..."></textarea>
      </div>
    </div>
    <div class="profile-modal-foot">
      <button class="profile-cancel-btn"
        onclick="document.getElementById('groupBookingModal').classList.add('hidden')">Anuluj</button>
      <button class="profile-save-btn" onclick="window.submitGroupBooking?.()">
        <span class="material-icons" style="font-size:1rem">group_add</span> Wyślij zapytanie
      </button>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
