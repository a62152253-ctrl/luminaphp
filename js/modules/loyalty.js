import { db, doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, increment }
  from '../firebase-config.js';
import { toast, escHtml } from './utils.js';

export const TIERS = [
  { id: 'bronze', label: 'Bronze', min: 0,   color: '#cd7f32', icon: 'workspace_premium' },
  { id: 'silver', label: 'Silver', min: 500, color: '#94a3b8', icon: 'military_tech' },
  { id: 'gold',   label: 'Gold',   min: 1500, color: '#fbbf24', icon: 'emoji_events' },
];

const POINTS_PER_VISIT = 50;

export async function getPoints(uid) {
  const snap = await getDoc(doc(db, 'loyalty', uid));
  if (!snap.exists()) return { points: 0, tier: 'bronze', history: [] };
  return snap.data();
}

export function getTier(points) {
  let tier = TIERS[0];
  for (const t of TIERS) if (points >= t.min) tier = t;
  return tier;
}

export function showTierBadge(containerId, points) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const tier = getTier(points);
  el.innerHTML = `<span class="tier-badge tier-badge--${tier.id}" style="--tier-color:${tier.color}">
    <span class="material-icons">${tier.icon}</span>${escHtml(tier.label)}
  </span>`;
}

export async function addPoints(uid, amount, reason = 'Wizyta') {
  const ref = doc(db, 'loyalty', uid);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data().points || 0 : 0;
  const newPoints = current + amount;
  const tier = getTier(newPoints).id;

  await setDoc(ref, {
    userId: uid,
    points: newPoints,
    tier,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await addDoc(collection(db, 'loyalty_history'), {
    userId: uid,
    amount,
    reason,
    balance: newPoints,
    createdAt: serverTimestamp(),
  });

  return newPoints;
}

export function animatePointsAdd(containerId, from, to) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const start = performance.now();
  const duration = 800;
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export async function redeemReward(uid, rewardId, cost) {
  const data = await getPoints(uid);
  if ((data.points || 0) < cost) {
    toast('Za mało punktów', 'error');
    return false;
  }
  await updateDoc(doc(db, 'loyalty', uid), {
    points: increment(-cost),
    updatedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'loyalty_redemptions'), {
    userId: uid,
    rewardId,
    cost,
    createdAt: serverTimestamp(),
  });
  toast('Nagroda wymieniona!', 'success');
  return true;
}

export async function awardVisitPoints(uid) {
  return addPoints(uid, POINTS_PER_VISIT, 'Zakończona wizyta');
}

export async function loadRewards() {
  const snap = await getDocs(collection(db, 'loyalty_rewards'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function loadHistory(uid) {
  const q = query(collection(db, 'loyalty_history'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
