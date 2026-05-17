import { loadTransactions, getSubscription, hasActiveAccess, getPlans } from '../modules/payment.js';
import { formatCurrency, formatTimestamp, escHtml } from '../modules/utils.js';

export async function initInvoice() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const sub = await getSubscription(user.uid);
  renderSubscription(sub);
  const txs = await loadTransactions(user.uid);
  renderTransactions(txs);

  document.getElementById('downloadAllPdf')?.addEventListener('click', () => downloadPdf(txs));
  document.getElementById('downloadInvoicePdf')?.addEventListener('click', () => {
    const detail = window._selectedTx;
    if (detail) downloadPdf([detail]);
  });
}

function renderSubscription(sub) {
  const el = document.getElementById('subscriptionCard');
  if (!el) return;
  const plans = getPlans();
  el.innerHTML = sub ? `
    <h3>Subskrypcja Premium</h3>
    <p>Status: <strong>${hasActiveAccess(sub) ? 'Aktywna' : 'Wygasła'}</strong></p>
    <p>Plan: ${sub.plan ? plans[sub.plan]?.label : 'Trial (1 dzień)'}</p>
    <p>Płatności PayPal → jankom@eskp.pl</p>
   : '<p>Brak subskrypcji</p>';
}

function renderTransactions(txs) {
  const el = document.getElementById('transactionsList');
  if (!el) return;
  if (!txs.length) { el.innerHTML = '<p class="text-muted">Brak transakcji</p>'; return; }
  el.innerHTML = txs.map(t => `
    <div class="tx-row" data-id="${escHtml(t.id)}">
      <span>${formatTimestamp(t.createdAt)}</span>
      <span>${formatCurrency(t.amount)} ${t.currency || 'USD'}</span>
      <span class="tx-status tx-status--${escHtml(t.status)}">${escHtml(t.status)}</span>
      <button class="btn btn-ghost btn-sm tx-detail-btn">Szczegóły</button>
    </div>`).join('');
  el.querySelectorAll('.tx-detail-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => showDetail(txs[i]));
  });
}

function showDetail(tx) {
  window._selectedTx = tx;
  const panel = document.getElementById('invoiceDetail');
  const body = document.getElementById('invoiceDetailBody');
  panel?.classList.remove('hidden');
  if (body) body.innerHTML = `
    <p>ID: ${escHtml(tx.orderId || tx.id)}</p>
    <p>Kwota: ${formatCurrency(tx.amount)}</p>
    <p>Status: ${escHtml(tx.status)}</p>`;
}

function downloadPdf(txs) {
  const content = txs.map(t =>
    `${formatTimestamp(t.createdAt)} | ${t.amount} ${t.currency || 'USD'} | ${t.status}`
  ).join('\n');
  const blob = new Blob([`LUMINA — PARAGON\n\n${content}`], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lumina-paragon.txt';
  a.click();
}
