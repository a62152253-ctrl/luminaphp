<?php /* Program lojalnościowy */ ?>
<div class="features-page container">
  <header class="features-hero loyalty-hero">
    <div id="loyaltyTierBadge"></div>
    <h1>Program lojalnościowy</h1>
    <p>Zbieraj punkty za wizyty i wymieniaj na nagrody</p>
    <div class="loyalty-points-display">
      <span id="loyaltyPoints" class="loyalty-points-num">0</span>
      <span class="loyalty-points-label">punktów</span>
    </div>
  </header>

  <div class="loyalty-tiers">
    <div class="tier-card tier-card--bronze"><span class="material-icons">workspace_premium</span> Bronze — od 0 pkt</div>
    <div class="tier-card tier-card--silver"><span class="material-icons">military_tech</span> Silver — od 500 pkt</div>
    <div class="tier-card tier-card--gold"><span class="material-icons">emoji_events</span> Gold — od 1500 pkt</div>
  </div>

  <section class="features-card">
    <h3>Nagrody do wymiany</h3>
    <div id="loyaltyRewards" class="rewards-grid"></div>
  </section>

  <section class="features-card">
    <h3>Historia punktów</h3>
    <div id="loyaltyHistory" class="loyalty-history"></div>
  </section>
</div>
