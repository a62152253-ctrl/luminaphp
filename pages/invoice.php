<?php /* Szczegóły płatności / paragon */ ?>
<div class="features-page container">
  <header class="features-hero lumina-page-head">
    <h1>Płatności i paragony</h1>
    <p>Historia transakcji i pobieranie dokumentów PDF</p>
  </header>

  <div id="subscriptionCard" class="features-card subscription-card"></div>

  <section class="features-card">
    <div class="invoice-toolbar">
      <h3>Historia transakcji</h3>
      <button id="downloadAllPdf" class="btn btn-ghost btn-sm"><span class="material-icons">download</span> Eksport PDF</button>
    </div>
    <div id="transactionsList" class="transactions-list"></div>
  </section>

  <div id="invoiceDetail" class="invoice-detail hidden">
    <h3>Szczegóły transakcji</h3>
    <div id="invoiceDetailBody"></div>
    <button id="downloadInvoicePdf" class="btn btn-accent"><span class="material-icons">picture_as_pdf</span> Pobierz PDF</button>
  </div>
</div>
