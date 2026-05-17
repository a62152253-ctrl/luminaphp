import { db, collection, getDocs, query, where } from '../firebase-config.js';
import { validateCode, applyCodeToBooking, removeCode } from '../modules/promo-codes.js';
import { escHtml, formatCurrency } from '../modules/utils.js';

export async function initOffers() {
  window.removePromo = removeCode;
  document.getElementById('promoApplyBtn')?.addEventListener('click', applyPromo);
  document.getElementById('promoRemoveBtn')?.addEventListener('click', removeCode);
  await loadOffers();
}

async function applyPromo() {
  const code = document.getElementById('promoCodeInput')?.value;
  const result = await validateCode(code);
  if (!result.valid) return;
  const el = document.getElementById('promoApplied');
  if (el) {
    el.classList.remove('hidden');
    el.textContent = `Kod ${result.promo.code}: -${result.promo.value}${result.promo.type === 'percent' ? '%' : ' zł'}`;
  }
  document.getElementById('promoRemoveBtn')?.classList.remove('hidden');
}

async function loadOffers() {
  const el = document.getElementById('offersGrid');
  if (!el) return;
  const snap = await getDocs(collection(db, 'promotions'));
  if (!snap.size) { el.innerHTML = '<p class="text-muted">Brak aktywnych promocji</p>'; return; }
  el.innerHTML = snap.docs.map(d => {
    const p = d.data();
    const ends = p.endsAt?.toDate?.() ?? null;
    return `<div class="offer-card">
      <div class="offer-badge">${escHtml(p.discount || p.title)}</div>
      <h3>${escHtml(p.title)}</h3>
      <p>${escHtml(p.description || '')}</p>
      ${ends ? `<div class="offer-countdown" data-ends="${ends.toISOString()}"></div>` : ''}
      <a href="?page=business&id=${escHtml(p.businessId)}" class="btn btn-accent btn-sm">Zarezerwuj</a>
    </motion-div>`;
  }).join('').replace(/motion-div>/g, 'div>');
  startCountdowns();
}

function startCountdowns() {
  document.querySelectorAll('.offer-countdown').forEach(el => {
    const end = new Date(el.dataset.ends);
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { el.textContent = 'Wygasła'; return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      el.textContent = `Koniec za: ${h}h ${m}m`;
      requestAnimationFrame(tick);
    };
    tick();
  });
}
