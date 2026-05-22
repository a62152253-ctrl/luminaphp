<?php /* Client Dashboard — premium */ ?>
<div class="dashboard-layout dash-pro">

  <aside class="dashboard-sidebar">
    <div class="sidebar-user">
      <div class="sidebar-avatar-wrap">
        <img id="sidebarAvatar" src="https://i.pravatar.cc/200" alt="Avatar" class="sidebar-avatar">
        <span class="sidebar-online"></span>
      </div>
      <div id="sidebarName" class="sidebar-name">Użytkownik</div>
      <div class="sidebar-status">Konto aktywne</div>
      <div class="sidebar-user-pill">
        <span class="material-icons">verified</span>
        Klient Lumina
      </div>
    </div>

    <div id="sidebarLoyalty" class="sidebar-loyalty-slot"></div>

    <nav class="sidebar-nav">
      <a href="#" class="sidebar-link active" data-tab="overview">
        <span class="sidebar-link-main"><span class="material-icons">dashboard</span><span>Przegląd</span></span>
      </a>
      <a href="#" class="sidebar-link" data-tab="bookings">
        <span class="sidebar-link-main"><span class="material-icons">calendar_today</span><span>Moje wizyty</span></span>
        <span class="sidebar-link-badge" id="sidebarBookingsCount">0</span>
      </a>
      <a href="#" class="sidebar-link" data-tab="favorites">
        <span class="sidebar-link-main"><span class="material-icons">favorite</span><span>Ulubione</span></span>
        <span class="sidebar-link-badge" id="sidebarFavoritesCount">0</span>
      </a>
      <a href="#" class="sidebar-link" data-tab="reviews">
        <span class="sidebar-link-main"><span class="material-icons">star</span><span>Moje opinie</span></span>
        <span class="sidebar-link-badge" id="sidebarReviewsCount">0</span>
      </a>
      <a href="#" class="sidebar-link" data-tab="stats">
        <span class="sidebar-link-main"><span class="material-icons">bar_chart</span><span>Moje statystyki</span></span>
      </a>
      <a href="#" class="sidebar-link" data-tab="dla-ciebie">
        <span class="sidebar-link-main"><span class="material-icons">auto_awesome</span><span>Dla Ciebie</span></span>
      </a>
      <a href="#" class="sidebar-link" data-tab="finanse">
        <span class="sidebar-link-main"><span class="material-icons">account_balance_wallet</span><span>Finanse</span></span>
      </a>
    </nav>

    <div class="dash-shortcuts-sidebar">
      <a href="/luminaphp/?page=chat" class="dash-shortcut" data-href="/luminaphp/?page=chat"><span class="material-icons">chat</span> Wiadomości</a>
      <a href="/luminaphp/?page=loyalty" class="dash-shortcut" data-href="/luminaphp/?page=loyalty"><span class="material-icons">emoji_events</span> Lojalność</a>
      <a href="/luminaphp/?page=referral" class="dash-shortcut" data-href="/luminaphp/?page=referral"><span class="material-icons">card_giftcard</span> Polecenia</a>
    </div>

    <div class="sidebar-footer">
      <a href="/luminaphp/?page=explore" class="sidebar-link">
        <span class="sidebar-link-main"><span class="material-icons">search</span><span>Eksploruj salony</span></span>
      </a>
      <a href="/luminaphp/?page=profile" class="sidebar-link">
        <span class="sidebar-link-main"><span class="material-icons">person</span><span>Mój profil</span></span>
      </a>
      <button type="button" class="sidebar-link" onclick="logout()">
        <span class="sidebar-link-main"><span class="material-icons">logout</span><span>Wyloguj</span></span>
      </button>
    </div>
  </aside>

  <main class="dashboard-content" id="dashboardContent">

    <div class="dashboard-mobile-tabs">
      <button type="button" class="dashboard-mobile-tab active" data-tab="overview"><span class="material-icons">dashboard</span><span>Start</span></button>
      <button type="button" class="dashboard-mobile-tab" data-tab="bookings"><span class="material-icons">calendar_today</span><span>Wizyty</span><span class="dashboard-mobile-tab-badge" id="mobileBookingsCount">0</span></button>
      <button type="button" class="dashboard-mobile-tab" data-tab="favorites"><span class="material-icons">favorite</span><span>Ulubione</span><span class="dashboard-mobile-tab-badge" id="mobileFavoritesCount">0</span></button>
      <button type="button" class="dashboard-mobile-tab" data-tab="reviews"><span class="material-icons">star</span><span>Opinie</span><span class="dashboard-mobile-tab-badge" id="mobileReviewsCount">0</span></button>
      <button type="button" class="dashboard-mobile-tab" data-tab="stats"><span class="material-icons">bar_chart</span><span>Stat</span></button>
      <button type="button" class="dashboard-mobile-tab" data-tab="dla-ciebie"><span class="material-icons">auto_awesome</span><span>Dla Ciebie</span></button>
      <button type="button" class="dashboard-mobile-tab" data-tab="finanse"><span class="material-icons">account_balance_wallet</span><span>Finanse</span></button>
    </div>

    <!-- OVERVIEW -->
    <div class="dash-tab" data-tab="overview">
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <span class="dashboard-inline-label">Panel klienta</span>
          <h1 id="dashboardHeroTitle">Witaj ponownie</h1>
          <p id="dashboardHeroText">Twoje wizyty i salony w jednym miejscu.</p>
          <div class="dashboard-quick-actions">
            <button type="button" class="dashboard-action-btn" data-action="focus-next"><span class="material-icons">near_me</span><span>Najbliższa</span></button>
            <button type="button" class="dashboard-action-btn" data-action="calendar"><span class="material-icons">event_available</span><span>Kalendarz</span></button>
            <button type="button" class="dashboard-action-btn" data-action="book-again"><span class="material-icons">replay</span><span>Zarezerwuj ponownie</span></button>
            <button type="button" class="dashboard-action-btn" data-action="reminder"><span class="material-icons">alarm_add</span><span>Przypomnienie</span></button>
            <button type="button" class="dashboard-action-btn" data-action="copy"><span class="material-icons">content_copy</span><span>Kopiuj plan</span></button>
            <button type="button" class="dashboard-action-btn" data-action="export"><span class="material-icons">download</span><span>CSV</span></button>
            <button type="button" class="dashboard-action-btn" data-action="profile"><span class="material-icons">person</span><span>Profil</span></button>
          </div>
        </div>
        <div class="dashboard-next-card" id="nextVisitCard">
          <div class="dashboard-next-card-head">
            <span class="dashboard-inline-label">Najbliższa wizyta</span>
            <span class="dashboard-inline-pill" id="nextVisitStatus">—</span>
          </div>
          <div id="nextVisitCountdown" class="dash-countdown hidden" aria-live="polite">
            <div class="dash-countdown-item"><span id="cdDays">0</span><label>dni</label></div>
            <div class="dash-countdown-sep">:</div>
            <div class="dash-countdown-item"><span id="cdHours">00</span><label>godz</label></div>
            <div class="dash-countdown-sep">:</div>
            <div class="dash-countdown-item"><span id="cdMins">00</span><label>min</label></div>
            <div class="dash-countdown-sep">:</div>
            <div class="dash-countdown-item"><span id="cdSecs">00</span><label>sek</label></div>
          </div>
          <h2 id="nextVisitService">Brak zaplanowanej wizyty</h2>
          <p id="nextVisitBusiness">Zarezerwuj termin w ulubionym salonie.</p>
          <div class="dashboard-next-meta">
            <div class="dashboard-next-meta-item"><span class="material-icons">event</span><span id="nextVisitDate">—</span></div>
            <div class="dashboard-next-meta-item"><span class="material-icons">schedule</span><span id="nextVisitTime">—</span></div>
            <div class="dashboard-next-meta-item"><span class="material-icons">storefront</span><span id="nextVisitSalon">—</span></div>
          </div>
          <div class="dashboard-next-footer">
            <span class="dashboard-next-note" id="nextVisitNote">—</span>
            <div class="dash-next-actions">
              <button type="button" id="waitlistBtn" class="dashboard-ghost-link hidden" onclick="window.openWaitlistModal?.()">
                <span class="material-icons">queue</span><span>Lista oczekujących</span>
              </button>
              <a href="/luminaphp/?page=explore" id="nextVisitCta" class="dashboard-primary-link"><span class="material-icons">add</span><span>Nowa rezerwacja</span></a>
            </div>
          </div>
        </div>
      </section>

      <div class="dash-overview-grid">
        <div class="dash-overview-stat"><span class="material-icons">upcoming</span><strong id="overviewUpcoming">0</strong><label>Nadchodzące</label></div>
        <div class="dash-overview-stat"><span class="material-icons">favorite</span><strong id="overviewFavorites">0</strong><label>Ulubione</label></div>
        <div class="dash-overview-stat"><span class="material-icons">star</span><strong id="overviewReviews">0</strong><label>Opinie</label></div>
      </div>

      <div id="overviewNextStrip" class="dash-next-strip"></div>

      <section class="dash-marketplace" aria-labelledby="dash-market-heading">
        <div class="dash-marketplace-head">
          <div>
            <h2 id="dash-market-heading">Marketplace</h2>
            <p>Odkryj salony i zarezerwuj wizytę w kilka kliknięć</p>
          </div>
          <a href="/luminaphp/?page=explore" class="dash-marketplace-link">
            Zobacz wszystkie <span class="material-icons" style="font-size:1rem">arrow_forward</span>
          </a>
        </div>
        <div class="dash-marketplace-actions">
          <a href="/luminaphp/?page=explore" class="dash-market-action"><span class="material-icons">search</span> Szukaj salonów</a>
          <a href="/luminaphp/?page=map" class="dash-market-action"><span class="material-icons">map</span> Mapa</a>
          <a href="/luminaphp/?page=offers" class="dash-market-action"><span class="material-icons">local_offer</span> Promocje</a>
        </div>
        <div id="dashMarketplacePicks" class="dash-marketplace-grid" aria-live="polite"></div>
      </section>

      <div class="dash-widgets-row">
        <section class="dash-widget">
          <h3><span class="material-icons">history</span> Ostatnia aktywność</h3>
          <div id="activityFeed" class="dash-activity-feed"></div>
        </section>
        <section class="dash-widget">
          <h3><span class="material-icons">calendar_month</span> Kalendarz</h3>
          <div id="miniCalendar"></div>
        </section>
      </div>
    </div>

    <!-- BOOKINGS -->
    <div class="dash-tab hidden" data-tab="bookings">
      <div class="stats-grid stats-grid--dashboard stats-grid--5">
        <div class="stat-card"><div class="stat-card-icon dashboard-icon-indigo"><span class="material-icons">check_circle</span></div><div class="stat-card-val" id="statConfirmed">0</div><div class="stat-card-label">Potwierdzone</div></div>
        <div class="stat-card"><div class="stat-card-icon dashboard-icon-amber"><span class="material-icons">schedule</span></div><div class="stat-card-val" id="statPending">0</div><div class="stat-card-label">Oczekujące</div></div>
        <div class="stat-card"><div class="stat-card-icon dashboard-icon-emerald"><span class="material-icons">upcoming</span></div><div class="stat-card-val" id="statUpcoming">0</div><div class="stat-card-label">Nadchodzące</div></div>
        <div class="stat-card"><div class="stat-card-icon dashboard-icon-violet"><span class="material-icons">payments</span></div><div class="stat-card-val" id="statSpent">0 zł</div><div class="stat-card-label">Wydatki</div></div>
        <div class="stat-card"><div class="stat-card-icon dashboard-icon-rose"><span class="material-icons">event_note</span></div><div class="stat-card-val" id="statTotal">0</div><div class="stat-card-label">Łącznie</div></div>
      </div>

      <div class="dashboard-list-topbar">
        <div class="dashboard-search-wrap">
          <span class="material-icons">search</span>
          <input type="search" id="bookingSearchInput" class="dashboard-search-input" placeholder="Szukaj usługi, salonu, daty…" autocomplete="off">
        </div>
        <div class="dashboard-filter-group">
          <button type="button" class="dashboard-filter active" data-filter="all">Wszystkie</button>
          <button type="button" class="dashboard-filter" data-filter="upcoming">Nadchodzące</button>
          <button type="button" class="dashboard-filter" data-filter="history">Historia</button>
          <button type="button" class="dashboard-filter" data-filter="cancelled">Anulowane</button>
        </div>
        <div class="dash-view-toggle">
          <button type="button" class="dash-view-btn active" data-view="list" title="Lista"><span class="material-icons">view_list</span></button>
          <button type="button" class="dash-view-btn" data-view="timeline" title="Oś czasu"><span class="material-icons">timeline</span></button>
        </div>
        <div class="dashboard-inline-pill" id="appointmentsMeta">Ładowanie…</div>
      </div>

      <div class="bookings-list">
        <div class="bookings-list-header">
          <div>
            <h2>Rezerwacje</h2>
            <p id="bookingsSubtitle">Twoje wizyty</p>
          </div>
          <a href="/luminaphp/?page=explore" class="dashboard-primary-link"><span class="material-icons">add</span><span>Nowa rezerwacja</span></a>
        </div>
        <div id="appointmentsList"><div class="spinner" style="margin:3rem auto"></div></div>
        <div id="appointmentsTimeline" class="hidden"></div>
      </div>
    </div>

    <!-- FAVORITES -->
    <div class="dash-tab hidden" data-tab="favorites">
      <div class="dashboard-heading"><div><h1>Ulubione salony</h1><p>Szybki powrót do sprawdzonych miejsc.</p></div></div>
      <div class="dashboard-tab-banner"><div><span class="dashboard-inline-label">Zapisane</span><h2>Rezerwuj bez szukania od zera</h2></div><div class="dashboard-inline-pill" id="favoritesMeta">Ładowanie…</div></div>
      <div id="favoritesGrid" class="fav-grid"></div>
    </div>

    <!-- REVIEWS -->
    <div class="dash-tab hidden" data-tab="reviews">
      <div class="dashboard-heading"><div><h1>Moje opinie</h1><p>Historia Twoich ocen salonów.</p></div></div>
      <div class="dashboard-tab-banner"><div><span class="dashboard-inline-label">Twój głos</span><h2>Wszystkie wystawione opinie</h2></div><div class="dashboard-inline-pill" id="reviewsMeta">Ładowanie…</div></div>
      <div id="reviewsList"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- STATS -->
    <div class="dash-tab hidden" data-tab="stats">
      <div class="dashboard-heading">
        <div>
          <h1>Moje statystyki</h1>
          <p>Twoja aktywność w Lumina — wydatki, wizyty, oszczędności</p>
        </div>
        <div class="dash-heading-actions">
          <select id="statsPeriodSelect" class="auth-input" style="max-width:160px">
            <option value="30">Ostatnie 30 dni</option>
            <option value="90">Ostatnie 3 miesiące</option>
            <option value="365">Ostatni rok</option>
            <option value="all">Cały czas</option>
          </select>
          <button id="statsExportBtn" class="btn btn-ghost btn-sm">
            <span class="material-icons">download</span> Eksportuj
          </button>
        </div>
      </div>

      <!-- KPI row -->
      <div class="stats-grid stats-grid--dashboard stats-grid--4">
        <div class="stat-card">
          <div class="stat-card-icon dashboard-icon-indigo"><span class="material-icons">event_available</span></div>
          <div class="stat-card-val" id="statsVisitsTotal">—</div>
          <div class="stat-card-label">Wizyt łącznie</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon dashboard-icon-emerald"><span class="material-icons">payments</span></div>
          <div class="stat-card-val" id="statsSpentTotal">— zł</div>
          <div class="stat-card-label">Wydatki</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon dashboard-icon-amber"><span class="material-icons">savings</span></div>
          <div class="stat-card-val" id="statsSavedTotal">— zł</div>
          <div class="stat-card-label">Zaoszczędzone (rabaty)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon dashboard-icon-violet"><span class="material-icons">emoji_events</span></div>
          <div class="stat-card-val" id="statsPointsEarned">—</div>
          <div class="stat-card-label">Punkty zdobyte</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="dash-widgets-row">
        <section class="dash-widget" style="flex:2">
          <h3><span class="material-icons">show_chart</span> Wizyty w czasie</h3>
          <canvas id="statsVisitsChart" height="200" aria-label="Wykres wizyt" role="img"></canvas>
        </section>
        <section class="dash-widget">
          <h3><span class="material-icons">pie_chart</span> Kategorie</h3>
          <canvas id="statsCatChart" height="200" aria-label="Wykres kategorii" role="img"></canvas>
        </section>
      </div>

      <!-- Top salons -->
      <section class="dash-widget" style="margin-top:1.25rem">
        <h3><span class="material-icons">storefront</span> Najczęściej odwiedzane salony</h3>
        <div id="statsTopSalons" class="dash-top-salons" aria-live="polite"></div>
      </section>

      <!-- Monthly expense + budget -->
      <section class="dash-widget" style="margin-top:1.25rem">
        <div class="dash-widget-head">
          <h3><span class="material-icons">payments</span> Wydatki miesięczne</h3>
          <div class="dash-budget-controls">
            <label for="monthlyBudget" class="dash-budget-label">Budżet:</label>
            <input type="number" id="monthlyBudget" class="auth-input dash-budget-input" placeholder="500" min="0" step="10">
            <span class="dash-budget-unit">zł/mc</span>
            <button id="saveBudgetBtn" class="btn btn-ghost btn-sm" title="Zapisz budżet"><span class="material-icons">save</span></button>
          </div>
        </div>
        <canvas id="statsMonthlyChart" height="160" aria-label="Wykres wydatków miesięcznych" role="img"></canvas>
      </section>

      <!-- Reminder toggle -->
      <section class="features-card" style="margin-top:1.25rem">
        <h3><span class="material-icons">alarm</span> Przypomnienia o wizytach</h3>
        <div class="notif-pref-list">
          <div class="notif-pref-row">
            <div>
              <strong>24h przed wizytą</strong>
              <p class="text-muted">Przypomnienie e-mail dzień wcześniej</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="reminder24h" checked>
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="notif-pref-row">
            <div>
              <strong>1h przed wizytą</strong>
              <p class="text-muted">Powiadomienie push godzinę wcześniej</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="reminder1h" checked>
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="notif-pref-row">
            <div>
              <strong>Propozycja rezerwacji</strong>
              <p class="text-muted">Przypomnienie gdy minie 4 tygodnie od ostatniej wizyty</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="reminderRebook">
              <span class="toggle-track"></span>
            </label>
          </div>
        </div>
        <button id="saveRemindersBtn" class="btn btn-accent btn-sm" style="margin-top:.75rem">
          <span class="material-icons">save</span> Zapisz preferencje
        </button>
      </section>
    </div>

    <!-- DLA CIEBIE -->
    <div class="dash-tab hidden" data-tab="dla-ciebie">
      <div class="dashboard-heading">
        <div>
          <h1>Dla Ciebie</h1>
          <p>Rekomendacje AI, beauty journal i Twoje inspiracje stylistyczne.</p>
        </div>
      </div>

      <section class="dash-widget" style="margin-bottom:1.25rem">
        <h3><span class="material-icons">auto_awesome</span> Rekomendacje AI</h3>
        <p class="dash-section-hint">Na podstawie Twojej historii wizyt.</p>
        <div id="aiRecsGrid" class="dash-recs-grid" aria-live="polite"></div>
      </section>

      <section class="dash-widget" style="margin-bottom:1.25rem">
        <div class="dash-widget-head">
          <h3><span class="material-icons">menu_book</span> Beauty Journal</h3>
          <button type="button" class="btn btn-accent btn-sm" id="addJournalBtn">
            <span class="material-icons">add</span> Dodaj notatkę
          </button>
        </div>
        <div id="journalList" class="dash-journal-list" aria-live="polite"></div>
      </section>

      <section class="dash-widget">
        <div class="dash-widget-head">
          <h3><span class="material-icons">collections</span> Zapisane style</h3>
          <button type="button" class="btn btn-ghost btn-sm" id="addStyleBtn">
            <span class="material-icons">add_photo_alternate</span> Dodaj
          </button>
        </div>
        <div id="savedStylesGrid" class="dash-styles-grid" aria-live="polite"></div>
      </section>
    </div>

    <!-- FINANSE -->
    <div class="dash-tab hidden" data-tab="finanse">
      <div class="dashboard-heading">
        <div>
          <h1>Finanse & Nagrody</h1>
          <p>Karty podarunkowe, abonamenty i Twoje osobiste rabaty.</p>
        </div>
      </div>

      <section class="dash-widget" style="margin-bottom:1.25rem">
        <div class="dash-widget-head">
          <h3><span class="material-icons">card_giftcard</span> Karty podarunkowe</h3>
          <a href="/luminaphp/?page=offers" class="btn btn-ghost btn-sm">
            <span class="material-icons">shopping_bag</span> Kup kartę
          </a>
        </div>
        <div class="dash-gift-check">
          <input type="text" id="giftCardCode" class="auth-input" placeholder="Wpisz kod (np. LUMINA-XXXX)" maxlength="25">
          <button type="button" class="btn btn-accent btn-sm" id="checkGiftBtn">
            <span class="material-icons">search</span> Sprawdź saldo
          </button>
        </div>
        <div id="giftCardResult" class="dash-gift-result hidden"></div>
        <div id="myGiftCards" class="dash-gift-list" aria-live="polite"></div>
      </section>

      <section class="dash-widget" style="margin-bottom:1.25rem">
        <h3><span class="material-icons">subscriptions</span> Pakiety subskrypcyjne</h3>
        <div id="subscriptionsList" class="dash-subs-list" aria-live="polite"></div>
      </section>

      <section class="dash-widget">
        <h3><span class="material-icons">local_offer</span> Moje rabaty & kupony</h3>
        <div id="myDiscounts" class="dash-discounts-list" aria-live="polite"></div>
      </section>
    </div>

  </main>

  <!-- Journal Modal -->
  <div id="journalModal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="journalModalTitle">
    <div class="modal-box">
      <div class="modal-header">
        <span id="journalModalTitle" class="modal-title">Nowa notatka w Beauty Journal</span>
        <button type="button" class="modal-close" id="closeJournalBtn" aria-label="Zamknij"><span class="material-icons">close</span></button>
      </div>
      <form id="journalForm" class="dash-modal-form">
        <label class="auth-label" for="journalTitle">Tytuł / usługa <span class="auth-required">*</span></label>
        <input type="text" id="journalTitle" class="auth-input" placeholder="np. Koloryzacja, strzyżenie…" maxlength="80" required>
        <label class="auth-label" for="journalNote" style="margin-top:.75rem">Notatka (kolor, formuła, uwagi)</label>
        <textarea id="journalNote" class="auth-input" rows="3" placeholder="np. 8.1 + oxy 20vol, czas 40min, efekt naturalny" maxlength="600"></textarea>
        <label class="auth-label" for="journalDate" style="margin-top:.75rem">Data wizyty</label>
        <input type="date" id="journalDate" class="auth-input">
        <div class="dash-modal-footer">
          <button type="button" class="btn btn-ghost" id="cancelJournalBtn">Anuluj</button>
          <button type="submit" class="btn btn-accent">Zapisz notatkę</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Style / Inspiration Modal -->
  <div id="styleModal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="styleModalTitle">
    <div class="modal-box">
      <div class="modal-header">
        <span id="styleModalTitle" class="modal-title">Dodaj inspirację</span>
        <button type="button" class="modal-close" id="closeStyleBtn" aria-label="Zamknij"><span class="material-icons">close</span></button>
      </div>
      <form id="styleForm" class="dash-modal-form">
        <label class="auth-label" for="styleUrl">URL zdjęcia <span class="auth-required">*</span></label>
        <input type="url" id="styleUrl" class="auth-input" placeholder="https://…" required>
        <label class="auth-label" for="styleTitle" style="margin-top:.75rem">Tytuł (opcjonalnie)</label>
        <input type="text" id="styleTitle" class="auth-input" placeholder="np. Balayage, bob" maxlength="60">
        <div class="dash-modal-footer">
          <button type="button" class="btn btn-ghost" id="cancelStyleBtn">Anuluj</button>
          <button type="submit" class="btn btn-accent">Zapisz</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Waitlist Modal -->
  <div id="waitlistModal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="waitlistModalTitle">
    <div class="modal-box">
      <div class="modal-header">
        <span id="waitlistModalTitle" class="modal-title">Dołącz do listy oczekujących</span>
        <button type="button" class="modal-close" id="closeWaitlistBtn" aria-label="Zamknij"><span class="material-icons">close</span></button>
      </div>
      <form id="waitlistForm" class="dash-modal-form">
        <p class="dash-modal-hint">Zostaniesz powiadomiony, gdy zwolni się termin w wybranym salonie.</p>
        <label class="auth-label" for="waitlistSalon">Salon / usługa</label>
        <input type="text" id="waitlistSalon" class="auth-input" placeholder="Nazwa salonu lub usługi" maxlength="80" required>
        <label class="auth-label" for="waitlistDate" style="margin-top:.75rem">Preferowana data</label>
        <input type="date" id="waitlistDate" class="auth-input">
        <label class="auth-label" for="waitlistNote" style="margin-top:.75rem">Uwagi (opcjonalnie)</label>
        <input type="text" id="waitlistNote" class="auth-input" placeholder="np. tylko rano, dowolna godzina" maxlength="120">
        <div class="dash-modal-footer">
          <button type="button" class="btn btn-ghost" id="cancelWaitlistBtn">Anuluj</button>
          <button type="submit" class="btn btn-accent">Dołącz do listy</button>
        </div>
      </form>
    </div>
  </div>

</div>
