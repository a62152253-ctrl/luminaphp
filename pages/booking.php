<?php /* Booking Process Page - Multi-step booking wizard */
$bizId = $_GET['id'] ?? '';
$step = $_GET['step'] ?? '1';
?>

<div class="booking-wizard">
  <div class="booking-progress">
    <div class="booking-step <?= $step === '1' ? 'active' : '' ?> <?= $step > '1' ? 'completed' : '' ?>">
      <div class="step-number">1</div>
      <div class="step-label">Usługa</div>
    </div>
    <div class="booking-line"></div>
    <div class="booking-step <?= $step === '2' ? 'active' : '' ?> <?= $step > '2' ? 'completed' : '' ?>">
      <div class="step-number">2</div>
      <div class="step-label">Specjalista</div>
    </div>
    <div class="booking-line"></div>
    <div class="booking-step <?= $step === '3' ? 'active' : '' ?> <?= $step > '3' ? 'completed' : '' ?>">
      <div class="step-number">3</div>
      <div class="step-label">Termin</div>
    </div>
    <div class="booking-line"></div>
    <div class="booking-step <?= $step === '4' ? 'active' : '' ?>">
      <div class="step-number">4</div>
      <div class="step-label">Potwierdzenie</div>
    </div>
  </div>

  <div class="booking-wizard-content">
    
    <!-- STEP 1: SELECT SERVICE -->
    <?php if ($step === '1'): ?>
    <div class="wizard-step active" data-step="1">
      <div class="wizard-header">
        <h2>Wybierz usługę</h2>
        <p>Znajdź usługę, która Cię interesuje</p>
      </div>
      <div id="bookingServicesList" class="booking-services-list">
        <div class="spinner" style="margin:3rem auto"></div>
      </div>
    </div>

    <!-- STEP 2: SELECT STAFF -->
    <?php elseif ($step === '2'): ?>
    <div class="wizard-step active" data-step="2">
      <div class="wizard-header">
        <h2>Wybierz specjalistę</h2>
        <p>Kto będzie wykonywał usługę?</p>
      </div>
      <div id="bookingStaffList" class="booking-staff-list">
        <div class="spinner" style="margin:3rem auto"></div>
      </div>
      <button class="btn btn-secondary" onclick="goToStep('1')">Wstecz</button>
    </div>

    <!-- STEP 3: SELECT DATE & TIME -->
    <?php elseif ($step === '3'): ?>
    <div class="wizard-step active" data-step="3">
      <div class="wizard-header">
        <h2>Wybierz termin</h2>
        <p>Kiedy chcesz przyjść?</p>
      </div>
      
      <div class="booking-datetime">
        <div class="booking-datetime-section">
          <h3>Data</h3>
          <div id="bookingDateGrid" class="date-grid"></div>
        </div>
        
        <div class="booking-datetime-section">
          <h3>Godzina</h3>
          <div id="bookingTimeGrid" class="time-grid"></div>
        </div>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-secondary" onclick="goToStep('2')">Wstecz</button>
        <button class="btn btn-accent" id="step3Next" disabled onclick="goToStep('4')">Dalej</button>
      </div>
    </div>

    <!-- STEP 4: CONFIRMATION -->
    <?php elseif ($step === '4'): ?>
    <div class="wizard-step active" data-step="4">
      <div class="wizard-header">
        <h2>Potwierdź rezerwację</h2>
        <p>Sprawdź szczegóły przed potwierdzeniem</p>
      </div>

      <div class="booking-confirmation">
        <div class="confirm-card">
          <div class="confirm-icon"><span class="material-icons">store</span></div>
          <div class="confirm-details">
            <h4>Salon</h4>
            <p id="confirmSalon">—</p>
          </div>
        </div>

        <div class="confirm-card">
          <div class="confirm-icon"><span class="material-icons">content_cut</span></div>
          <div class="confirm-details">
            <h4>Usługa</h4>
            <p id="confirmService">—</p>
          </div>
        </div>

        <div class="confirm-card">
          <div class="confirm-icon"><span class="material-icons">person</span></div>
          <div class="confirm-details">
            <h4>Specjalista</h4>
            <p id="confirmStaff">—</p>
          </div>
        </div>

        <div class="confirm-card">
          <div class="confirm-icon"><span class="material-icons">calendar_today</span></div>
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
        <button class="btn btn-secondary" onclick="goToStep('3')">Wstecz</button>
        <button class="btn btn-accent" onclick="finalizeBooking()">Potwierdź rezerwację</button>
      </div>
    </div>

    <?php endif; ?>
  </div>
</div>

<script>
window.bookingState = {
  bizId: <?= json_encode($bizId) ?>,
  step: <?= json_encode($step) ?>,
  service: null,
  staff: null,
  date: null,
  time: null
};

function goToStep(step) {
  window.location.href = `/luminaphp/?page=booking&id=${window.bookingState.bizId}&step=${step}`;
}

function selectService(id, name, price, duration) {
  window.bookingState.service = { id, name, price, duration };
  goToStep('2');
}

function selectStaff(id, name, photo) {
  window.bookingState.staff = { id, name, photo };
  goToStep('3');
}
</script>
