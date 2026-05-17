import { db, collection, addDoc, doc, deleteDoc, updateDoc, query, where, getDocs, serverTimestamp }
  from '../firebase-config.js';
import { toast } from './utils.js';

const SMS_API_URL = '/luminaphp/api/sms'; // Cloud Function endpoint

export async function scheduleReminder(appointmentId, phone, date, time, businessName) {
  if (!phone?.trim()) {
    toast('Podaj numer telefonu', 'error');
    return null;
  }
  const reminderAt = computeReminderTime(date, time);
  const ref = await addDoc(collection(db, 'sms_reminders'), {
    appointmentId,
    phone: normalizePhone(phone),
    businessName,
    date,
    time,
    reminderAt,
    status: 'scheduled',
    createdAt: serverTimestamp(),
  });
  toast('Przypomnienie SMS zaplanowane', 'success');
  return ref.id;
}

function computeReminderTime(date, time) {
  const dt = new Date(`${date}T${time}`);
  dt.setHours(dt.getHours() - 24);
  return dt.toISOString();
}

function normalizePhone(phone) {
  return phone.replace(/\s/g, '').replace(/^0/, '+48');
}

export async function cancelReminder(reminderId) {
  await deleteDoc(doc(db, 'sms_reminders', reminderId));
  toast('Przypomnienie anulowane');
}

export async function updatePhone(uid, phone) {
  const normalized = normalizePhone(phone);
  await updateDoc(doc(db, 'users', uid), { phone: normalized, updatedAt: serverTimestamp() });
  toast('Numer telefonu zaktualizowany', 'success');
  return normalized;
}

export async function loadReminders(uid) {
  const q = query(collection(db, 'sms_reminders'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function sendSmsViaApi(phone, message) {
  try {
    const res = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });
    return res.ok;
  } catch {
    console.warn('[SMS] API niedostępne — zapisano tylko w Firestore');
    return false;
  }
}
