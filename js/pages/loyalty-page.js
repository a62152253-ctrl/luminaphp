import { getPoints, showTierBadge, animatePointsAdd, loadRewards, redeemReward, loadHistory, addPoints }
  from '../modules/loyalty.js';
import { generateLink, ensureReferralCode, getStats } from '../modules/referral.js';
import { copyLink, shareNative } from '../modules/share.js';
import { escHtml, formatTimestamp, toast } from '../modules/utils.js';

const CHECKIN_POINTS = 10;

export async function initLoyalty() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  // Load points — show 0 immediately, update when data arrives
  try {
    const data = await getPoints(user.uid);
    const pts  = data.points || 0;
    animatePointsAdd('loyaltyPoints', 0, pts);
    showTierBadge('loyaltyTierBadge', pts);
  } catch (_) {}

  // Streak + daily checkin
  initCheckin(user.uid);

  // Points simulator
  document.getElementById('simCalcBtn')?.addEventListener('click', () => {
    const amount = Number(document.getElementById('simAmount')?.value) || 0;
    const pts    = Math.floor(amount / 2); // 1 pkt per 2 zł
    const el     = document.getElementById('simResult');
    if (el) el.textContent = pts ? `+${pts} punktów` : '';
  });

  // Referral link inside loyalty page
  try {
    await ensureReferralCode(user.uid);
    const link = generateLink(user.uid);
    const inp  = document.getElementById('loyaltyReferralLink');
    if (inp) inp.value = link;

    document.getElementById('copyReferralLinkBtn')?.addEventListener('click', async () => {
      await copyLink(link);
      toast('Link skopiowany!', 'success');
    });
    document.getElementById('shareReferralBtn')?.addEventListener('click', () =>
      shareNative('Dołącz do Lumina', 'Zarezerwuj wizytę w salonie beauty', link)
    );

    const stats   = await getStats(user.uid);
    const statsEl = document.getElementById('loyaltyReferralStats');
    if (statsEl) {
      statsEl.textContent = `Zaproszeni: ${stats.signups || 0} znajomych · Zdobyto: ${stats.bonuses || 0} pkt`;
    }
  } catch (_) {}

  // Rewards
  try {
    const rewards   = await loadRewards();
    const rewardsEl = document.getElementById('loyaltyRewards');
    if (rewardsEl) {
      const list = rewards.length ? rewards : defaultRewards();
      rewardsEl.innerHTML = list.map(r => `
        <div class="reward-card">
          <h4>${escHtml(r.name)}</h4>
          <p style="color:var(--text-muted);font-size:.85rem;margin:.25rem 0">${r.cost} pkt</p>
          <button class="btn btn-accent btn-sm" data-id="${escHtml(r.id)}" data-cost="${r.cost}" style="margin-top:.5rem">Wymień</button>
        </div>`).join('');
      rewardsEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (await redeemReward(user.uid, btn.dataset.id, Number(btn.dataset.cost))) {
            initLoyalty();
          }
        });
      });
    }
  } catch (_) {}

  // History
  try {
    const history = await loadHistory(user.uid);
    const histEl  = document.getElementById('loyaltyHistory');
    if (histEl) {
      histEl.innerHTML = history.length
        ? history.map(h => `
          <div class="loyalty-hist-row">
            <span>${escHtml(h.reason || 'Punkty')}</span>
            <span class="${h.amount > 0 ? 'text-success' : 'text-danger'}" style="font-weight:700;white-space:nowrap">${h.amount > 0 ? '+' : ''}${h.amount} pkt</span>
            <time>${formatTimestamp(h.createdAt)}</time>
          </div>`).join('')
        : '<p style="color:var(--text-muted);padding:.5rem 0">Brak historii punktów</p>';
    }
  } catch (_) {}

  // Share & export buttons
  document.getElementById('loyaltyShareBtn')?.addEventListener('click', () => {
    shareNative('Mój program lojalnościowy Lumina', 'Zbieram punkty w Lumina!', location.href);
  });
  document.getElementById('loyaltyExportBtn')?.addEventListener('click', () => exportHistory(user.uid));
  document.getElementById('loyaltyExportCsvBtn')?.addEventListener('click', () => exportHistory(user.uid));
}

// ── Daily check-in ──────────────────────────────────────────────
function initCheckin(uid) {
  const KEY_LAST  = `lumina_checkin_last_${uid}`;
  const KEY_STREAK = `lumina_checkin_streak_${uid}`;
  const KEY_WEEK  = `lumina_checkin_week_${uid}`;

  const today  = new Date().toDateString();
  const last   = localStorage.getItem(KEY_LAST);
  const streak = Number(localStorage.getItem(KEY_STREAK)) || 0;
  const done   = last === today;

  renderStreak(streak);
  renderWeekDots(uid, KEY_WEEK);

  const btn = document.getElementById('dailyCheckinBtn');
  if (!btn) return;

  if (done) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons">check_circle</span> Już zameldowany dziś';
    return;
  }

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = '...';
    try {
      await addPoints(uid, CHECKIN_POINTS, 'Codzienny meldunek');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = last === yesterday.toDateString() ? streak + 1 : 1;
      localStorage.setItem(KEY_LAST, today);
      localStorage.setItem(KEY_STREAK, String(newStreak));
      markTodayDot(KEY_WEEK);
      renderStreak(newStreak);
      btn.innerHTML = '<span class="material-icons">check_circle</span> Zameldowano! +10 pkt';
      toast(`+${CHECKIN_POINTS} punktów za meldunek!`, 'success');
      // Refresh points display
      const data = await getPoints(uid);
      animatePointsAdd('loyaltyPoints', data.points - CHECKIN_POINTS, data.points);
      showTierBadge('loyaltyTierBadge', data.points);
    } catch (_) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons">check_circle</span> Zamelduj się';
    }
  });
}

function renderStreak(streak) {
  const el = document.getElementById('loyaltyStreak');
  if (el) el.textContent = streak;
}

function renderWeekDots(uid, key) {
  const raw   = localStorage.getItem(key);
  const done  = raw ? JSON.parse(raw) : [];
  const today = new Date().getDay(); // 0=Sun
  document.querySelectorAll('.loyalty-week-dot').forEach((dot, i) => {
    // i=0 Mon … i=6 Sun → map to JS day: Mon=1..Sun=0
    const jsDay = i === 6 ? 0 : i + 1;
    if (done.includes(i)) dot.classList.add('done');
    if (jsDay === today)  dot.classList.add('today');
  });
}

function markTodayDot(key) {
  const raw  = localStorage.getItem(key);
  const done = raw ? JSON.parse(raw) : [];
  const i    = new Date().getDay(); // Sun=0
  const idx  = i === 0 ? 6 : i - 1; // convert to Mon-indexed
  if (!done.includes(idx)) {
    done.push(idx);
    localStorage.setItem(key, JSON.stringify(done));
  }
  document.querySelectorAll('.loyalty-week-dot')[idx]?.classList.add('done');
}

// ── CSV export ──────────────────────────────────────────────────
async function exportHistory(uid) {
  try {
    const history = await loadHistory(uid);
    if (!history.length) { toast('Brak historii do eksportu', 'error'); return; }
    const rows = [['Data', 'Powód', 'Punkty']];
    history.forEach(h => rows.push([formatTimestamp(h.createdAt), h.reason || '', h.amount]));
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'lumina-punkty.csv'; a.click();
    URL.revokeObjectURL(url);
  } catch (_) { toast('Błąd eksportu', 'error'); }
}

function defaultRewards() {
  return [
    { id: 'discount10', name: 'Rabat 10%',               cost: 200 },
    { id: 'freeAddon',  name: 'Dodatek gratis',           cost: 350 },
    { id: 'priority',   name: 'Priorytetowa rezerwacja',  cost: 500 },
  ];
}
