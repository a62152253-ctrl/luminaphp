import { db, collection, getDocs, query, where, doc, getDoc, updateDoc, increment, serverTimestamp, addDoc }
  from '../firebase-config.js';
import { toast } from './utils.js';

export async function validateCode(code, businessId = null) {
  if (!code?.trim()) return { valid: false, error: 'Wpisz kod' };
  const normalized = code.trim().toUpperCase();

  const q = query(collection(db, 'promo_codes'), where('code', '==', normalized));
  const snap = await getDocs(q);
  if (snap.empty) return { valid: false, error: 'Nieprawidłowy kod' };

  const promo = { id: snap.docs[0].id, ...snap.docs[0].data() };

  if (businessId && promo.businessId && promo.businessId !== businessId) {
    return { valid: false, error: 'Kod nie dotyczy tego salonu' };
  }
  if (promo.expiresAt) {
    const exp = promo.expiresAt?.toDate?.() ?? new Date(promo.expiresAt);
    if (exp < new Date()) return { valid: false, error: 'Kod wygasł' };
  }
  if (promo.maxUses && (promo.usedCount || 0) >= promo.maxUses) {
    return { valid: false, error: 'Kod wyczerpany' };
  }

  return { valid: true, promo };
}

export function applyDiscount(price, promo) {
  if (!promo) return price;
  if (promo.type === 'percent') return Math.max(0, price * (1 - promo.value / 100));
  if (promo.type === 'fixed') return Math.max(0, price - promo.value);
  return price;
}

export function removeCode() {
  window.App = window.App || {};
  window.App.activePromo = null;
  const el = document.getElementById('promoApplied');
  if (el) el.classList.add('hidden');
  const input = document.getElementById('promoCodeInput');
  if (input) input.value = '';
  toast('Kod usunięty');
}

export async function trackUsage(promoId, userId, appointmentId = null) {
  await updateDoc(doc(db, 'promo_codes', promoId), {
    usedCount: increment(1),
    lastUsedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'promo_usage'), {
    promoId,
    userId,
    appointmentId,
    createdAt: serverTimestamp(),
  });
}

export async function applyCodeToBooking(code, price, businessId, userId) {
  const result = await validateCode(code, businessId);
  if (!result.valid) {
    toast(result.error, 'error');
    return { price, promo: null };
  }
  const discounted = applyDiscount(price, result.promo);
  window.App = window.App || {};
  window.App.activePromo = result.promo;
  toast(`Zastosowano rabat: -${result.promo.type === 'percent' ? result.promo.value + '%' : result.promo.value + ' zł'}`, 'success');
  return { price: discounted, promo: result.promo };
}

export async function createPromoCode(businessId, data) {
  const ref = await addDoc(collection(db, 'promo_codes'), {
    businessId,
    code: data.code.toUpperCase(),
    type: data.type || 'percent',
    value: data.value,
    maxUses: data.maxUses || null,
    usedCount: 0,
    expiresAt: data.expiresAt || null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
