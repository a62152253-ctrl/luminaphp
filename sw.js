/* Lumina Service Worker — PWA cache + FCM background push */

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyAPkAJw5gJnqlVCWQ0_c-S8xgSRxSVAm_c',
  authDomain:        'luminaphp-88b38.firebaseapp.com',
  projectId:         'luminaphp-88b38',
  storageBucket:     'luminaphp-88b38.firebasestorage.app',
  messagingSenderId: '325253699769',
  appId:             '1:325253699769:web:0478032290e56f394b2368',
});

const messaging = firebase.messaging();

/* Background push — app is closed or tab in background */
messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'Lumina', {
    body:  n.body  || '',
    icon:  n.icon  || '/luminaphp/img/icon.svg',
    badge: '/luminaphp/img/icon.svg',
    data:  payload.data || {},
    vibrate: [200, 100, 200],
  });
});

/* Open the relevant page on notification click */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/luminaphp/?page=dashboard';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const lumina = list.find(c => c.url.startsWith(self.registration.scope));
      if (lumina) return lumina.focus();
      return clients.openWindow(url);
    })
  );
});

/* ===== PWA CACHE ===== */
const CACHE_NAME = 'lumina-v3-pro';
const PRECACHE = [
  '/luminaphp/',
  '/luminaphp/css/style.css',
  '/luminaphp/css/premium.css',
  '/luminaphp/css/pro-theme.css',
  '/luminaphp/css/features.css',
  '/luminaphp/js/app.js',
  '/luminaphp/js/firebase-config.js',
  '/luminaphp/js/modules/offline-sync.js',
  '/luminaphp/js/modules/utils.js',
  '/luminaphp/manifest.json',
  '/luminaphp/img/icon.svg',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Stale-while-revalidate for same-origin GETs (HTML, CSS, fonts) */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  /* Skip Firebase, gstatic, googleapis — always fetch live */
  if (['firebaseio.com', 'googleapis.com', 'gstatic.com', 'firebaseapp.com'].some(h => url.hostname.includes(h))) return;
  /* Skip cross-origin requests we don't control */
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(cached => {
      const fromNet = fetch(req).then(res => {
        if (res.ok) caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fromNet;
    })
  );
});
