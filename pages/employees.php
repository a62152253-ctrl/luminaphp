<?php /* Employees Management Page - Standalone employees management */
$bizId = $_GET['id'] ?? '';
?>

<div class="employees-page">
  <div class="page-header">
    <div class="page-header-content">
      <h1>Zarządzanie pracownikami</h1>
      <p>Dodawaj, edytuj i zarządzaj zespołem</p>
    </div>
    <button class="btn btn-accent" onclick="openEmployeeModal()">
      <span class="material-icons">person_add</span> Dodaj pracownika
    </button>
  </div>

  <div class="employees-stats">
    <div class="emp-stat-card">
      <div class="emp-stat-icon"><span class="material-icons">people</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="totalEmployees">0</div>
        <div class="emp-stat-label">Pracowników</div>
      </div>
    </div>
    <div class="emp-stat-card">
      <div class="emp-stat-icon"><span class="material-icons">event_available</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="activeToday">0</div>
        <div class="emp-stat-label">Aktywnych dziś</div>
      </div>
    </div>
    <div class="emp-stat-card">
      <div class="emp-stat-icon"><span class="material-icons">star</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="avgRating">0.0</div>
        <div class="emp-stat-label">Średnia ocena</div>
      </div>
    </div>
    <div class="emp-stat-card">
      <div class="emp-stat-icon"><span class="material-icons">payments</span></div>
      <div class="emp-stat-info">
        <div class="emp-stat-value" id="totalRevenue">0 zł</div>
        <div class="emp-stat-label">Przychód (miesiąc)</div>
      </div>
    </div>
  </div>

  <div class="employees-layout">
    <!-- Employees List -->
    <main class="employees-main">
      <div class="employees-toolbar">
        <input type="text" class="search-input" placeholder="Szukaj pracownika..." id="employeeSearch">
        <select class="filter-select" id="employeeFilter">
          <option value="all">Wszyscy</option>
          <option value="active">Aktywni</option>
          <option value="inactive">Nieaktywni</option>
        </select>
      </div>

      <div id="employeesContainer" class="employees-container">
        <div class="spinner" style="margin:3rem auto"></div>
      </div>
    </main>

    <!-- Employee Details Panel -->
    <aside class="employee-details" id="employeeDetailsPanel">
      <div class="employee-details-empty">
        <span class="material-icons">person_outline</span>
        <p>Wybierz pracownika, aby zobaczyć szczegóły</p>
      </div>
    </aside>
  </div>
</div>

<!-- Employee Modal -->
<div class="modal-overlay hidden" id="employeeModal">
  <div class="modal modal-large">
    <div class="modal-header">
      <h3 id="employeeModalTitle">Dodaj pracownika</h3>
      <button class="modal-close" onclick="closeEmployeeModal()">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="employeeEditId">
      <div class="form-grid">
        <div class="form-field">
          <label>Imię i nazwisko *</label>
          <input type="text" id="empName" class="form-input" placeholder="Anna Kowalska">
        </div>
        <div class="form-field">
          <label>Stanowisko *</label>
          <input type="text" id="empTitle" class="form-input" placeholder="Fryzjer">
        </div>
        <div class="form-field">
          <label>Email</label>
          <input type="email" id="empEmail" class="form-input" placeholder="anna@example.com">
        </div>
        <div class="form-field">
          <label>Telefon</label>
          <input type="tel" id="empPhone" class="form-input" placeholder="+48 123 456 789">
        </div>
        <div class="form-field full-width">
          <label>URL zdjęcia</label>
          <input type="url" id="empPhoto" class="form-input" placeholder="https://...">
        </div>
        <div class="form-field full-width">
          <label>Opis / Bio</label>
          <textarea id="empBio" class="form-input" rows="3" placeholder="Krótki opis..."></textarea>
        </div>
        <div class="form-field">
          <label>Prowizja (%)</label>
          <input type="number" id="empCommission" class="form-input" placeholder="10" min="0" max="100">
        </div>
        <div class="form-field">
          <label>Status</label>
          <select id="empStatus" class="form-input">
            <option value="active">Aktywny</option>
            <option value="inactive">Nieaktywny</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h4>Grafik pracy</h4>
        <div id="empScheduleGrid" class="schedule-grid">
          <!-- Populated by JS -->
        </div>
      </div>

      <div class="form-section">
        <h4>Przypisane usługi</h4>
        <div id="empServicesCheckboxes" class="services-checkboxes">
          <!-- Populated by JS -->
        </div>
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
  selectedEmployee: null
};

function openEmployeeModal(id = null) {
  document.getElementById('employeeEditId').value = id || '';
  document.getElementById('employeeModalTitle').textContent = id ? 'Edytuj pracownika' : 'Dodaj pracownika';
  document.getElementById('employeeModal').classList.remove('hidden');
}

function closeEmployeeModal() {
  document.getElementById('employeeModal').classList.add('hidden');
  // Clear form
  document.getElementById('empName').value = '';
  document.getElementById('empTitle').value = '';
  document.getElementById('empEmail').value = '';
  document.getElementById('empPhone').value = '';
  document.getElementById('empPhoto').value = '';
  document.getElementById('empBio').value = '';
  document.getElementById('empCommission').value = '';
}

function saveEmployee() {
  const name = document.getElementById('empName')?.value.trim();
  if (!name) {
    alert('Podaj imię i nazwisko pracownika.');
    return false;
  }
  closeEmployeeModal();
  return true;
}

function showEmployeeDetails(employeeId) {
  if (!employeeId) { return null; }
  const panel = document.getElementById('employeeDetailsPanel');
  if (panel) panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  return employeeId;
}
</script>
