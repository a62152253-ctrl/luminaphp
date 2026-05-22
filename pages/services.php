<?php
// $bizId injected by index.php — provide fallback for IDE / direct include
$bizId ??= '';
?>

<div class="services-page">
  <div class="page-header">
    <div class="page-header-content">
      <h1>Zarządzanie usługami</h1>
      <p>Dodawaj, edytuj i organizuj usługi swojego salonu</p>
    </div>
    <button class="btn btn-accent" onclick="openServiceModal()"
      aria-label="Dodaj nową usługę">
      <span class="material-icons" aria-hidden="true">add</span> Dodaj usługę
    </button>
  </div>

  <div class="services-layout">
    <!-- Categories Sidebar -->
    <aside class="services-categories" aria-label="Kategorie usług">
      <h3>Kategorie</h3>
      <nav class="category-nav" aria-label="Filtruj po kategorii">
        <a href="#" class="category-link active" data-category="all">
          <span class="material-icons" aria-hidden="true">apps</span> Wszystkie
        </a>
        <a href="#" class="category-link" data-category="strzyzenie">
          <span class="material-icons" aria-hidden="true">content_cut</span> Strzyżenie
        </a>
        <a href="#" class="category-link" data-category="broda">
          <span class="material-icons" aria-hidden="true">face</span> Broda
        </a>
        <a href="#" class="category-link" data-category="combo">
          <span class="material-icons" aria-hidden="true">star</span> Combo
        </a>
        <a href="#" class="category-link" data-category="inne">
          <span class="material-icons" aria-hidden="true">more_horiz</span> Inne
        </a>
      </nav>

      <div class="category-stats" aria-label="Statystyki usług">
        <div class="stat-item">
          <span class="stat-label">Łącznie usług</span>
          <span class="stat-value" id="totalServices" aria-live="polite">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Średnia cena</span>
          <span class="stat-value" id="avgPrice" aria-live="polite">0 zł</span>
        </div>
      </div>
    </aside>

    <!-- Services Grid -->
    <main class="services-main">
      <div class="services-toolbar">
        <label for="serviceSearch" class="sr-only">Szukaj usługi</label>
        <input type="search" class="search-input" id="serviceSearch"
          placeholder="Szukaj usługi..." autocomplete="off"
          aria-label="Szukaj usługi">
        <div class="view-toggle" role="group" aria-label="Widok listy">
          <button class="view-btn active" data-view="grid"
            aria-pressed="true" aria-label="Widok siatki">
            <span class="material-icons" aria-hidden="true">grid_view</span>
          </button>
          <button class="view-btn" data-view="list"
            aria-pressed="false" aria-label="Widok listy">
            <span class="material-icons" aria-hidden="true">list</span>
          </button>
        </div>
      </div>

      <div id="servicesContainer" class="services-container grid-view" aria-live="polite">
        <div class="spinner" style="margin:3rem auto" role="status" aria-label="Ładowanie usług"></div>
      </div>
    </main>
  </div>
</div>

<!-- Service Modal -->
<div class="modal-overlay hidden" id="serviceModal"
  role="dialog" aria-modal="true" aria-labelledby="serviceModalTitle">
  <div class="modal">
    <div class="modal-header">
      <h3 id="serviceModalTitle">Dodaj usługę</h3>
      <button class="modal-close" onclick="closeServiceModal()"
        aria-label="Zamknij formularz usługi">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="modal-body">
      <div id="serviceModalError" class="modal-error-msg" role="alert" style="display:none"></div>
      <input type="hidden" id="serviceEditId">
      <div class="form-grid">
        <div class="form-field">
          <label for="svcName">Nazwa usługi *</label>
          <input type="text" id="svcName" class="form-input"
            placeholder="np. Strzyżenie męskie"
            required aria-required="true">
        </div>
        <div class="form-field">
          <label for="svcCategory">Kategoria *</label>
          <select id="svcCategory" class="form-input" required aria-required="true">
            <option value="strzyzenie">Strzyżenie</option>
            <option value="broda">Broda</option>
            <option value="combo">Combo</option>
            <option value="inne">Inne</option>
          </select>
        </div>
        <div class="form-field">
          <label for="svcDuration">Czas trwania (min) *</label>
          <input type="number" id="svcDuration" class="form-input"
            placeholder="30" min="5" required aria-required="true">
        </div>
        <div class="form-field">
          <label for="svcPrice">Cena (zł) *</label>
          <input type="number" id="svcPrice" class="form-input"
            placeholder="50" min="0" step="0.01" required aria-required="true">
        </div>
        <div class="form-field full-width">
          <label for="svcDescription">Opis (opcjonalnie)</label>
          <textarea id="svcDescription" class="form-input" rows="3"
            placeholder="Szczegóły usługi..."></textarea>
        </div>
        <div class="form-field full-width">
          <label>Przypisani pracownicy</label>
          <div id="staffCheckboxes" class="staff-checkboxes" role="group"
            aria-label="Wybierz pracowników dla tej usługi"></div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeServiceModal()">Anuluj</button>
      <button class="btn btn-accent" onclick="saveService()">Zapisz</button>
    </div>
  </div>
</div>

<script>
window.servicesPage = {
  bizId: <?= json_encode($bizId) ?>,
  currentCategory: 'all',
  currentView: 'grid',
};

function showServiceError(msg) {
  const err = document.getElementById('serviceModalError');
  if (!err) return;
  err.textContent = msg;
  err.style.display = 'block';
}

function hideServiceError() {
  const err = document.getElementById('serviceModalError');
  if (err) err.style.display = 'none';
}

function openServiceModal(id = null) {
  document.getElementById('serviceEditId').value = id ?? '';
  document.getElementById('serviceModalTitle').textContent = id ? 'Edytuj usługę' : 'Dodaj usługę';
  hideServiceError();
  document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.add('hidden');
  hideServiceError();
  ['svcName', 'svcDuration', 'svcPrice', 'svcDescription'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function saveService() {
  const name = document.getElementById('svcName')?.value.trim();
  if (!name) {
    showServiceError('Podaj nazwę usługi.');
    document.getElementById('svcName')?.focus();
    return false;
  }
  hideServiceError();
  closeServiceModal();
  return true;
}
</script>
