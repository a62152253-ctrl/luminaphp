import { db, collection, getDocs, doc } from '../firebase-config.js';

export async function initGalleryPage(bizId) {
  const infoEl  = document.getElementById('galleryBizInfo');
  const gridEl  = document.getElementById('galleryGrid');

  if (!bizId) {
    if (infoEl) infoEl.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--zinc-400)">
      <span class="material-icons" style="font-size:2.5rem;display:block;margin-bottom:1rem">broken_image</span>
      Nie podano ID salonu.
    </div>`;
    return;
  }

  try {
    const { getDoc } = await import('../firebase-config.js');
    const snap = await getDoc(doc(db, 'businesses', bizId));
    const biz  = snap.exists() ? { id: snap.id, ...snap.data() } : null;

    if (!biz) {
      if (infoEl) infoEl.innerHTML = `<p style="text-align:center;padding:3rem;color:var(--zinc-400)">Salon nie znaleziony.</p>`;
      return;
    }

    if (infoEl) infoEl.innerHTML = `
      <div class="gallery-biz-header">
        <h1 class="gallery-biz-name">${biz.name || 'Salon'}</h1>
        <p class="gallery-biz-sub">${[biz.city, biz.category].filter(Boolean).join(' · ')}</p>
        <a href="/luminaphp/?page=business&id=${bizId}" class="btn btn-accent"
          style="display:inline-flex;align-items:center;gap:.5rem;margin-top:1.25rem;padding:.75rem 1.5rem;border-radius:.875rem">
          <span class="material-icons">calendar_today</span> Zarezerwuj wizytę
        </a>
      </div>`;

    const photos = await loadPhotos(bizId);
    if (gridEl) gridEl.style.display = '';
    renderPublicGallery(photos, gridEl);
  } catch(e) {
    if (infoEl) infoEl.innerHTML = `<p style="text-align:center;padding:3rem;color:var(--zinc-400)">Błąd ładowania galerii.</p>`;
  }
}

async function loadPhotos(bizId) {
  try {
    const snap = await getDocs(collection(db, 'businesses', bizId, 'gallery'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));
  } catch(e) { return []; }
}

function renderPublicGallery(photos, el) {
  if (!el) return;
  if (!photos.length) {
    el.innerHTML = `<div style="text-align:center;padding:4rem;color:var(--zinc-400);grid-column:1/-1">
      <span class="material-icons" style="font-size:3rem;display:block;margin-bottom:1rem">photo_library</span>
      Salon nie dodał jeszcze zdjęć.
    </div>`;
    return;
  }
  el.innerHTML = photos.map(p => `
    <div class="gallery-public-item">
      <img src="${esc(p.url)}" alt="${esc(p.caption)}"
        onerror="this.src='https://placehold.co/400x400/f4f4f5/a1a1aa?text=Foto'">
      ${p.caption ? `<div class="gallery-public-caption">${esc(p.caption)}</div>` : ''}
    </div>`).join('');
}

function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
