<?php /* Centrum powiadomień */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Powiadomienia</h1>
    <p>Wszystkie alerty i przypomnienia w jednym miejscu</p>
    <div class="notif-header-actions">
      <button id="markAllReadBtn" class="btn btn-ghost btn-sm">
        <span class="material-icons">done_all</span> Zaznacz jako przeczytane
      </button>
      <button id="clearAllNotifs" class="btn btn-ghost btn-sm">
        <span class="material-icons">delete_sweep</span> Wyczyść wszystko
      </button>
      <button id="notifPrefsBtn" class="btn btn-ghost btn-sm">
        <span class="material-icons">tune</span> Ustawienia
      </button>
    </div>
  </header>

  <!-- Search & date filter bar -->
  <div class="notif-search-bar">
    <div class="notif-search-field">
      <span class="material-icons">search</span>
      <input type="search" id="notifSearchInput" class="auth-input"
        placeholder="Szukaj powiadomień…" autocomplete="off">
    </div>
    <div class="notif-date-range">
      <label for="notifDateFrom" class="sr-only">Od daty</label>
      <input type="date" id="notifDateFrom" class="auth-input" title="Od">
      <span class="notif-date-sep">—</span>
      <label for="notifDateTo" class="sr-only">Do daty</label>
      <input type="date" id="notifDateTo"   class="auth-input" title="Do">
      <button id="notifDateFilterBtn" class="btn btn-sm btn-accent">Filtruj</button>
    </div>
  </div>

  <!-- Category tabs -->
  <div class="notif-filters" role="tablist" aria-label="Kategorie powiadomień">
    <button class="notif-filter active" role="tab" data-filter="all">
      Wszystkie <span class="notif-count-badge" id="countAll"></span>
    </button>
    <button class="notif-filter" role="tab" data-filter="booking">
      <span class="material-icons">calendar_today</span> Rezerwacje
      <span class="notif-count-badge" id="countBooking"></span>
    </button>
    <button class="notif-filter" role="tab" data-filter="promo">
      <span class="material-icons">local_offer</span> Promocje
      <span class="notif-count-badge" id="countPromo"></span>
    </button>
    <button class="notif-filter" role="tab" data-filter="system">
      <span class="material-icons">info</span> System
      <span class="notif-count-badge" id="countSystem"></span>
    </button>
    <button class="notif-filter" role="tab" data-filter="loyalty">
      <span class="material-icons">emoji_events</span> Punkty
      <span class="notif-count-badge" id="countLoyalty"></span>
    </button>
  </div>

  <!-- Push subscription banner -->
  <div id="pushSubscribeBanner" class="notif-push-banner hidden">
    <span class="material-icons">notifications_active</span>
    <div class="notif-push-text">
      <strong>Włącz powiadomienia push</strong>
      <span>Otrzymuj alerty o wizytach i promocjach nawet gdy jesteś poza aplikacją.</span>
    </div>
    <button id="pushSubscribeBtn" class="btn btn-accent btn-sm">Włącz</button>
    <button id="pushDismissBtn" class="btn btn-ghost btn-sm">Nie teraz</button>
  </div>

  <div id="notificationsList" class="notifications-list" role="list" aria-live="polite"></div>
  <div id="notifPagination" class="pagination"></div>
</div>

<!-- Notification Preferences Modal -->
<div id="notifPrefsModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="notifPrefsTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="profile-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <h2 id="notifPrefsTitle">Ustawienia powiadomień</h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('notifPrefsModal').classList.add('hidden')"
        aria-label="Zamknij">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="profile-modal-body">
      <ul class="notif-pref-list">
        <li class="notif-pref-row">
          <span>Przypomnienia o wizytach</span>
          <label class="toggle-switch">
            <input type="checkbox" id="prefBooking" checked>
            <span class="toggle-track"></span>
          </label>
        </li>
        <li class="notif-pref-row">
          <span>Promocje i oferty</span>
          <label class="toggle-switch">
            <input type="checkbox" id="prefPromo" checked>
            <span class="toggle-track"></span>
          </label>
        </li>
        <li class="notif-pref-row">
          <span>Aktualności systemu</span>
          <label class="toggle-switch">
            <input type="checkbox" id="prefSystem">
            <span class="toggle-track"></span>
          </label>
        </li>
        <li class="notif-pref-row">
          <span>Punkty lojalnościowe</span>
          <label class="toggle-switch">
            <input type="checkbox" id="prefLoyalty" checked>
            <span class="toggle-track"></span>
          </label>
        </li>
        <li class="notif-pref-row">
          <span>Powiadomienia push (przeglądarka)</span>
          <label class="toggle-switch">
            <input type="checkbox" id="prefPush">
            <span class="toggle-track"></span>
          </label>
        </li>
      </ul>
    </div>
    <div class="profile-modal-foot">
      <button class="profile-cancel-btn"
        onclick="document.getElementById('notifPrefsModal').classList.add('hidden')">Anuluj</button>
      <button id="saveNotifPrefsBtn" class="profile-save-btn">
        <span class="material-icons">save</span> Zapisz
      </button>
    </div>
  </div>
</div>
