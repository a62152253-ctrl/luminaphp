import { db, collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp }
  from '../firebase-config.js';
import { toast, escHtml } from './utils.js';

export async function loadFavoriteIds(uid) {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ docId: d.id, bizId: d.data().bizId }));
  } catch(e) {
    return [];
  }
}

export function isFavorite(favorites, bizId) {
  return favorites.some(f => f.bizId === bizId);
}

export async function toggleFavorite(uid, bizId, favorites) {
  const existing = favorites.find(f => f.bizId === bizId);
  if (existing) {
    try {
      if (existing.docId) await deleteDoc(doc(db, 'favorites', existing.docId));
    } catch(e) {}
    toast('Usunięto z ulubionych');
    return favorites.filter(f => f.bizId !== bizId);
  } else {
    let docId = null;
    try {
      const ref = await addDoc(collection(db, 'favorites'), {
        userId: uid, bizId, createdAt: serverTimestamp()
      });
      docId = ref.id;
    } catch(e) {}
    toast('Dodano do ulubionych', 'success');
    return [...favorites, { docId, bizId }];
  }
}

export function renderFavoritesGrid(favorites, businesses, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const favBizIds = favorites.map(f => f.bizId);
  const favBiz = businesses.filter(b => favBizIds.includes(b.id));

  if (!favBiz.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><span class="material-icons">favorite_border</span></div>
      <h3>Brak ulubionych</h3>
      <p>Dodaj salony do ulubionych klikając serduszko.</p>
      <a href="?page=explore" class="btn btn-accent" style="margin-top:1.5rem;display:inline-flex">Eksploruj salony</a>
    </div>`;
    return;
  }

  el.innerHTML = favBiz.map(b => `
    <div class="fav-card">
      <div class="fav-card-img">
        <img src="${escHtml(b.photoURL || '')}" alt="${escHtml(b.name)}" loading="lazy">
        <div class="fav-card-overlay"></div>
        <button class="fav-heart active" onclick="window.toggleFav('${escHtml(b.id)}')" title="Usuń z ulubionych">
          <span class="material-icons">favorite</span>
        </button>
        <div class="fav-card-info">
          <span class="biz-card-cat">${escHtml(b.category)}</span>
          <div class="biz-card-name">${escHtml(b.name)}</div>
        </div>
      </div>
      <div class="fav-card-body">
        <div class="biz-card-addr">
          <span class="material-icons" style="font-size:1rem">near_me</span>
          ${escHtml(b.address)}, ${escHtml(b.city)}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:1rem;border-top:1px solid var(--zinc-50)">
          <div style="display:flex;align-items:center;gap:.3rem;font-size:.625rem;font-weight:900;color:var(--zinc-600)">
            <span class="material-icons" style="font-size:.875rem;color:#fbbf24">star</span>
            ${b.rating || '—'}
          </div>
          <a href="?page=business&id=${escHtml(b.id)}" class="btn btn-accent" style="padding:.5rem 1.25rem;border-radius:.75rem;font-size:.625rem">Zarezerwuj</a>
        </div>
      </div>
    </div>`).join('');
}
