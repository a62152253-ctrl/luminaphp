<?php /* Choice Page */ ?>

<div class="choice-page">
  <div class="choice-glow-1"></div>
  <div class="choice-glow-2"></div>
  <div class="container" style="position:relative;z-index:1;width:100%">
    <div style="text-align:center;margin-bottom:4rem">
      <p style="font-size:.75rem;font-weight:900;text-transform:uppercase;letter-spacing:.3em;color:var(--accent);margin-bottom:1rem">Dołącz do Lumina</p>
      <h1 style="font-family:var(--font-display);font-size:clamp(2.5rem,7vw,5rem);font-weight:900;color:white;letter-spacing:-.05em;font-style:italic;text-transform:uppercase">Wybierz swoją ścieżkę</h1>
    </div>
    <div class="choice-grid">
      <a href="/luminaphp/?page=explore" class="choice-card">
        <div class="choice-card-icon"><span class="material-icons">person</span></div>
        <div class="choice-card-title">Jestem Klientem</div>
        <p class="choice-card-desc">Szukam salonów beauty i chcę łatwo rezerwować wizyty online.</p>
        <span class="btn btn-primary" style="font-size:.6875rem">Eksploruj salony <span class="material-icons">east</span></span>
      </a>
      <div class="choice-card" onclick="alert('Panel właściciela – wkrótce dostępny!')">
        <div class="choice-card-icon"><span class="material-icons">store</span></div>
        <div class="choice-card-title">Jestem Właścicielem</div>
        <p class="choice-card-desc">Prowadzę salon i chcę zarządzać rezerwacjami przez Luminę.</p>
        <span class="btn btn-accent" style="font-size:.6875rem">Zarejestruj salon <span class="material-icons">east</span></span>
      </div>
    </div>

    <!-- Features list -->
    <div style="margin-top:5rem;display:grid;gap:1.5rem;max-width:40rem;margin-left:auto;margin-right:auto">
      <?php
      $features = [
        ['bolt','Błyskawiczne rezerwacje online 24/7'],
        ['bar_chart','Panel analityczny dla Twojego salonu'],
        ['notifications','Automatyczne powiadomienia dla klientów'],
        ['payments','Bezpieczne płatności – Blik, karta, Google Pay'],
      ];
      foreach ($features as $f): ?>
      <div style="display:flex;align-items:center;gap:1rem;color:var(--zinc-400)">
        <div style="width:2.5rem;height:2.5rem;border-radius:.75rem;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0">
          <span class="material-icons"><?= $f[0] ?></span>
        </div>
        <span style="font-weight:600;font-size:.9375rem"><?= $f[1] ?></span>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</div>
