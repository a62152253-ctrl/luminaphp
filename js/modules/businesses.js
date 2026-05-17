import { db, collection, getDocs, getDoc, doc, query, where, orderBy, limit } from '../firebase-config.js';

const CACHE_TTL = 5 * 60 * 1000;
const LS_KEY    = 'lumina_biz_cache';
let _cache  = [];
let _cacheAt = 0;

function _saveToLS(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ data, at: Date.now() })); } catch(_) {}
}

function _loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { data, at } = JSON.parse(raw);
    if (Date.now() - at < CACHE_TTL) return data;
  } catch(_) {}
  return null;
}

export async function loadBusinesses() {
  if (_cache.length && Date.now() - _cacheAt < CACHE_TTL) return _cache;

  // Serve stale LS cache instantly while refetching in background
  const ls = _loadFromLS();
  if (ls && !_cache.length) _cache = ls;

  try {
    const snap = await getDocs(collection(db, 'businesses'));
    _cache = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(b => b.profileComplete === true && b.isPublished !== false && b.status !== 'suspended');
    _cacheAt = Date.now();
    _saveToLS(_cache);
  } catch(e) {
    console.error('loadBusinesses:', e);
    if (!_cache.length) _cache = [];
  }
  return _cache;
}

export async function getBusinessById(id) {
  const cached = _cache.find(b => b.id === id);
  if (cached) return cached;
  try {
    const snap = await getDoc(doc(db, 'businesses', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch(e) {}
  return null;
}

export async function loadServices(bizId) {
  try {
    const snap = await getDocs(collection(db, 'businesses', bizId, 'services'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    return [];
  }
}

export async function loadStaff(bizId) {
  try {
    const snap = await getDocs(collection(db, 'businesses', bizId, 'staff'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    return [];
  }
}

export async function loadBusinessesByCategory(category) {
  const all = await loadBusinesses();
  return all.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
}

export async function loadReviews(bizId, maxCount = 20) {
  try {
    const q = query(
      collection(db, 'businesses', bizId, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) { return []; }
}

export function getPopularCategories(topN = 6) {
  const counts = {};
  for (const b of _cache) {
    const cat = b.category || 'Inne';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([cat, count]) => ({ cat, count }));
}

export async function getBusinessStats(bizId) {
  try {
    const [services, staff] = await Promise.all([
      loadServices(bizId),
      loadStaff(bizId),
    ]);
    return { serviceCount: services.length, staffCount: staff.length };
  } catch(_) { return { serviceCount: 0, staffCount: 0 }; }
}

export function clearCache() {
  _cache = [];
  _cacheAt = 0;
  try { localStorage.removeItem(LS_KEY); } catch(_) {}
}
