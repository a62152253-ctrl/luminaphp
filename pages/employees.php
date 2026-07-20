<?php
// $bizId injected by index.php — provide fallback for IDE / direct include
$bizId ??= '';
?>

<div class="employees-page">
  <div class="page-header">
    <div class="page-header-content">
      <h1>Zarządzanie pracownikami</h1>
      <p>Dodawaj, edytuj i zarządzaj zespołem</p>
    </div>
    <button class="btn btn-accent" onclick="openEmployeeModal()"
      aria-label="Dodaj nowego pracownika">
      <span class="material-icons" aria-hidden="true">person_add</span> Dodaj pracownika
    </button>
  </div>

  <div class="employees-stats" aria-label="Statystyki zespołu">
    <div class="emp-stat-card">
      <div class="emp-stat-icon" aria-hidden="true"><span class="material-icons">people</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="totalEmployees" aria-live="polite">0</div>
        <div class="emp-stat-label">Pracowników</div>
      </div>
    </div>
    <div class="emp-stat-card">
      <div class="emp-stat-icon" aria-hidden="true"><span class="material-icons">event_available</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="activeToday" aria-live="polite">0</div>
        <div class="emp-stat-label">Aktywnych dziś</div>
      </div>
    </div>
    <div class="emp-stat-card">
      <div class="emp-stat-icon" aria-hidden="true"><span class="material-icons">star</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="avgRating" aria-live="polite">0.0</div>
        <div class="emp-stat-label">Średnia ocena</div>
      </div>
    </div>
    <div class="emp-stat-card">
      <div class="emp-stat-icon" aria-hidden="true"><span class="material-icons">payments</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="totalRevenue" aria-live="polite">0 zł</div>
        <div class="emp-stat-label">Przychód (miesiąc)</div>
      </div>
    </div>
  </div>

  <div class="employees-layout">
    <main class="employees-main">
      <div class="employees-toolbar">
        <label for="employeeSearch" class="sr-only">Szukaj pracownika</label>
        <input type="search" class="search-input" id="employeeSearch"
          placeholder="Szukaj pracownika..." autocomplete="off"
          aria-label="Szukaj pracownika po imieniu">
        <label for="employeeFilter" class="sr-only">Filtruj pracowników</label>
        <select class="filter-select" id="employeeFilter" aria-label="Filtruj pracowników">
          <option value="all">Wszyscy</option>
          <option value="active">Aktywni</option>
          <option value="inactive">Nieaktywni</option>
        </select>
        <label for="employeeSort" class="sr-only">Sortuj pracowników</label>
        <select class="filter-select" id="employeeSort" aria-label="Sortuj pracowników">
          <option value="recent">Najnowsi</option>
          <option value="rating">Ocena</option>
          <option value="bookings">Liczba wizyt</option>
        </select>
      </div>

      <div id="employeesContainer" class="employees-container" aria-live="polite">
        <div class="spinner" style="margin:3rem auto" role="status" aria-label="Ładowanie pracowników"></div>
      </div>
    </main>

    <aside class="employee-details" id="employeeDetailsPanel"
      aria-label="Szczegóły pracownika" aria-live="polite">
      <div class="employee-details-empty">
        <span class="material-icons" aria-hidden="true">person_outline</span>
        <p>Wybierz pracownika, aby zobaczyć szczegóły</p>
      </div>
    </aside>
  </div>
</div>

<!-- Employee Modal -->
<div class="modal-overlay hidden" id="employeeModal"
  role="dialog" aria-modal="true" aria-labelledby="employeeModalTitle">
  <div class="modal modal-large">
    <div class="modal-header">
      <h3 id="employeeModalTitle">Dodaj pracownika</h3>
      <button class="modal-close" onclick="closeEmployeeModal()"
        aria-label="Zamknij formularz pracownika">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="modal-body">
      <div id="employeeModalError" class="modal-error-msg" role="alert" style="display:none"></div>
      <input type="hidden" id="employeeEditId">
      <div class="form-grid">
        <div class="form-field">
          <label for="empName">Imię i nazwisko *</label>
          <input type="text" id="empName" class="form-input"
            placeholder="Anna Kowalska" autocomplete="name"
            required aria-required="true">
        </div>
        <div class="form-field">
          <label for="empTitle">Stanowisko *</label>
          <input type="text" id="empTitle" class="form-input" placeholder="Fryzjer"
            required aria-required="true">
        </div>
        <div class="form-field">
          <label for="empEmail">Email</label>
          <input type="email" id="empEmail" class="form-input"
            placeholder="anna@example.com" autocomplete="email">
        </div>
        <div class="form-field">
          <label for="empPhone">Telefon</label>
          <input type="tel" id="empPhone" class="form-input"
            placeholder="+48 123 456 789" autocomplete="tel">
        </div>
        <div class="form-field full-width">
          <label for="empPhoto">URL zdjęcia</label>
          <input type="url" id="empPhoto" class="form-input" placeholder="https://...">
        </div>
        <div class="form-field full-width">
          <label for="empBio">Opis / Bio</label>
          <textarea id="empBio" class="form-input" rows="3"
            placeholder="Krótki opis..."></textarea>
        </div>
        <div class="form-field">
          <label for="empCommission">Prowizja (%)</label>
          <input type="number" id="empCommission" class="form-input"
            placeholder="10" min="0" max="100">
        </div>
        <div class="form-field">
          <label for="empStatus">Status</label>
          <select id="empStatus" class="form-input">
            <option value="active">Aktywny</option>
            <option value="inactive">Nieaktywny</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h4>Grafik pracy</h4>
        <div id="empScheduleGrid" class="schedule-grid" role="group"
          aria-label="Dni i godziny pracy"></div>
      </div>

      <div class="form-section">
        <h4>Przypisane usługi</h4>
        <div id="empServicesCheckboxes" class="services-checkboxes" role="group"
          aria-label="Usługi wykonywane przez pracownika"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeEmployeeModal()">Anuluj</button>
      <button class="btn btn-accent" onclick="saveEmployee()">Zapisz</button>
    </div>
  </div>
</div>

<script>
window.employeesPage = {
  bizId: <?= json_encode($bizId) ?>,
  selectedEmployee: null,
};

function showEmployeeError(msg) {
  const err = document.getElementById('employeeModalError');
  if (!err) return;
  err.textContent = msg;
  err.style.display = 'block';
}

function hideEmployeeError() {
  const err = document.getElementById('employeeModalError');
  if (err) err.style.display = 'none';
}

function openEmployeeModal(id = null) {
  document.getElementById('employeeEditId').value = id ?? '';
  document.getElementById('employeeModalTitle').textContent = id ? 'Edytuj pracownika' : 'Dodaj pracownika';
  hideEmployeeError();
  document.getElementById('employeeModal').classList.remove('hidden');
}

function closeEmployeeModal() {
  document.getElementById('employeeModal').classList.add('hidden');
  hideEmployeeError();
  ['empName', 'empTitle', 'empEmail', 'empPhone', 'empPhoto', 'empBio', 'empCommission'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function saveEmployee() {
  const name = document.getElementById('empName')?.value.trim();
  if (!name) {
    showEmployeeError('Podaj imię i nazwisko pracownika.');
    document.getElementById('empName')?.focus();
    return false;
  }
  hideEmployeeError();
  closeEmployeeModal();
  return true;
}

function showEmployeeDetails(employeeId) {
  if (!employeeId) return;
  const panel = document.getElementById('employeeDetailsPanel');
  if (panel) {
    panel.innerHTML = '<div class="loading"><div class="spinner" role="status" aria-label="Ładowanie szczegółów"></div></div>';
  }
  window.employeesPage.selectedEmployee = employeeId;
}
</script>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
