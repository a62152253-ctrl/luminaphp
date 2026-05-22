import { db, doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, increment }
  from '../firebase-config.js';
import { toast } from './utils.js';

const BONUS_POINTS = 100;

export function generateLink(uid) {
  const code = uid.slice(0, 8).toUpperCase();
  return `${location.origin}/luminaphp/?page=auth&ref=${code}`;
}

export async function ensureReferralCode(uid) {
  const ref = doc(db, 'referrals', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const code = uid.slice(0, 8).toUpperCase();
  const data = { userId: uid, code, clicks: 0, signups: 0, bonuses: 0, createdAt: serverTimestamp() };
  await setDoc(ref, data);
  return data;
}

export async function trackClick(refCode) {
  const q = query(collection(db, 'referrals'), where('code', '==', refCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const refDoc = snap.docs[0];
  await updateDoc(refDoc.ref, { clicks: increment(1) });
  await addDoc(collection(db, 'referral_clicks'), {
    referrerId: refDoc.id,
    createdAt: serverTimestamp(),
  });
  const safeCode = refCode.replace(/[^A-Z0-9]/gi, '').slice(0, 32);
  localStorage.setItem('lumina_ref', safeCode);
}

export async function getStats(uid) {
  const snap = await getDoc(doc(db, 'referrals', uid));
  if (!snap.exists()) return { clicks: 0, signups: 0, bonuses: 0 };
  return snap.data();
}

export async function claimBonus(uid, referralId) {
  const ref = doc(db, 'referral_bonuses', referralId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().claimed) {
    toast('Bonus już odebrany', 'error');
    return false;
  }
  await setDoc(ref, { userId: uid, claimed: true, points: BONUS_POINTS, claimedAt: serverTimestamp() });
  await updateDoc(doc(db, 'referrals', uid), { bonuses: increment(BONUS_POINTS) });
  const { addPoints } = await import('./loyalty.js');
  await addPoints(uid, BONUS_POINTS, 'Bonus za polecenie');
  toast(`Odebrano ${BONUS_POINTS} punktów!`, 'success');
  return true;
}

export async function registerReferralSignup(newUid, refCode) {
  if (!refCode) return;
  const q = query(collection(db, 'referrals'), where('code', '==', refCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const referrerId = snap.docs[0].id;
  await addDoc(collection(db, 'referral_signups'), {
    referrerId,
    newUserId: newUid,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'referrals', referrerId), { signups: increment(1) });
  await claimBonus(referrerId, `signup_${newUid}`);
}
