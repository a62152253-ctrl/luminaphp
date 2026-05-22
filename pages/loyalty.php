<?php /* Program lojalnościowy */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head loyalty-hero">
    <div id="loyaltyTierBadge"></div>
    <h1>Program lojalnościowy</h1>
    <p>Zbieraj punkty za wizyty i wymieniaj na nagrody</p>
    <div class="loyalty-points-display">
      <span id="loyaltyPoints" class="loyalty-points-num">0</span>
      <span class="loyalty-points-label">punktów</span>
    </div>
    <div class="loyalty-header-actions">
      <button id="loyaltyShareBtn" class="btn btn-ghost btn-sm">
        <span class="material-icons">share</span> Udostępnij
      </button>
      <button id="loyaltyExportBtn" class="btn btn-ghost btn-sm">
        <span class="material-icons">download</span> Eksportuj historię
      </button>
    </div>
  </header>

  <!-- Daily check-in card -->
  <section class="features-card loyalty-checkin-card">
    <div class="loyalty-checkin-inner">
      <div>
        <h3><span class="material-icons">today</span> Codzienny meldunek</h3>
        <p class="text-muted">Zbieraj +10 pkt każdego dnia — nie przerywaj passy!</p>
        <div class="loyalty-streak-row">
          <span class="material-icons streak-icon">local_fire_department</span>
          <span id="loyaltyStreak" class="loyalty-streak-num">0</span>
          <span class="text-muted">dni z rzędu</span>
        </div>
      </div>
      <button id="dailyCheckinBtn" class="btn btn-accent loyalty-checkin-btn">
        <span class="material-icons">check_circle</span> Zamelduj się
      </button>
    </div>
    <!-- Weekly streak dots -->
    <div class="loyalty-week-dots" aria-label="Streak tygodnia" role="group">
      <?php foreach (['Pn','Wt','Śr','Cz','Pt','Sb','Nd'] as $d): ?>
      <div class="loyalty-week-dot" data-day="<?= $d ?>">
        <span class="loyalty-dot-circle"></span>
        <span class="loyalty-dot-label"><?= $d ?></span>
      </div>
      <?php endforeach; ?>
    </div>
  </section>

  <!-- Tier cards -->
  <div class="loyalty-tiers">
    <div class="tier-card tier-card--bronze">
      <span class="material-icons">workspace_premium</span>
      <strong>Bronze</strong>
      <small>od 0 pkt</small>
      <ul class="tier-perks"><li>5% rabatu</li></ul>
    </div>
    <div class="tier-card tier-card--silver">
      <span class="material-icons">military_tech</span>
      <strong>Silver</strong>
      <small>od 500 pkt</small>
      <ul class="tier-perks"><li>10% rabatu</li><li>Darmowa rezerwacja</li></ul>
    </div>
    <div class="tier-card tier-card--gold">
      <span class="material-icons">emoji_events</span>
      <strong>Gold</strong>
      <small>od 1500 pkt</small>
      <ul class="tier-perks"><li>15% rabatu</li><li>Priorytet rezerwacji</li><li>Ekskluzywne oferty</li></ul>
    </div>
  </div>

  <!-- Points simulator -->
  <section class="features-card">
    <h3><span class="material-icons">calculate</span> Symulator punktów</h3>
    <p class="text-muted">Sprawdź ile punktów zdobędziesz za kolejną wizytę</p>
    <div class="points-sim-row">
      <label for="simAmount">Kwota wizyty (zł)</label>
      <input type="number" id="simAmount" class="auth-input" min="0" step="10" value="100" style="max-width:120px">
      <button id="simCalcBtn" class="btn btn-accent btn-sm">
        <span class="material-icons">bolt</span> Oblicz
      </button>
      <span id="simResult" class="loyalty-sim-result"></span>
    </div>
  </section>

  <!-- Referral invite -->
  <section class="features-card loyalty-referral-card">
    <h3><span class="material-icons">group_add</span> Zaproś znajomego</h3>
    <p class="text-muted">Ty i zaproszony znajomy dostajecie po +100 pkt po pierwszej wizycie</p>
    <div class="share-link-row">
      <input type="text" id="loyaltyReferralLink" class="auth-input" readonly>
      <button id="copyReferralLinkBtn" class="btn btn-accent btn-sm">
        <span class="material-icons">content_copy</span> Kopiuj
      </button>
      <button id="shareReferralBtn" class="btn btn-ghost btn-sm">
        <span class="material-icons">share</span>
      </button>
    </div>
    <div id="loyaltyReferralStats" class="loyalty-referral-stats"></div>
  </section>

  <section class="features-card">
    <h3>Nagrody do wymiany</h3>
    <div id="loyaltyRewards" class="rewards-grid"></div>
  </section>

  <section class="features-card">
    <div class="loyalty-history-head">
      <h3>Historia punktów</h3>
      <button id="loyaltyExportCsvBtn" class="btn btn-ghost btn-sm">
        <span class="material-icons">table_chart</span> CSV
      </button>
    </div>
    <div id="loyaltyHistory" class="loyalty-history"></div>
  </section>
</div>
