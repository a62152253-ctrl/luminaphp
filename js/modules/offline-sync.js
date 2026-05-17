const QUEUE_KEY = 'lumina_offline_queue';
const CACHE_PREFIX = 'lumina_cache_';

export function queueRequest(method, url, body) {
  const queue = getQueue();
  queue.push({ method, url, body, ts: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

export async function syncOnReconnect() {
  const queue = getQueue();
  if (!queue.length) return;
  const failed = [];
  for (const req of queue) {
    try {
      const res = await fetch(req.url, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: req.body ? JSON.stringify(req.body) : undefined,
      });
      if (!res.ok) failed.push(req);
    } catch {
      failed.push(req);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
  if (failed.length < queue.length) showOfflineBanner(false);
}

export function showOfflineBanner(show = true) {
  let b = document.getElementById('offlineSyncBanner');
  if (!show) { b?.remove(); return; }
  if (b) return;
  b = document.createElement('div');
  b.id = 'offlineSyncBanner';
  b.className = 'offline-sync-banner';
  b.innerHTML = '<span class="material-icons">wifi_off</span> Tryb offline — zmiany zsynchronizują się po powrocie sieci';
  document.body.appendChild(b);
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setCached(key, data, ttlMs = 3600000) {
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expires: Date.now() + ttlMs }));
}

export function getCachedData(key) {
  const entry = getCached(key);
  if (!entry) return null;
  if (entry.expires && entry.expires < Date.now()) {
    localStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }
  return entry.data;
}

export function initOfflineSync() {
  window.addEventListener('online', () => {
    syncOnReconnect();
    showOfflineBanner(false);
  });
  window.addEventListener('offline', () => showOfflineBanner(true));
  if (!navigator.onLine) showOfflineBanner(true);
}
