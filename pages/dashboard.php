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
          <h2 id="nextVisitService">Brak zaplanowanej wizyty</h2>
          <p id="nextVisitBusiness">Zarezerwuj termin w ulubionym salonie.</p>
          <div class="dashboard-next-meta">
            <div class="dashboard-next-meta-item"><span class="material-icons">event</span><span id="nextVisitDate">—</span></div>
            <div class="dashboard-next-meta-item"><span class="material-icons">schedule</span><span id="nextVisitTime">—</span></div>
            <div class="dashboard-next-meta-item"><span class="material-icons">storefront</span><span id="nextVisitSalon">—</span></div>
          </div>
          <div class="dashboard-next-footer">
            <span class="dashboard-next-note" id="nextVisitNote">—</span>
            <a href="/luminaphp/?page=explore" id="nextVisitCta" class="dashboard-primary-link"><span class="material-icons">add</span><span>Nowa rezerwacja</span></a>
          </div>
        </div>
      </section>

      <div class="dash-overview-grid">
        <div class="dash-overview-stat"><span class="material-icons">upcoming</span><strong id="overviewUpcoming">0</strong><label>Nadchodzące</label></div>
        <div class="dash-overview-stat"><span class="material-icons">favorite</span><strong id="overviewFavorites">0</strong><label>Ulubione</label></div>
        <div class="dash-overview-stat"><span class="material-icons">star</span><strong id="overviewReviews">0</strong><label>Opinie</label></div>
      </div>

      <div id="overviewNextStrip" class="dash-next-strip"></div>

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

  </main>
</div>
