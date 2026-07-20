<?php
// $bizId injected by index.php — provide fallback for IDE / direct include
$bizId ??= '';
$step = max(1, min(4, (int)($_GET['step'] ?? 1)));
?>

<div class="booking-wizard">
  <nav class="booking-progress" aria-label="Kroki rezerwacji">
    <?php
    $stepLabels = ['Usługa', 'Specjalista', 'Termin', 'Potwierdzenie'];
    foreach ($stepLabels as $i => $label):
      $num = $i + 1;
      $isActive    = $num === $step;
      $isCompleted = $num < $step;
      $classes     = 'booking-step'
        . ($isActive    ? ' active'    : '')
        . ($isCompleted ? ' completed' : '');
    ?>
    <?php if ($i > 0): ?>
    <div class="booking-line" aria-hidden="true"></div>
    <?php endif; ?>
    <div class="<?= $classes ?>"
      aria-current="<?= $isActive ? 'step' : 'false' ?>"
      aria-label="Krok <?= $num ?>: <?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?><?= $isCompleted ? ' (ukończony)' : '' ?>">
      <div class="step-number" aria-hidden="true"><?= $num ?></div>
      <div class="step-label"><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></div>
    </div>
    <?php endforeach; ?>
  </nav>

  <div class="booking-toolbar" role="group" aria-label="Szybkie akcje rezerwacji" style="margin:1rem 0;display:flex;gap:.75rem;flex-wrap:wrap">
    <a href="/luminaphp/?page=business&amp;id=<?= htmlspecialchars($bizId, ENT_QUOTES, 'UTF-8') ?>" class="btn btn-ghost btn-sm">
      <span class="material-icons" aria-hidden="true">storefront</span> Profil salonu
    </a>
    <button type="button" class="btn btn-ghost btn-sm" onclick="window.location.href='/luminaphp/?page=explore'">
      <span class="material-icons" aria-hidden="true">search</span> Zmień salon
    </button>
    <button type="button" class="btn btn-ghost btn-sm" onclick="window.scrollTo({top:0,behavior:'smooth'})">
      <span class="material-icons" aria-hidden="true">arrow_upward</span> Góra strony
    </button>
  </div>

  <div class="booking-wizard-content">

    <?php if ($step === 1): ?>
    <!-- STEP 1: SELECT SERVICE -->
    <div class="wizard-step active" data-step="1">
      <div class="wizard-header">
        <h2>Wybierz usługę</h2>
        <p>Znajdź usługę, która Cię interesuje</p>
      </div>
      <div id="bookingServicesList" class="booking-services-list" aria-live="polite">
        <div class="spinner" style="margin:3rem auto" role="status" aria-label="Ładowanie usług"></div>
      </div>
    </div>

    <?php elseif ($step === 2): ?>
    <!-- STEP 2: SELECT STAFF -->
    <div class="wizard-step active" data-step="2">
      <div class="wizard-header">
        <h2>Wybierz specjalistę</h2>
        <p>Kto będzie wykonywał usługę?</p>
      </div>
      <div id="bookingStaffList" class="booking-staff-list" aria-live="polite">
        <div class="spinner" style="margin:3rem auto" role="status" aria-label="Ładowanie pracowników"></div>
      </div>
      <button class="btn btn-secondary" onclick="goToStep(1)"
        aria-label="Wróć do wyboru usługi">Wstecz</button>
    </div>

    <?php elseif ($step === 3): ?>
    <!-- STEP 3: SELECT DATE & TIME -->
    <div class="wizard-step active" data-step="3">
      <div class="wizard-header">
        <h2>Wybierz termin</h2>
        <p>Kiedy chcesz przyjść?</p>
      </div>

      <div class="booking-datetime">
        <div class="booking-datetime-section">
          <h3 id="date-label">Data</h3>
          <div id="bookingDateGrid" class="date-grid"
            role="group" aria-labelledby="date-label"></div>
        </div>
        <div class="booking-datetime-section">
          <h3 id="time-label">Godzina</h3>
          <div id="bookingTimeGrid" class="time-grid"
            role="group" aria-labelledby="time-label"></div>
        </div>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-secondary" onclick="goToStep(2)"
          aria-label="Wróć do wyboru specjalisty">Wstecz</button>
        <button class="btn btn-accent" id="step3Next" disabled
          onclick="goToStep(4)" aria-disabled="true"
          aria-label="Przejdź do potwierdzenia">Dalej</button>
      </div>
    </div>

    <?php elseif ($step === 4): ?>
    <!-- STEP 4: CONFIRMATION -->
    <div class="wizard-step active" data-step="4">
      <div class="wizard-header">
        <h2>Potwierdź rezerwację</h2>
        <p>Sprawdź szczegóły przed potwierdzeniem</p>
      </div>

      <div class="booking-confirmation" aria-label="Szczegóły rezerwacji">
        <div class="confirm-card">
          <div class="confirm-icon" aria-hidden="true"><span class="material-icons">store</span></div>
          <div class="confirm-details">
            <h4>Salon</h4>
            <p id="confirmSalon">—</p>
          </div>
        </div>
        <div class="confirm-card">
          <div class="confirm-icon" aria-hidden="true"><span class="material-icons">content_cut</span></div>
          <div class="confirm-details">
            <h4>Usługa</h4>
            <p id="confirmService">—</p>
          </div>
        </div>
        <div class="confirm-card">
          <div class="confirm-icon" aria-hidden="true"><span class="material-icons">person</span></div>
          <div class="confirm-details">
            <h4>Specjalista</h4>
            <p id="confirmStaff">—</p>
          </div>
        </div>
        <div class="confirm-card">
          <div class="confirm-icon" aria-hidden="true"><span class="material-icons">calendar_today</span></div>
          <div class="confirm-details">
            <h4>Termin</h4>
            <p id="confirmDateTime">—</p>
          </div>
        </div>
        <div class="confirm-total">
          <span>Do zapłaty</span>
          <span class="price" id="confirmPrice">0 zł</span>
        </div>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-secondary" onclick="goToStep(3)"
          aria-label="Wróć do wyboru terminu">Wstecz</button>
        <button class="btn btn-accent" onclick="finalizeBooking()"
          aria-label="Potwierdź i utwórz rezerwację">Potwierdź rezerwację</button>
      </div>
    </div>
    <?php endif; ?>

  </div>
</div>

<script>
window.bookingState = {
  bizId: <?= json_encode($bizId) ?>,
  step:  <?= json_encode($step) ?>,
  service: null,
  staff:   null,
  date:    null,
  time:    null,
};

function goToStep(step) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', 'booking');
  url.searchParams.set('id', window.bookingState.bizId);
  url.searchParams.set('step', step);
  window.location.href = url.toString();
}

function selectService(id, name, price, duration) {
  window.bookingState.service = { id, name, price, duration };
  goToStep(2);
}

function selectStaff(id, name, photo) {
  window.bookingState.staff = { id, name, photo };
  goToStep(3);
}
</script>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
