import { db, collection, query, where, getDocs, orderBy } from '../firebase-config.js';
import { toast, formatDatePl, formatCurrency } from '../modules/utils.js';
import { saveProfile, onProfilePhotoChange } from '../modules/profile-mgr.js';
import { initStripe, processPayment, getSubscription, startTrial, hasActiveAccess, getPlans } from '../modules/payment.js';
import { getPoints, showTierBadge } from '../modules/loyalty.js';
import { initLanguageSwitcher } from '../modules/i18n.js';
import { bindImageInput } from '../modules/image-upload.js';

export async function initProfile() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  initLanguageSwitcher();
  fillProfile(user);
  await loadAppointments(user.uid);
  await initSubscription(user.uid);

  document.getElementById('profileSaveBtn')?.addEventListener('click', async () => {
    document.getElementById('profileNickInput').value = document.getElementById('profileDisplayName')?.value;
    await saveProfile();
    toast('Profil zapisany', 'success');
  });

  document.getElementById('profilePagePhoto')?.addEventListener('change', async e => {
    const fakeInput = { files: e.target.files };
    onProfilePhotoChange(fakeInput);
    const avatar = document.getElementById('profilePageAvatar');
    if (window.App?.user?.photoURL && avatar) avatar.src = window.App.user.photoURL;
  });

  document.querySelectorAll('.payment-plan').forEach(el => {
    el.addEventListener('click', () => processPayment(user.uid, el.dataset.plan));
  });
}

function fillProfile(user) {
  document.getElementById('profilePageAvatar').src = user.photoURL || 'https://i.pravatar.cc/200';
  document.getElementById('profilePageName').textContent = user.displayName || 'Użytkownik';
  document.getElementById('profilePageEmail').textContent = user.email || '';
  document.getElementById('profileDisplayName').value = user.displayName || '';
  document.getElementById('profilePhone').value = window.App?.userDoc?.phone || '';
  getPoints(user.uid).then(d => showTierBadge('profileTierBadge', d.points || 0));
}

async function loadAppointments(uid) {
  const el = document.getElementById('profileAppointments');
  if (!el) return;
  const q = query(collection(db, 'appointments'), where('userId', '==', uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  if (!snap.size) { el.innerHTML = '<p class="text-muted">Brak wizyt</p>'; return; }
  el.innerHTML = snap.docs.slice(0, 10).map(d => {
    const a = d.data();
    return `<div class="appt-row"><span>${formatDatePl(a.date)} ${a.time}</span><span>${formatCurrency(a.price)}</span></div>`;
  }).join('');
}

async function initSubscription(uid) {
  let sub = await getSubscription(uid);
  if (!sub) sub = await startTrial(uid);
  const status = document.getElementById('subscriptionStatus');
  if (status) {
    status.textContent = hasActiveAccess(sub)
      ? `Aktywny dostęp (${sub.plan || 'trial'})`
      : 'Trial wygasł — wybierz plan';
  }
  try { await initStripe(); } catch { /* sandbox */ }
}
