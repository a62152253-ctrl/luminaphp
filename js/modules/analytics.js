import { formatDateKey, isRevenueStatus } from './utils.js';

const QUEUE_KEY = 'lumina_analytics_queue';
const FLUSH_INTERVAL = 30000;

let _queue = [];
let _timer = null;

export function trackEvent(name, params = {}) {
  _queue.push({ type: 'event', name, params, ts: Date.now(), page: location.pathname });
  persistQueue();
  if (typeof gtag === 'function') gtag('event', name, params);
}

export function trackPageView(page = location.pathname) {
  _queue.push({ type: 'pageview', page, ts: Date.now() });
  persistQueue();
  if (typeof gtag === 'function') gtag('event', 'page_view', { page_path: page });
}

export function trackConversion(name, value = 0, currency = 'PLN') {
  _queue.push({ type: 'conversion', name, value, currency, ts: Date.now() });
  persistQueue();
  if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: name, value, currency });
}

function persistQueue() {
  try {
    const stored = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...stored, ..._queue].slice(-200)));
    _queue = [];
  } catch { /* ignore */ }
}

export async function flushQueue() {
  const stored = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (!stored.length) return;
  try {
    await fetch('/luminaphp/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: stored }),
    });
    localStorage.setItem(QUEUE_KEY, '[]');
  } catch {
    /* retry later */
  }
}

export function initAnalytics() {
  trackPageView();
  if (_timer) clearInterval(_timer);
  _timer = setInterval(flushQueue, FLUSH_INTERVAL);
  window.addEventListener('beforeunload', flushQueue);
}

export async function getOwnerStats(businessId) {
  const { db, collection, query, where, getDocs } = await import('../firebase-config.js');
  const appts = await getDocs(query(collection(db, 'appointments'), where('businessId', '==', businessId)));
  const now = new Date();
  const today = formatDateKey(now);
  const month = today.slice(0, 7);

  let dailyRevenue = 0, monthlyRevenue = 0, bookings = 0, conversions = 0;

  appts.docs.forEach(d => {
    const a = d.data();
    bookings++;
    const price = a.price || a.total || 0;
    if (a.date === today) dailyRevenue += price;
    if ((a.date || '').startsWith(month)) monthlyRevenue += price;
    if (isRevenueStatus(a.status)) conversions++;
  });

  return {
    bookings,
    conversions,
    conversionRate: bookings ? ((conversions / bookings) * 100).toFixed(1) : 0,
    dailyRevenue,
    monthlyRevenue,
  };
}
