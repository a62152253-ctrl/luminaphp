import { getPoints, showTierBadge, animatePointsAdd, loadRewards, redeemReward, loadHistory, TIERS }
  from '../modules/loyalty.js';
import { escHtml, formatTimestamp } from '../modules/utils.js';

export async function initLoyalty() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const data = await getPoints(user.uid);
  const pts = data.points || 0;
  const prev = Number(document.getElementById('loyaltyPoints')?.textContent) || 0;
  animatePointsAdd('loyaltyPoints', prev, pts);
  showTierBadge('loyaltyTierBadge', pts);

  const rewards = await loadRewards();
  const rewardsEl = document.getElementById('loyaltyRewards');
  if (rewardsEl) {
    rewardsEl.innerHTML = (rewards.length ? rewards : defaultRewards()).map(r => `
      <div class="reward-card">
        <h4>${escHtml(r.name)}</h4>
        <p>${r.cost} pkt</p>
        <button class="btn btn-accent btn-sm" data-id="${escHtml(r.id)}" data-cost="${r.cost}">Wymień</button>
      </motion-div>`).join('').replace(/motion-div>/g, 'div>');
    rewardsEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (await redeemReward(user.uid, btn.dataset.id, Number(btn.dataset.cost))) {
          initLoyalty();
        }
      });
    });
  }

  const history = await loadHistory(user.uid);
  const histEl = document.getElementById('loyaltyHistory');
  if (histEl) {
    histEl.innerHTML = history.length ? history.map(h => `
      <div class="loyalty-hist-row">
        <span>${escHtml(h.reason)}</span>
        <span class="${h.amount > 0 ? 'text-success' : 'text-danger'}">${h.amount > 0 ? '+' : ''}${h.amount}</span>
        <time>${formatTimestamp(h.createdAt)}</time>
      </motion-div>`).join('').replace(/motion-div>/g, 'div>') : '<p class="text-muted">Brak historii</p>';
  }
}

function defaultRewards() {
  return [
    { id: 'discount10', name: 'Rabat 10%', cost: 200 },
    { id: 'freeAddon', name: 'Dodatek gratis', cost: 350 },
    { id: 'priority', name: 'Priorytetowa rezerwacja', cost: 500 },
  ];
}
