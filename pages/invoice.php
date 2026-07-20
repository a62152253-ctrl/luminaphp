<?php /* Szczegóły płatności / paragon */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Płatności i paragony</h1>
    <p>Historia transakcji i pobieranie dokumentów PDF</p>
  </header>

  <div id="subscriptionCard" class="features-card subscription-card"></div>

  <section class="features-card">
    <div class="invoice-toolbar">
      <div>
        <h3>Historia transakcji</h3>
        <p class="text-muted">Sortuj i przeglądaj swoje rachunki</p>
      </div>
      <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
        <select id="invoiceFilter" class="auth-input" aria-label="Filtruj transakcje">
          <option value="all">Wszystkie</option>
          <option value="paid">Opłacone</option>
          <option value="pending">W trakcie</option>
          <option value="refund">Zwroty</option>
        </select>
        <button id="downloadAllPdf" class="btn btn-ghost btn-sm"><span class="material-icons">download</span> Eksport PDF</button>
      </div>
    </div>
    <div id="transactionsList" class="transactions-list"></div>
  </section>

  <div id="invoiceDetail" class="invoice-detail hidden">
    <h3>Szczegóły transakcji</h3>
    <div id="invoiceDetailBody"></div>
    <button id="downloadInvoicePdf" class="btn btn-accent"><span class="material-icons">picture_as_pdf</span> Pobierz PDF</button>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>
