<?php /* Auth Page — Login & Register */ ?>

<div class="auth-page">

  <!-- LEFT: Brand hero -->
  <div class="auth-hero">
    <div class="auth-hero-bg">
      <img class="auth-hero-img"
        src="https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1200&auto=format&fit=crop"
        alt="Salon">
      <div class="auth-hero-overlay"></div>
    </div>
    <div class="auth-hero-content">
      <div class="auth-hero-logo">
        <div class="auth-hero-logo-icon"><span class="material-icons">auto_awesome</span></div>
        Lumina
      </div>
      <h2 class="auth-hero-title">Booking<br>dla Mistrzów.</h2>
      <p class="auth-hero-sub">Platforma rezerwacji stworzona dla najlepszych salonów i ich wymagających klientów.</p>
    </div>
    <div class="auth-hero-stats">
      <div>
        <div class="auth-hero-stat-val">500k+</div>
        <div class="auth-hero-stat-label">Wizyt miesięcznie</div>
      </div>
      <div>
        <div class="auth-hero-stat-val">12k+</div>
        <div class="auth-hero-stat-label">Salonów</div>
      </div>
      <div>
        <div class="auth-hero-stat-val">4.9★</div>
        <div class="auth-hero-stat-label">Średnia ocen</div>
      </div>
    </div>
  </div>

  <!-- RIGHT: Form -->
  <div class="auth-form-panel">
    <div class="auth-form-wrap">

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab active" id="tabLogin" onclick="authSwitchTab('login')">Zaloguj się</button>
        <button class="auth-tab" id="tabRegister" onclick="authSwitchTab('register')">Zarejestruj się</button>
      </div>

      <!-- Error banner -->
      <div class="auth-error" id="authError">
        <span class="material-icons auth-error-icon" style="font-size:1rem;flex-shrink:0">error</span>
        <span id="authErrorMsg"></span>
      </div>

      <!-- ===== LOGIN PANEL ===== -->
      <div class="auth-panel active" id="panelLogin">
        <h2 class="auth-title">Witaj z powrotem</h2>
        <p class="auth-sub">Zaloguj się, aby zarządzać wizytami i salonem.</p>

        <div class="auth-fields">
          <div class="auth-field">
            <label for="loginEmail">Email</label>
            <input id="loginEmail" type="email" class="auth-input" placeholder="twoj@email.pl" autocomplete="email">
          </div>
          <div class="auth-field">
            <label for="loginPassword">Hasło</label>
            <div class="auth-field-pw">
              <input id="loginPassword" type="password" class="auth-input" placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="auth-eye" onclick="authTogglePassword('loginPassword', this)" aria-label="Pokaż/ukryj hasło">
                <span class="material-icons" style="font-size:1.1rem">visibility</span>
              </button>
            </div>
            <button type="button" class="auth-forgot" onclick="authForgot()">Zapomniałem hasła</button>
          </div>
        </div>

        <button class="auth-submit" id="btnLogin" onclick="authLogin()">Zaloguj się</button>

        <div class="auth-divider">lub</div>

        <button class="auth-google" onclick="authGoogle()">
          <svg class="auth-google-logo" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Kontynuuj z Google
        </button>
      </div>

      <!-- ===== REGISTER PANEL ===== -->
      <div class="auth-panel" id="panelRegister">
        <h2 class="auth-title">Utwórz konto</h2>
        <p class="auth-sub">Wybierz swój typ konta.</p>

        <div class="role-selector">
          <button class="role-card active" id="roleClient" onclick="authSelectRole('client')">
            <div class="role-card-icon"><span class="material-icons">person</span></div>
            <div class="role-card-name">Klient</div>
          </button>
          <button class="role-card" id="roleBusiness" onclick="authSelectRole('business')">
            <div class="role-card-icon"><span class="material-icons">storefront</span></div>
            <div class="role-card-name">Salon / Biznes</div>
          </button>
        </div>

        <div class="auth-fields">
          <!-- Common fields -->
          <div class="auth-field">
            <label for="regName">Imię i nazwisko</label>
            <input id="regName" type="text" class="auth-input" placeholder="Jan Kowalski" autocomplete="name">
          </div>
          <div class="auth-field">
            <label for="regEmail">Email</label>
            <input id="regEmail" type="email" class="auth-input" placeholder="twoj@email.pl" autocomplete="email">
          </div>
          <div class="auth-field">
            <label for="regPassword">Hasło</label>
            <div class="auth-field-pw">
              <input id="regPassword" type="password" class="auth-input" placeholder="Min. 8 znaków, 1 cyfra" autocomplete="new-password">
              <button type="button" class="auth-eye" onclick="authTogglePassword('regPassword', this)" aria-label="Pokaż/ukryj hasło">
                <span class="material-icons" style="font-size:1.1rem">visibility</span>
              </button>
            </div>
            <div class="pw-strength" id="pwStrength">
              <div class="pw-bar"></div>
              <div class="pw-bar"></div>
              <div class="pw-bar"></div>
            </div>
          </div>

          <!-- Client-only: phone + SMS verification -->
          <div class="biz-extra show" id="clientExtra">
            <div class="auth-field">
              <label for="regPhone">Numer telefonu</label>
              <div style="display:flex;gap:.5rem">
                <input id="regPhone" type="tel" class="auth-input"
                  placeholder="+48 600 000 000" autocomplete="tel" style="flex:1">
                <button type="button" id="btnSendSms" class="auth-sms-btn"
                  onclick="authSendSms()">Wyślij kod</button>
              </div>
              <p style="font-size:.72rem;color:var(--zinc-400);margin-top:.25rem">
                Format: +48 XXX XXX XXX — wyślemy kod weryfikacyjny
              </p>
            </div>
            <!-- SMS code input (shown after code is sent) -->
            <div class="auth-field" id="smsCodeField" style="display:none">
              <label for="regSmsCode">Kod SMS</label>
              <div style="display:flex;gap:.5rem;align-items:center">
                <input id="regSmsCode" type="text" inputmode="numeric" class="auth-input"
                  placeholder="_ _ _ _ _ _" maxlength="6"
                  style="flex:1;letter-spacing:.3em;text-align:center;font-size:1.125rem">
                <button type="button" id="btnVerifySms" class="auth-sms-btn auth-sms-btn--verify"
                  onclick="authVerifySms()">Weryfikuj</button>
              </div>
              <p style="font-size:.72rem;color:var(--zinc-400);margin-top:.25rem">
                Wpisz 6-cyfrowy kod z SMS
              </p>
            </div>
            <!-- Verified badge -->
            <div id="phoneVerifiedBadge"
              style="display:none;align-items:center;gap:.375rem;
                     color:#22c55e;font-size:.8125rem;font-weight:600;margin-top:-.25rem">
              <span class="material-icons" style="font-size:1rem">check_circle</span>
              Numer telefonu zweryfikowany
            </div>
            <!-- reCAPTCHA anchor (Firebase invisible reCAPTCHA renders here) -->
            <div id="recaptchaContainer"></div>
          </div>

          <!-- Business-only fields -->
          <div class="biz-extra" id="bizExtra">
            <div class="auth-field">
              <label for="regBizName">Nazwa salonu</label>
              <input id="regBizName" type="text" class="auth-input" placeholder="np. Barber Shop Pro">
            </div>
            <div class="auth-field">
              <label for="regBizCategory">Branża</label>
              <select id="regBizCategory" class="auth-input">
                <option value="">Wybierz branżę…</option>
                <option>Barber</option>
                <option>Fryzjer</option>
                <option>Paznokcie</option>
                <option>Masaż</option>
                <option>Kosmetyczka</option>
                <option>Brwi i Rzęsy</option>
                <option>Fizjoterapia</option>
                <option>Tatuaż</option>
                <option>Inne</option>
              </select>
            </div>
            <div class="auth-field">
              <label for="regBizCity">Miasto</label>
              <input id="regBizCity" type="text" class="auth-input" placeholder="np. Warszawa">
            </div>
          </div>
        </div>

        <button class="auth-submit" id="btnRegister" onclick="authRegister()">Utwórz konto</button>

        <div class="auth-divider">lub</div>

        <button class="auth-google" onclick="authGoogle()">
          <svg class="auth-google-logo" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Kontynuuj z Google
        </button>
      </div>

    </div>
  </div>
</div>

<style>
.auth-sms-btn {
  flex-shrink: 0;
  padding: .5rem .875rem;
  border-radius: .5rem;
  border: 1.5px solid var(--indigo-500, #6366f1);
  background: transparent;
  color: var(--indigo-400, #818cf8);
  font-size: .8125rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;
}
.auth-sms-btn:hover:not(:disabled) {
  background: var(--indigo-500, #6366f1);
  color: #fff;
}
.auth-sms-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.auth-sms-btn--verify {
  border-color: #22c55e;
  color: #22c55e;
}
.auth-sms-btn--verify:hover:not(:disabled) {
  background: #22c55e;
  color: #fff;
}
</style>
<script>
// Tab switching
function authSwitchTab(tab) {
  const cap = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab' + cap)?.classList.add('active');
  document.getElementById('panel' + cap)?.classList.add('active');
  document.getElementById('authError')?.classList.remove('show');
}

// Role selector
function authSelectRole(role) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
  document.getElementById(role === 'client' ? 'roleClient' : 'roleBusiness')?.classList.add('active');
  document.getElementById('bizExtra')?.classList.toggle('show', role === 'business');
  document.getElementById('clientExtra')?.classList.toggle('show', role === 'client');
  // Reset phone verification state when switching roles
  if (typeof window.authResetPhone === 'function') window.authResetPhone();
}
</script>
