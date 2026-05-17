import { getMessaging, getToken, onMessage }
  from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging.js';
import { db, doc, updateDoc } from '../firebase-config.js';

/*
 * SETUP REQUIRED (one-time):
 * 1. Firebase Console → Project Settings → Cloud Messaging
 *    → Web Push certificates → Generate key pair
 *    → Copy the key and paste it below.
 * 2. Firebase Console → Authentication → Sign-in method
 *    → Enable "Phone" provider (needed for SMS verification).
 */
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // ← replace with your Web Push key pair

let _messaging = null;

function getMsg(app) {
  if (!_messaging) _messaging = getMessaging(app);
  return _messaging;
}

export async function initPush(app, userId) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission === 'denied') return;
  if (VAPID_KEY === 'YOUR_VAPID_KEY_HERE') return; // skip until configured

  try {
    const swReg = await navigator.serviceWorker.register('/luminaphp/sw.js', {
      scope: '/luminaphp/',
    });

    const messaging = getMsg(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token && userId) {
      await updateDoc(doc(db, 'users', userId), { fcmToken: token }).catch(() => {});
    }

    /* Show notification while app is open (foreground) */
    onMessage(messaging, payload => {
      const n = payload.notification || {};
      if (!n.title) return;
      new Notification(n.title, {
        body: n.body || '',
        icon: '/luminaphp/img/icon.svg',
      });
    });
  } catch (_) {
    /* FCM unavailable (Safari private mode, ad blockers, etc.) — silent fail */
  }
}

export async function requestPushPermission() {
  if (!('Notification' in window)) return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

/* Register SW only (for PWA installability, regardless of FCM config) */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/luminaphp/sw.js', {
      scope: '/luminaphp/',
    });
  } catch (_) {
    return null;
  }
}
