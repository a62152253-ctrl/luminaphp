<?php /* Salon Setup — tworzenie profilu po rejestracji */ ?>

<div class="setup-page">
  <div class="setup-wrap">

    <!-- Header -->
    <div class="setup-header">
      <div class="setup-logo">
        <div class="setup-logo-icon"><span class="material-icons">auto_awesome</span></div>
        Lumina
      </div>
      <h1 class="setup-title">Stwórz profil swojego salonu</h1>
      <p class="setup-sub">Uzupełnij informacje — zajmie to tylko chwilę. Klienci będą mogli Cię znaleźć.</p>

      <!-- Steps -->
      <div class="setup-steps">
        <div class="setup-step active" id="step1dot">
          <div class="setup-step-dot">1</div>
          <div class="setup-step-label">Podstawowe</div>
        </div>
        <div class="setup-step-line"></div>
        <div class="setup-step" id="step2dot">
          <div class="setup-step-dot">2</div>
          <div class="setup-step-label">Lokalizacja</div>
        </div>
        <div class="setup-step-line"></div>
        <div class="setup-step" id="step3dot">
          <div class="setup-step-dot">3</div>
          <div class="setup-step-label">Godziny</div>
        </div>
        <div class="setup-step-line"></div>
        <div class="setup-step" id="step4dot">
          <div class="setup-step-dot">4</div>
          <div class="setup-step-label">Zdjęcie</div>
        </div>
      </div>

      <div class="setup-trust-grid">
        <div class="setup-trust-card">
          <span class="material-icons">verified_user</span>
          <strong>Dane firmy</strong>
          <p>NIP, adres i kontakt zapisujemy jako bazę do późniejszej weryfikacji salonu.</p>
        </div>
        <div class="setup-trust-card">
          <span class="material-icons">travel_explore</span>
          <strong>Widoczność</strong>
          <p>Profil dostaje słowa kluczowe i slug, więc łatwiej go znaleźć w eksploracji.</p>
        </div>
        <div class="setup-trust-card">
          <span class="material-icons">rule</span>
          <strong>Gotowość profilu</strong>
          <p>Przed publikacją sprawdzamy kompletność najważniejszych danych.</p>
        </div>
      </div>
    </div>

    <!-- Error banner -->
    <div class="auth-error" id="setupError">
      <span class="material-icons" style="font-size:1rem;flex-shrink:0">error</span>
      <span id="setupErrorMsg"></span>
    </div>

    <!-- ===== STEP 1: Podstawowe informacje ===== -->
    <div class="setup-card" id="setupStep1">
      <h2 class="setup-card-title">Podstawowe informacje</h2>

      <div class="auth-fields">
        <div class="auth-field">
          <label for="setupName" id="setupNameLabel">Nazwa salonu *</label>
          <input id="setupName" type="text" class="auth-input" placeholder="np. Barber Shop Pro" required aria-required="true" aria-labelledby="setupNameLabel">
        </div>
        <div class="auth-field">
          <label for="setupCategory" id="setupCategoryLabel">Branża *</label>
          <select id="setupCategory" class="auth-input" required aria-required="true" aria-labelledby="setupCategoryLabel">
            <option value="">Wybierz branżę…</option>
            <option>Barber</option>
            <option>Fryzjer</option>
            <option>Paznokcie</option>
            <option>Masaż</option>
            <option>Kosmetyczka</option>
            <option>Brwi i Rzęsy</option>
            <option>Fizjoterapia</option>
            <option>Inne</option>
          </select>
        </div>
        <div class="auth-field">
          <label for="setupDesc" id="setupDescLabel">Opis salonu</label>
          <textarea id="setupDesc" class="auth-input" rows="3"
            placeholder="Kilka słów o Twoim salonie, specjalizacji i ofercie…"
            oninput="window.setupDescCount?.(this.value)"
            aria-describedby="setupDescCounter" aria-labelledby="setupDescLabel"></textarea>
          <span id="setupDescCounter" class="setup-field-hint" aria-live="polite">0 / rekomendowane min. 80 znaków</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field">
            <label for="setupPhone" id="setupPhoneLabel">Telefon</label>
            <input id="setupPhone" type="tel" class="auth-input" placeholder="+48 600 000 000" aria-labelledby="setupPhoneLabel">
          </div>
          <div class="auth-field">
            <label for="setupNip" id="setupNipLabel">NIP firmy <span style="font-weight:400;color:var(--zinc-400)">(opcjonalnie)</span></label>
            <div class="setup-input-with-status">
              <input id="setupNip" type="text" class="auth-input" placeholder="1234567890"
                maxlength="10" inputmode="numeric" autocomplete="off"
                oninput="window.setupNipCheck?.(this.value)"
                aria-labelledby="setupNipLabel" aria-describedby="setupNipStatus">
              <span id="setupNipStatus" class="setup-field-status" aria-live="polite"></span>
            </div>
          </div>
        </div>
        <div class="auth-field">
          <label for="setupWebsite" id="setupWebsiteLabel">Strona www</label>
          <input id="setupWebsite" type="url" class="auth-input" placeholder="https://twojsalon.pl"
            onblur="window.setupNormalizeUrl?.(this)" aria-labelledby="setupWebsiteLabel">
          <span class="setup-field-hint">Możesz podać domenę bez https — uzupełnimy format automatycznie.</span>
        </div>
      </div>

      <div class="setup-footer">
        <div></div>
        <button class="auth-submit setup-btn-next" onclick="setupNext(1)">
          Dalej <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </div>

    <!-- ===== STEP 2: Lokalizacja ===== -->
    <div class="setup-card hidden" id="setupStep2">
      <h2 class="setup-card-title">Lokalizacja</h2>

      <input type="hidden" id="setupLat">
      <input type="hidden" id="setupLng">

      <div class="auth-fields">
        <div class="auth-field">
          <label for="setupCity" id="setupCityLabel">Miasto *</label>
          <input id="setupCity" type="text" class="auth-input" placeholder="np. Warszawa" required aria-required="true" aria-labelledby="setupCityLabel">
        </div>
        <div class="auth-field">
          <label for="setupAddress" id="setupAddressLabel">Ulica i numer *</label>
          <input id="setupAddress" type="text" class="auth-input" placeholder="ul. Marszałkowska 10" required aria-required="true" aria-labelledby="setupAddressLabel">
        </div>
        <div class="auth-field">
          <label for="setupPostal" id="setupPostalLabel">Kod pocztowy</label>
          <input id="setupPostal" type="text" class="auth-input" placeholder="00-000" aria-labelledby="setupPostalLabel">
        </div>

        <button type="button" id="setupGpsBtn" class="btn btn-secondary geo-btn" onclick="window.setupUseGPS()" aria-label="Użyj lokalizacji GPS">
          <span class="material-icons" aria-hidden="true">my_location</span>
          Użyj lokalizacji GPS (jeśli jesteś w salonie)
        </button>
        <p class="setup-geo-hint">
          <span class="material-icons" style="font-size:.875rem;vertical-align:middle" aria-hidden="true">info</span>
          Jeśli nie użyjesz GPS, adres zostanie automatycznie geokodowany.
        </p>
        <div id="setupLocationStatus" class="setup-location-status" aria-live="polite">
          <span class="material-icons" aria-hidden="true">pin_drop</span>
          <span>Po zapisaniu profilu zweryfikujemy współrzędne z adresem.</span>
        </div>
      </div>

      <div class="setup-footer">
        <button class="btn btn-secondary" onclick="setupBack(2)">
          <span class="material-icons">arrow_back</span> Wstecz
        </button>
        <button class="auth-submit setup-btn-next" onclick="setupNext(2)">
          Dalej <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </div>

    <!-- ===== STEP 3: Godziny otwarcia ===== -->
    <div class="setup-card hidden" id="setupStep3">
      <h2 class="setup-card-title">Godziny otwarcia</h2>
      <p class="setup-card-sub">Możesz zmienić to później w ustawieniach.</p>

      <div id="setupHoursGrid" class="setup-hours-grid"></div>

      <div class="setup-footer">
        <button class="btn btn-secondary" onclick="setupBack(3)">
          <span class="material-icons">arrow_back</span> Wstecz
        </button>
        <button class="auth-submit setup-btn-next" onclick="setupNext(3)">
          Dalej <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </div>

    <!-- ===== STEP 4: Zdjęcie profilowe ===== -->
    <div class="setup-card hidden" id="setupStep4">
      <h2 class="setup-card-title">Zdjęcie salonu</h2>
      <p class="setup-card-sub">Dodaj zdjęcie — salony ze zdjęciem mają 3× więcej rezerwacji.</p>

      <div class="auth-fields">
        <div class="auth-field">
          <label for="setupPhoto" id="setupPhotoLabel">URL zdjęcia</label>
          <input id="setupPhoto" type="url" class="auth-input"
            placeholder="https://images.unsplash.com/..."
            oninput="setupPreviewPhoto(this.value)"
            onblur="window.setupNormalizeUrl?.(this)" aria-labelledby="setupPhotoLabel">
        </div>
        <div id="setupPhotoPreview" class="setup-photo-preview" aria-live="polite" role="img" aria-label="Podgląd zdjęcia">
          <span class="material-icons" aria-hidden="true">add_photo_alternate</span>
          <p>Podgląd zdjęcia</p>
        </div>
        <div class="setup-launch-box" id="setupLaunchChecklist">
          <div class="setup-launch-row" data-check="identity">
            <span class="material-icons">radio_button_unchecked</span>
            <span>Nazwa i branża</span>
          </div>
          <div class="setup-launch-row" data-check="location">
            <span class="material-icons">radio_button_unchecked</span>
            <span>Adres salonu</span>
          </div>
          <div class="setup-launch-row" data-check="content">
            <span class="material-icons">radio_button_unchecked</span>
            <span>Opis i zdjęcie profilu</span>
          </div>
        </div>
        <label class="setup-consent">
          <input type="checkbox" id="setupOwnerConsent" required aria-required="true">
          <span>Potwierdzam, że mam prawo utworzyć i zarządzać profilem tego salonu.</span>
        </label>
      </div>

      <div class="setup-footer">
        <button class="btn btn-secondary" onclick="setupBack(4)">
          <span class="material-icons">arrow_back</span> Wstecz
        </button>
        <button class="auth-submit" id="setupFinishBtn" onclick="setupFinish()">
          <span class="material-icons">check_circle</span> Utwórz profil i wejdź do panelu
        </button>
      </div>
    </div>

  </div>
</div>

<script>
const DAYS_PL = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];

// Build hours grid
(function buildHours() {
  const el = document.getElementById('setupHoursGrid');
  if (!el) return;
  el.innerHTML = DAYS_PL.map((day, i) => `
    <div class="setup-hours-row">
      <label class="setup-hours-day">${day}</label>
      <label class="setup-hours-closed">
        <input type="checkbox" id="shClosed_${i}"
          onchange="document.getElementById('shTimes_${i}').style.opacity=this.checked?'.3':'1'"
          ${i >= 6 ? 'checked' : ''}>
        Zamknięte
      </label>
      <div class="setup-hours-times" id="shTimes_${i}" style="opacity:${i >= 6 ? '.3' : '1'}">
        <input type="time" id="shOpen_${i}"  class="auth-input setup-time-input" value="09:00">
        <span style="color:var(--zinc-400)">–</span>
        <input type="time" id="shClose_${i}" class="auth-input setup-time-input" value="18:00">
      </div>
    </div>`).join('');
})();

function setupPreviewPhoto(url) {
  const el = document.getElementById('setupPhotoPreview');
  if (!el) return;
  if (url && /^https?:\/\//i.test(url)) {
    const img = document.createElement('img');
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit';
    img.alt = 'Podgląd zdjęcia salonu';
    img.onerror = () => {
      el.innerHTML = '<span class="material-icons">broken_image</span><p>Nie można załadować zdjęcia</p>';
    };
    img.src = url;
    el.textContent = '';
    el.appendChild(img);
  } else {
    el.innerHTML = '<span class="material-icons">add_photo_alternate</span><p>Podgląd zdjęcia</p>';
  }
}

function setupValidateNip(nip) {
  return /^\d{10}$/.test(nip.replace(/\D/g, ''));
}

function setupShowError(msg) {
  const el = document.getElementById('setupError');
  if (!el) return;
  document.getElementById('setupErrorMsg').textContent = msg;
  el.classList.add('show');
}
function setupHideError() {
  document.getElementById('setupError')?.classList.remove('show');
}

function setupGoTo(step) {
  [1,2,3,4].forEach(i => {
    document.getElementById(`setupStep${i}`)?.classList.toggle('hidden', i !== step);
    const dot = document.getElementById(`step${i}dot`);
    if (dot) dot.classList.toggle('active', i <= step);
  });
  setupHideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNext(current) {
  setupHideError();
  if (window.setupValidateStep && !window.setupValidateStep(current)) return;
  if (current === 1) {
    const name = document.getElementById('setupName')?.value.trim();
    const cat  = document.getElementById('setupCategory')?.value;
    if (!name) { setupShowError('Podaj nazwę salonu.'); return; }
    if (!cat)  { setupShowError('Wybierz branżę.'); return; }
    if (name.length < 3) { setupShowError('Nazwa salonu musi mieć co najmniej 3 znaki.'); return; }
    setupGoTo(2);
  } else if (current === 2) {
    const city = document.getElementById('setupCity')?.value.trim();
    const addr = document.getElementById('setupAddress')?.value.trim();
    if (!city) { setupShowError('Podaj miasto.'); return; }
    if (!addr) { setupShowError('Podaj ulicę i numer budynku.'); return; }
    if (!/\d/.test(addr)) { setupShowError('Wpisz numer budynku w polu adresu (np. ul. Tarnowska 77).'); return; }
    setupGoTo(3);
  } else if (current === 3) {
    setupGoTo(4);
  }
}

function setupBack(current) {
  setupGoTo(current - 1);
}
</script>
