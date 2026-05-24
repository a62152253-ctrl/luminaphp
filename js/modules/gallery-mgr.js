import { db, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp }
  from '../firebase-config.js';
import { toast } from './utils.js';

export async function loadGallery(bizId) {
  try {
    const snap = await getDocs(collection(db, 'businesses', bizId, 'gallery'));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch(e) { return []; }
}

export async function addGalleryPhoto(bizId, url, caption = '') {
  if (!url) { toast('Podaj URL zdjęcia', 'error'); return null; }
  const data = { url: url.trim(), caption: caption.trim(), isCover: false, createdAt: serverTimestamp() };
  const ref = await addDoc(collection(db, 'businesses', bizId, 'gallery'), data);
  return { id: ref.id, ...data, createdAt: { seconds: Date.now() / 1000 } };
}

export async function deleteGalleryPhoto(bizId, photoId) {
  await deleteDoc(doc(db, 'businesses', bizId, 'gallery', photoId));
}

export async function setCoverPhoto(bizId, photoId, allPhotos) {
  await Promise.all(allPhotos.map(p =>
    updateDoc(doc(db, 'businesses', bizId, 'gallery', p.id), { isCover: p.id === photoId })
  ));
}

export function renderGallery(photos, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const photoCards = photos.map(p => `
    <div class="biz-gallery-item">
      <img src="${esc(p.url)}" alt="${esc(p.caption)}"
        onerror="this.src='https://placehold.co/400x400/f4f4f5/a1a1aa?text=Foto'">
      ${p.isCover ? '<span class="biz-gallery-cover-badge">Okładka</span>' : ''}
      <div class="biz-gallery-overlay">
        <div class="biz-gallery-overlay-actions">
          ${!p.isCover ? `<button class="biz-gallery-action-btn" title="Ustaw jako okładkę"
              onclick="window.gallerySetCover('${p.id}')">
              <span class="material-icons">star</span></button>` : ''}
          <button class="biz-gallery-action-btn delete" title="Usuń"
              onclick="window.galleryDelete('${p.id}')">
              <span class="material-icons">delete</span></button>
        </div>
      </div>
    </div>`).join('');

  const addCard = `
    <div class="biz-gallery-add" onclick="document.getElementById('galleryAddPanel').classList.remove('hidden');document.getElementById('galleryUrlInput').focus()">
      <span class="material-icons">add_photo_alternate</span>
      Dodaj zdjęcie
    </div>`;

  el.innerHTML = `<div class="biz-gallery-grid">${photoCards}${addCard}</div>`;
}

function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
