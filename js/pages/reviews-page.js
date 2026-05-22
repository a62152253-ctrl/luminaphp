import { db, collection, query, where, getDocs, orderBy } from '../firebase-config.js';
import { submitReview, rateService, renderReviewCard, uploadReviewPhoto } from '../modules/review-form.js';
import { observeTarget, createPagerState, loadNextPage } from '../modules/infinite-scroll.js';
import { escHtml } from '../modules/utils.js';

let _state = createPagerState();
let _rating = 0;
let _bizId = '';

export async function initReviews(bizId = '') {
  _bizId = bizId || document.getElementById('reviewsBizId')?.value || '';
  rateService('reviewStars', r => { _rating = r; });
  document.getElementById('addReviewBtn')?.addEventListener('click', () => {
    document.getElementById('reviewModal')?.classList.remove('hidden');
  });
  document.getElementById('submitReviewBtn')?.addEventListener('click', submitReviewForm);
  document.getElementById('reviewFilterRating')?.addEventListener('change', () => loadReviews());
  document.getElementById('reviewFilterSort')?.addEventListener('change', () => loadReviews());
  observeTarget('scrollSentinel', () => loadReviews(true));
  await loadReviews();
}

async function submitReviewForm() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
  const photos = [];
  const files = document.getElementById('reviewPhotos')?.files;
  for (const f of files || []) {
    photos.push(await uploadReviewPhoto(f, user.uid));
  }
  await submitReview({
    userId: user.uid,
    businessId: _bizId,
    rating: _rating,
    text: document.getElementById('reviewText')?.value,
    photos,
  });
  document.getElementById('reviewModal')?.classList.add('hidden');
  loadReviews();
}

async function loadReviews(append = false) {
  if (!_bizId) return;
  const ratingFilter = document.getElementById('reviewFilterRating')?.value;
  let q = query(collection(db, 'reviews'), where('businessId', '==', _bizId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (ratingFilter) items = items.filter(r => r.rating >= Number(ratingFilter));
  const sort = document.getElementById('reviewFilterSort')?.value;
  if (sort === 'highest') items.sort((a, b) => b.rating - a.rating);
  const el = document.getElementById('reviewsList');
  if (!el) return;
  el.innerHTML = items.length
    ? items.map(r => renderReviewCard(r)).join('')
    : '<div class="empty-state"><p>Brak opinii</p></div>';
}
