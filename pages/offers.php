<?php /* Promocje i pakiety */ ?>
<div class="features-page container">
  <header class="features-hero">
    <h1>Promocje i pakiety</h1>
    <p>Kody rabatowe i oferty specjalne salonów</p>
  </header>

  <div class="promo-apply-bar">
    <input type="text" id="promoCodeInput" class="auth-input" placeholder="Wpisz kod rabatowy">
    <button id="promoApplyBtn" class="btn btn-accent">Zastosuj</button>
    <button id="promoRemoveBtn" class="btn btn-ghost hidden" onclick="window.removePromo?.()">Usuń</button>
  </div>
  <div id="promoApplied" class="promo-applied hidden"></div>

  <div id="offersGrid" class="offers-grid"></div>
</div>
