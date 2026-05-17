<?php /* Profil użytkownika */ ?>
<div class="features-page container">
  <header class="features-hero">
    <h1>Mój profil</h1>
    <p>Edytuj dane, zdjęcie i przeglądaj historię wizyt</p>
    <div class="lang-switcher">
      <button data-lang-btn data-lang="pl" class="lang-btn active">PL</button>
      <button data-lang-btn data-lang="en" class="lang-btn">EN</button>
    </div>
  </header>

  <div class="profile-layout">
    <aside class="profile-sidebar">
      <div class="profile-card">
        <div class="profile-avatar-edit" onclick="document.getElementById('profilePagePhoto').click()">
          <img id="profilePageAvatar" src="" alt="Avatar" class="profile-page-avatar">
          <span class="profile-avatar-badge"><span class="material-icons">photo_camera</span></span>
        </div>
        <input type="file" id="profilePagePhoto" accept="image/*" hidden>
        <h2 id="profilePageName">—</h2>
        <p id="profilePageEmail" class="text-muted">—</p>
        <div id="profileTierBadge"></div>
      </div>
    </aside>

    <main class="profile-main">
      <section class="features-card">
        <h3>Dane osobowe</h3>
        <div class="auth-field">
          <label for="profileDisplayName">Imię / pseudonim</label>
          <input type="text" id="profileDisplayName" class="auth-input" placeholder="Jak mamy Cię nazywać?">
        </div>
        <div class="auth-field">
          <label for="profilePhone">Telefon (SMS)</label>
          <input type="tel" id="profilePhone" class="auth-input" placeholder="+48 000 000 000">
        </div>
        <button id="profileSaveBtn" class="btn btn-accent"><span class="material-icons">save</span> Zapisz</button>
      </section>

      <section class="features-card">
        <h3>Subskrypcja Premium</h3>
        <p class="text-muted" data-i18n="payment.trial">1 dzień za darmo, potem wybierz plan</p>
        <div class="payment-plans">
          <div class="payment-plan" data-plan="monthly">
            <strong data-i18n="payment.monthly">2 $ / miesiąc</strong>
          </div>
          <div class="payment-plan payment-plan--featured" data-plan="yearly">
            <strong data-i18n="payment.yearly">15 $ / rok</strong>
            <span class="plan-badge">Oszczędzasz 58%</span>
          </div>
        </div>
        <div id="paypalButtonContainer"></div>
        <p id="subscriptionStatus" class="subscription-status"></p>
      </section>

      <section class="features-card">
        <h3>Historia wizyt</h3>
        <div id="profileAppointments" class="appointments-list"></div>
      </section>
    </main>
  </div>
</div>
