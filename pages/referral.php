<?php /* Program poleceń */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Program poleceń</h1>
    <p>Zaproś znajomych i zdobądź bonusy</p>
  </header>

  <section class="features-card referral-card">
    <h3>Twój unikalny link</h3>
    <div class="referral-link-box">
      <input type="text" id="referralLink" class="auth-input" readonly>
      <button id="copyReferralLink" class="btn btn-accent"><span class="material-icons">content_copy</span> Kopiuj</button>
    </div>
    <div id="referralQR" class="referral-qr"></div>
    <div class="referral-share">
      <button id="shareReferral" class="btn btn-ghost"><span class="material-icons">share</span> Udostępnij</button>
    </div>
  </section>

  <div class="referral-stats">
    <div class="stat-card"><span id="refClicks">0</span><label>Kliknięcia</label></div>
    <div class="stat-card"><span id="refSignups">0</span><label>Rejestracje</label></div>
    <div class="stat-card"><span id="refBonuses">0</span><label>Bonusy (pkt)</label></div>
  </div>

  <section class="features-card">
    <h3>Jak to działa?</h3>
    <ol class="referral-steps">
      <li>Udostępnij swój link znajomym</li>
      <li>Znajomy rejestruje się i rezerwuje wizytę</li>
      <li>Otrzymujesz <strong>100 punktów</strong> lojalnościowych</li>
    </ol>
    <button id="claimReferralBonus" class="btn btn-accent hidden">Odbierz bonus</button>
  </section>
</div>
