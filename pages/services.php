<?php /* Services Management Page - Standalone services management */
$bizId = $_GET['id'] ?? '';
?>

<div class="services-page">
  <div class="page-header">
    <div class="page-header-content">
      <h1>Zarządzanie usługami</h1>
      <p>Dodawaj, edytuj i organizuj usługi swojego salonu</p>
    </div>
    <button class="btn btn-accent" onclick="openServiceModal()">
      <span class="material-icons">add</span> Dodaj usługę
    </button>
  </div>

  <div class="services-layout">
    <!-- Categories Sidebar -->
    <aside class="services-categories">
      <h3>Kategorie</h3>
      <nav class="category-nav">
        <a href="#" class="category-link active" data-category="all">
          <span class="material-icons">apps</span> Wszystkie
        </a>
        <a href="#" class="category-link" data-category="strzyzenie">
          <span class="material-icons">content_cut</span> Strzyżenie
        </a>
        <a href="#" class="category-link" data-category="broda">
          <span class="material-icons">face</span> Broda
        </a>
        <a href="#" class="category-link" data-category="combo">
          <span class="material-icons">star</span> Combo
        </a>
        <a href="#" class="category-link" data-category="inne">
          <span class="material-icons">more_horiz</span> Inne
        </a>
      </nav>
      
      <div class="category-stats">
        <div class="stat-item">
          <span class="stat-label">Łącznie usług</span>
          <span class="stat-value" id="totalServices">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Średnia cena</span>
          <span class="stat-value" id="avgPrice">0 zł</span>
        </div>
      </div>
    </aside>

    <!-- Services Grid -->
    <main class="services-main">
      <div class="services-toolbar">
        <input type="text" class="search-input" placeholder="Szukaj usługi..." id="serviceSearch">
        <div class="view-toggle">
          <button class="view-btn active" data-view="grid">
            <span class="material-icons">grid_view</span>
          </button>
          <button class="view-btn" data-view="list">
            <span class="material-icons">list</span>
          </button>
        </div>
      </div>

      <div id="servicesContainer" class="services-container grid-view">
        <div class="spinner" style="margin:3rem auto"></div>
      </div>
    </main>
  </div>
</div>

<!-- Service Modal -->
<div class="modal-overlay hidden" id="serviceModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="serviceModalTitle">Dodaj usługę</h3>
      <button class="modal-close" onclick="closeServiceModal()">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="serviceEditId">
      <div class="form-grid">
        <div class="form-field">
          <label>Nazwa usługi *</label>
          <input type="text" id="svcName" class="form-input" placeholder="np. Strzyżenie męskie">
        </div>
        <div class="form-field">
          <label>Kategoria *</label>
          <select id="svcCategory" class="form-input">
            <option value="strzyzenie">Strzyżenie</option>
            <option value="broda">Broda</option>
            <option value="combo">Combo</option>
            <option value="inne">Inne</option>
          </select>
        </div>
        <div class="form-field">
          <label>Czas trwania (min) *</label>
          <input type="number" id="svcDuration" class="form-input" placeholder="30">
        </div>
        <div class="form-field">
          <label>Cena (zł) *</label>
          <input type="number" id="svcPrice" class="form-input" placeholder="50">
        </div>
        <div class="form-field full-width">
          <label>Opis (opcjonalnie)</label>
          <textarea id="svcDescription" class="form-input" rows="3" placeholder="Szczegóły usługi..."></textarea>
        </div>
        <div class="form-field full-width">
          <label>Przypisani pracownicy</label>
          <div id="staffCheckboxes" class="staff-checkboxes">
            <!-- Populated by JS -->
          </div>
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
  bizId: '<?= $bizId ?>',
  currentCategory: 'all',
  currentView: 'grid'
};

function openServiceModal(id = null) {
  document.getElementById('serviceEditId').value = id || '';
  document.getElementById('serviceModalTitle').textContent = id ? 'Edytuj usługę' : 'Dodaj usługę';
  document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.add('hidden');
  // Clear form
  document.getElementById('svcName').value = '';
  document.getElementById('svcDuration').value = '';
  document.getElementById('svcPrice').value = '';
  document.getElementById('svcDescription').value = '';
}

function saveService() {
  // Implementation
  closeServiceModal();
}
</script>
