import { db, collection, getDocs, updateDoc, doc, query, where }
  from '../firebase-config.js';
import { toast } from './utils.js';

export async function loadBusinessReviews(bizId) {
  try {
    const q = query(collection(db, 'reviews'), where('businessId', '==', bizId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch(e) { return []; }
}

export async function replyToReview(reviewId, replyText) {
  if (!replyText.trim()) { toast('Wpisz treść odpowiedzi', 'error'); return false; }
  await updateDoc(doc(db, 'reviews', reviewId), {
    reply: replyText.trim(),
    repliedAt: new Date().toISOString(),
  });
  return true;
}

export function renderReviewsAdmin(reviews, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!reviews.length) {
    el.innerHTML = `<div class="biz-empty">
      <div class="biz-empty-icon"><span class="material-icons">star_outline</span></div>
      <h3>Brak opinii</h3>
      <p>Opinie klientów pojawią się tutaj po pierwszych wizytach.</p>
    </div>`;
    return;
  }

  const avg = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);
  const starsHtml = r => Array.from({length: 5}, (_, i) =>
    `<span class="material-icons" style="font-size:1rem;color:${i < r.rating ? '#fbbf24' : 'var(--zinc-200)'}">star</span>`
  ).join('');

  const dateStr = r => {
    const secs = r.createdAt?.seconds;
    if (!secs) return r.date || '';
    return new Date(secs * 1000).toLocaleDateString('pl', { day:'numeric', month:'long', year:'numeric' });
  };

  el.innerHTML = `
    <div class="biz-reviews-summary">
      <div>
        <div class="biz-reviews-avg-num">${avg}</div>
        <div class="biz-reviews-stars">
          ${Array.from({length:5}, (_, i) => `<span class="material-icons" style="font-size:1.25rem;color:${i < Math.round(avg) ? '#fbbf24' : 'var(--zinc-200)'}">star</span>`).join('')}
        </div>
        <div class="biz-reviews-count">${reviews.length} ${reviews.length === 1 ? 'opinia' : reviews.length < 5 ? 'opinie' : 'opinii'}</div>
      </div>
    </div>
    ${reviews.map(r => `
    <div class="biz-review-card" id="rev-${r.id}">
      <div class="biz-review-header">
        <div class="biz-review-client">
          <img src="${r.userPhoto || 'https://i.pravatar.cc/100'}" alt=""
            class="biz-review-avatar" onerror="this.src='https://i.pravatar.cc/100'">
          <div>
            <div class="biz-review-client-name">${esc(r.userName || 'Klient')}</div>
            <div class="biz-review-meta">${dateStr(r)}</div>
          </div>
        </div>
        <div class="biz-review-stars">${starsHtml(r)}</div>
      </div>
      ${r.comment ? `<p class="biz-review-text">"${esc(r.comment)}"</p>` : ''}
      <div class="biz-review-reply-wrap">
        ${r.reply
          ? `<div class="biz-review-reply-label"><span class="material-icons">reply</span>Twoja odpowiedź</div>
             <p class="biz-review-existing-reply">${esc(r.reply)}</p>
             <div class="biz-review-actions">
               <button class="btn btn-secondary" style="font-size:.5rem;padding:.4rem .875rem"
                 onclick="window.reviewEdit('${r.id}')">
                 <span class="material-icons" style="font-size:.875rem">edit</span> Edytuj
               </button>
             </div>`
          : `<div class="biz-review-reply-label"><span class="material-icons">reply</span>Odpowiedz klientowi</div>
             <textarea class="biz-review-reply-input" id="replyInput${r.id}" rows="2"
               placeholder="Napisz odpowiedź na opinię..."></textarea>
             <div class="biz-review-actions">
               <button class="btn btn-accent" style="font-size:.5rem;padding:.4rem .875rem"
                 onclick="window.reviewReply('${r.id}')">
                 <span class="material-icons" style="font-size:.875rem">send</span> Wyślij
               </button>
             </div>`}
      </div>
    </div>`).join('')}`;
}

function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
