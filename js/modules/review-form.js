import { db, collection, addDoc, updateDoc, doc, serverTimestamp } from '../firebase-config.js';
import { uploadToStorage } from './image-upload.js';
import { toast, escHtml } from './utils.js';

export async function submitReview(data) {
  const { userId, businessId, rating, text, photos = [], serviceId } = data;
  if (!rating || rating < 1) { toast('Wybierz ocenę', 'error'); return null; }
  const ref = await addDoc(collection(db, 'reviews'), {
    userId,
    businessId,
    serviceId: serviceId || null,
    rating: Number(rating),
    text: text?.trim() || '',
    photos,
    userName: window.App?.user?.displayName || 'Klient',
    userPhoto: window.App?.user?.photoURL || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  toast('Opinia dodana', 'success');
  return ref.id;
}

export async function uploadReviewPhoto(file, userId, reviewId) {
  const path = `reviews/${userId}/${reviewId || Date.now()}_${file.name}`;
  return uploadToStorage(file, path);
}

export function rateService(containerId, onRate) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<button type="button" class="star-btn" data-rating="${n}" aria-label="${n} gwiazdek">
      <span class="material-icons">star_border</span>
    </button>`
  ).join('');
  let selected = 0;
  el.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => highlightStars(el, Number(btn.dataset.rating)));
    btn.addEventListener('click', () => {
      selected = Number(btn.dataset.rating);
      highlightStars(el, selected, true);
      onRate?.(selected);
    });
  });
  el.addEventListener('mouseleave', () => highlightStars(el, selected, true));
}

function highlightStars(el, count, fixed = false) {
  el.querySelectorAll('.star-btn').forEach((btn, i) => {
    const icon = btn.querySelector('.material-icons');
    icon.textContent = (i < count) ? 'star' : 'star_border';
    btn.classList.toggle('active', i < count);
    if (fixed) btn.dataset.selected = i < count ? '1' : '';
  });
}

export async function editReview(reviewId, updates) {
  await updateDoc(doc(db, 'reviews', reviewId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  toast('Opinia zaktualizowana', 'success');
}

export function renderReviewCard(review) {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const photos = (review.photos || []).map(url =>
    `<img src="${escHtml(url)}" alt="Zdjęcie opinii" class="review-photo" loading="lazy">`
  ).join('');
  return `<article class="review-card">
    <header class="review-card-head">
      <img src="${escHtml(review.userPhoto || '')}" alt="" class="review-avatar">
      <div>
        <strong>${escHtml(review.userName || 'Klient')}</strong>
        <span class="review-stars">${stars}</span>
      </div>
    </header>
    <p>${escHtml(review.text || '')}</p>
    ${photos ? `<div class="review-photos">${photos}</div>` : ''}
  </article>`;
}
