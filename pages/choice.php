<?php
$choiceFeatures = [
    ['bolt',          'Błyskawiczne rezerwacje online 24/7'],
    ['bar_chart',     'Panel analityczny dla Twojego salonu'],
    ['notifications', 'Automatyczne powiadomienia dla klientów'],
    ['payments',      'Bezpieczne płatności — Blik, karta, Google Pay'],
];
?>

<div class="choice-page">
  <div class="choice-glow-1" aria-hidden="true"></div>
  <div class="choice-glow-2" aria-hidden="true"></div>

  <div class="container choice-page-inner">
    <header class="choice-page-head">
      <p class="choice-page-eyebrow">Dołącz do Lumina</p>
      <h1>Wybierz swoją ścieżkę</h1>
    </header>

    <div class="choice-grid" role="list">
      <a href="/luminaphp/?page=explore" class="choice-card" role="listitem">
        <div class="choice-card-icon" aria-hidden="true">
          <span class="material-icons">person</span>
        </div>
        <div class="choice-card-title">Jestem Klientem</div>
        <p class="choice-card-desc">Szukam salonów beauty i chcę łatwo rezerwować wizyty online.</p>
        <span class="btn btn-primary choice-card-cta" aria-hidden="true">
          Eksploruj salony <span class="material-icons">east</span>
        </span>
      </a>

      <a href="/luminaphp/?page=auth" class="choice-card" role="listitem"
        aria-label="Zarejestruj salon — przejdź do rejestracji">
        <div class="choice-card-icon" aria-hidden="true">
          <span class="material-icons">store</span>
        </div>
        <div class="choice-card-title">Jestem Właścicielem</div>
        <p class="choice-card-desc">Prowadzę salon i chcę zarządzać rezerwacjami przez Luminę.</p>
        <span class="btn btn-accent choice-card-cta" aria-hidden="true">
          Zarejestruj salon <span class="material-icons">east</span>
        </span>
      </a>
    </div>

    <ul class="choice-features" aria-label="Funkcje platformy Lumina">
      <?php foreach ($choiceFeatures as [$icon, $text]): ?>
      <li class="choice-feature">
        <span class="choice-feature-icon" aria-hidden="true">
          <span class="material-icons"><?= htmlspecialchars($icon, ENT_QUOTES, 'UTF-8') ?></span>
        </span>
        <span><?= htmlspecialchars($text, ENT_QUOTES, 'UTF-8') ?></span>
      </li>
      <?php endforeach; ?>
    </ul>
  </div>
</div>
