<?php /* Profil użytkownika */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Mój profil</h1>
    <p>Edytuj dane, zdjęcie i przeglądaj historię wizyt</p>
    <div class="profile-header-actions">
      <div class="lang-switcher">
        <button data-lang-btn data-lang="pl" class="lang-btn active">PL</button>
        <button data-lang-btn data-lang="en" class="lang-btn">EN</button>
      </div>
      <button id="darkModeToggle" class="btn btn-ghost btn-sm" title="Tryb ciemny / jasny">
        <span class="material-icons" id="darkModeIcon">dark_mode</span>
      </button>
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
        <button id="profileShareBtn" class="btn btn-ghost btn-sm" style="margin-top:.5rem">
          <span class="material-icons">share</span> Udostępnij profil
        </button>
      </div>

      <!-- Quick stats sidebar -->
      <div class="profile-sidebar-stats">
        <div class="profile-stat-item">
          <span class="material-icons">calendar_today</span>
          <div><strong id="profileStatVisits">0</strong><small>wizyt</small></div>
        </div>
        <div class="profile-stat-item">
          <span class="material-icons">emoji_events</span>
          <div><strong id="profileStatPoints">0</strong><small>punktów</small></div>
        </div>
        <div class="profile-stat-item">
          <span class="material-icons">star</span>
          <div><strong id="profileStatReviews">0</strong><small>opinii</small></div>
        </div>
      </div>
    </aside>

    <main class="profile-main">
      <!-- Dane osobowe -->
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
        <div class="auth-field">
          <label for="profileBio">O mnie (opcjonalnie)</label>
          <textarea id="profileBio" class="auth-input" rows="2" placeholder="Krótki opis…"></textarea>
        </div>
        <div class="profile-save-row">
          <button id="profileSaveBtn" class="btn btn-accent">
            <span class="material-icons">save</span> Zapisz
          </button>
          <button id="profileQrBtn" class="btn btn-ghost">
            <span class="material-icons">qr_code</span> Mój QR
          </button>
        </div>
      </section>

      <!-- Subskrypcja Premium -->
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

      <!-- Bezpieczeństwo / 2FA -->
      <section class="features-card">
        <h3><span class="material-icons">security</span> Bezpieczeństwo</h3>
        <div class="notif-pref-row">
          <div>
            <strong>Weryfikacja dwuetapowa (2FA)</strong>
            <p class="text-muted">Zabezpiecz konto kodem SMS przy logowaniu</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle2FA">
            <span class="toggle-track"></span>
          </label>
        </div>
        <div id="twoFAPhoneRow" class="auth-field hidden" style="margin-top:.75rem">
          <label for="twoFAPhone">Numer do weryfikacji</label>
          <input type="tel" id="twoFAPhone" class="auth-input" placeholder="+48 000 000 000">
          <button id="send2FACode" class="btn btn-accent btn-sm" style="margin-top:.4rem">Wyślij kod SMS</button>
        </div>
        <div class="notif-pref-row" style="margin-top:.75rem">
          <div>
            <strong>Powiadomienia e-mail</strong>
            <p class="text-muted">Alerty o logowaniu i rezerwacjach</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggleEmailNotif" checked>
            <span class="toggle-track"></span>
          </label>
        </div>
      </section>

      <!-- Historia wizyt -->
      <section class="features-card">
        <div class="loyalty-history-head">
          <h3>Historia wizyt</h3>
          <button id="exportAppointmentsBtn" class="btn btn-ghost btn-sm">
            <span class="material-icons">download</span> CSV
          </button>
        </div>
        <div id="profileAppointments" class="appointments-list"></div>
      </section>

      <!-- Strefa niebezpieczna -->
      <section class="features-card profile-danger-zone">
        <h3><span class="material-icons" style="color:var(--error)">warning</span> Strefa zaawansowana</h3>
        <div class="danger-row">
          <div>
            <strong>Usuń konto</strong>
            <p class="text-muted">Trwale usuwa Twój profil i wszystkie dane. Akcja nieodwracalna.</p>
          </div>
          <button id="deleteAccountBtn" class="btn btn-danger btn-sm">
            <span class="material-icons">delete_forever</span> Usuń konto
          </button>
        </div>
      </section>
    </main>
  </div>
</div>

<!-- Delete Account Confirmation Modal -->
<div id="deleteAccountModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="deleteAccTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="profile-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <h2 id="deleteAccTitle">Usuń konto</h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('deleteAccountModal').classList.add('hidden')"
        aria-label="Zamknij"><span class="material-icons">close</span></button>
    </div>
    <div class="profile-modal-body">
      <p>Wpisz <strong>USUŃ</strong> aby potwierdzić trwałe usunięcie konta i wszystkich Twoich danych.</p>
      <input type="text" id="deleteAccConfirmInput" class="auth-input"
        placeholder="Wpisz USUŃ" autocomplete="off">
    </div>
    <div class="profile-modal-foot">
      <button class="profile-cancel-btn"
        onclick="document.getElementById('deleteAccountModal').classList.add('hidden')">Anuluj</button>
      <button id="confirmDeleteAccountBtn" class="btn btn-danger" disabled>
        <span class="material-icons">delete_forever</span> Usuń konto
      </button>
    </div>
  </div>
</div>

<!-- QR Code Modal -->
<div id="profileQrModal" class="profile-overlay hidden"
  role="dialog" aria-modal="true" aria-labelledby="profileQrTitle"
  onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="profile-modal" onclick="event.stopPropagation()">
    <div class="profile-modal-head">
      <h2 id="profileQrTitle">Mój kod QR</h2>
      <button class="profile-modal-close"
        onclick="document.getElementById('profileQrModal').classList.add('hidden')"
        aria-label="Zamknij"><span class="material-icons">close</span></button>
    </div>
    <div class="profile-modal-body" style="text-align:center">
      <div id="profileQrCanvas" style="display:inline-block"></div>
      <p class="text-muted" style="margin-top:.75rem">Pokaż kod w salonie, by szybko się zameldować</p>
    </div>
  </div>
</div>
