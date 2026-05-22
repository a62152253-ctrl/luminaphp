<?php declare(strict_types=1); ?>
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <a href="<?= lumina_base() ?>/" class="site-footer__brand">
          <span class="site-footer__brand-icon" aria-hidden="true">
            <span class="material-icons" style="font-size:1.125rem">auto_awesome</span>
          </span>
          Lumina
        </a>
        <p class="site-footer__desc">Rezerwuj wizyty w salonach beauty online — szybko i bez telefonów.</p>
      </div>
      <div class="site-footer__col">
        <h4>Dla klientów</h4>
        <nav class="site-footer__links" aria-label="Linki dla klientów">
          <a href="<?= lumina_base() ?>/?page=explore">Eksploruj salony</a>
          <a href="<?= lumina_base() ?>/?page=map">Mapa</a>
          <a href="<?= lumina_base() ?>/?page=offers">Promocje</a>
        </nav>
      </div>
      <div class="site-footer__col">
        <h4>Dla salonów</h4>
        <nav class="site-footer__links" aria-label="Linki dla salonów">
          <a href="<?= lumina_base() ?>/?page=choice">Dołącz do Lumina</a>
          <a href="<?= lumina_base() ?>/?page=auth">Zaloguj się</a>
        </nav>
      </div>
    </div>
    <div class="site-footer__bottom">
      <span>&copy; <?= date('Y') ?> Lumina. Wszelkie prawa zastrzeżone.</span>
    </div>
  </div>
</footer>
