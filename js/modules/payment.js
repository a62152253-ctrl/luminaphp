/**
 * Płatności PayPal — 1 dzień trial, potem $2/mies. lub $15/rok
 * Odbiorca: jankom@eskp.pl
 */
import { db, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, updateDoc }
  from '../firebase-config.js';
import { toast } from './utils.js';

const PAYPAL_EMAIL = 'jankom@eskp.pl';
const PLANS = {
  monthly: { id: 'monthly', label: 'Miesięczny', price: 2, currency: 'USD', interval: 'month' },
  yearly:  { id: 'yearly',  label: 'Roczny',     price: 15, currency: 'USD', interval: 'year' },
};
const TRIAL_DAYS = 1;

let _paypalLoaded = false;

export function getPlans() { return PLANS; }

export async function initStripe() {
  if (_paypalLoaded || window.paypal) {
    _paypalLoaded = true;
    return window.paypal;
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD&intent=subscription';
    s.onload = () => { _paypalLoaded = true; resolve(window.paypal); };
    s.onerror = () => reject(new Error('Nie udało się załadować PayPal SDK'));
    document.head.appendChild(s);
  });
}

export async function getSubscription(uid) {
  const snap = await getDoc(doc(db, 'subscriptions', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function isTrialActive(sub) {
  if (!sub?.trialEndsAt) return false;
  const end = sub.trialEndsAt?.toDate?.() ?? new Date(sub.trialEndsAt);
  return end > new Date();
}

export function hasActiveAccess(sub) {
  if (!sub) return false;
  if (sub.status === 'active') return true;
  return isTrialActive(sub);
}

export async function startTrial(uid) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  await setDoc(doc(db, 'subscriptions', uid), {
    userId: uid,
    status: 'trial',
    plan: null,
    trialEndsAt: trialEnd,
    paypalEmail: PAYPAL_EMAIL,
    createdAt: serverTimestamp(),
  }, { merge: true });
  return trialEnd;
}

export async function processPayment(uid, planId = 'monthly') {
  const plan = PLANS[planId];
  if (!plan) throw new Error('Nieprawidłowy plan');

  const paypal = await initStripe();
  if (!paypal) throw new Error('PayPal niedostępny');

  return new Promise((resolve, reject) => {
    const container = document.getElementById('paypalButtonContainer');
    if (!container) { reject(new Error('Brak kontenera PayPal')); return; }
    container.innerHTML = '';

    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe' },
      createOrder: (_data, actions) => actions.order.create({
        purchase_units: [{
          amount: { currency_code: plan.currency, value: String(plan.price) },
          payee: { email_address: PAYPAL_EMAIL },
          description: `Lumina Premium — ${plan.label}`,
        }],
      }),
      onApprove: async (data) => {
        try {
          const sub = await activateSubscription(uid, planId, data.orderID);
          await recordTransaction(uid, {
            orderId: data.orderID,
            planId,
            amount: plan.price,
            currency: plan.currency,
            status: 'completed',
          });
          toast('Płatność zakończona pomyślnie', 'success');
          resolve(sub);
        } catch (e) {
          reject(e);
        }
      },
      onError: err => reject(err),
    }).render('#paypalButtonContainer');
  });
}

export async function activateSubscription(uid, planId, orderId) {
  const plan = PLANS[planId];
  const now = new Date();
  const periodEnd = new Date(now);
  if (planId === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  const data = {
    userId: uid,
    status: 'active',
    plan: planId,
    orderId,
    paypalEmail: PAYPAL_EMAIL,
    periodStart: now,
    periodEnd,
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'subscriptions', uid), data, { merge: true });
  return data;
}

export async function recordTransaction(uid, tx) {
  return addDoc(collection(db, 'transactions'), {
    userId: uid,
    ...tx,
    createdAt: serverTimestamp(),
  });
}

export async function handleWebhook(payload) {
  const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
  if (event.event_type === 'PAYMENT.SALE.REFUNDED') {
    const uid = event.resource?.custom_id;
    if (uid) await updateDoc(doc(db, 'subscriptions', uid), { status: 'refunded', updatedAt: serverTimestamp() });
  }
  if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const uid = event.resource?.custom_id;
    if (uid) await updateDoc(doc(db, 'subscriptions', uid), { status: 'active', updatedAt: serverTimestamp() });
  }
  return { ok: true };
}

export async function requestRefund(uid, transactionId, reason = '') {
  await addDoc(collection(db, 'refund_requests'), {
    userId: uid,
    transactionId,
    reason,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  toast('Wniosek o zwrot został złożony', 'success');
  return { status: 'pending' };
}

export async function loadTransactions(uid) {
  const { getDocs, query, where, orderBy } = await import('../firebase-config.js');
  const q = query(collection(db, 'transactions'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
