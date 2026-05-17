// admin/reviews.js — Opinie klientów
import { db, collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

let _bizId, _reviews = [];

export async function initReviews(bizId) {
  _bizId = bizId;
  await loadReviews();
  renderReviews();
  window.bizReplyReview  = replyToReview;
  window.bizOpenReply    = openReplyBox;
}

async function loadReviews() {
  try {
    const q = query(collection(db, 'reviews'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(r => !r.hidden)
      .sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  } catch(e) { _reviews = []; }
}

function renderReviews() {
  const el = document.getElementById('bizReviewsList');
  if (!el) return;

  // Rating summary
  const avg = _reviews.length
    ? (_reviews.reduce((s,r) => s + (r.rating||0), 0) / _reviews.length).toFixed(1)
    : '—';
  const dist = [5,4,3,2,1].map(n => ({
    n, count: _reviews.filter(r => r.rating === n).length
  }));

  el.innerHTML = `
    <div class="reviews-summary">
      <div class="reviews-avg-big">${avg}</div>
      <div class="reviews-avg-stars">${stars(parseFloat(avg))}</div>
      <div class="reviews-avg-count">${_reviews.length} opinii</div>
      <div class="reviews-dist">
        ${dist.map(d => `
          <div class="reviews-dist-row">
            <span>${d.n}★</span>
            <div class="reviews-dist-bar-wrap">
              <div class="reviews-dist-bar" style="width:${_reviews.length ? d.count/_reviews.length*100 : 0}%"></div>
            </div>
            <span>${d.count}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="reviews-list">
      ${!_reviews.length ? `<div class="biz-empty"><span class="material-icons">star_border</span><p>Brak opinii.</p></div>` :
        _reviews.map(r => reviewCard(r)).join('')}
    </div>`;
}

function reviewCard(r) {
  return `<div class="review-card" id="rev_${r.id}">
    <div class="review-card-header">
      <div>
        <div class="review-card-author">${esc(r.userName || r.displayName || 'Anonim')}</div>
        <div class="review-card-date">${formatDate(r.date || r.createdAt?.toDate?.()?.toISOString?.()?.slice(0,10))}</div>
      </div>
      <div class="review-card-stars">${stars(r.rating)}</div>
    </div>
    <p class="review-card-text">"${esc(r.comment || r.text || '')}"</p>
    ${r.ownerReply ? `
      <div class="review-reply-box">
        <span class="material-icons" style="font-size:1rem;color:var(--zinc-400)">reply</span>
        <div>
          <div class="review-reply-label">Twoja odpowiedź</div>
          <div class="review-reply-text">${esc(r.ownerReply)}</div>
        </div>
      </div>` : `
      <button class="biz-card-btn" style="margin-top:.75rem;padding:.4rem .875rem;font-size:.75rem"
        onclick="bizOpenReply('${r.id}')">
        <span class="material-icons" style="font-size:.875rem">reply</span> Odpowiedz
      </button>`}
    <div class="review-reply-form hidden" id="replyForm_${r.id}">
      <textarea class="settings-input" id="replyText_${r.id}" rows="2"
        placeholder="Twoja odpowiedź..."></textarea>
      <div style="display:flex;gap:.5rem;margin-top:.5rem">
        <button class="btn btn-accent" style="padding:.4rem .875rem;font-size:.75rem"
          onclick="bizReplyReview('${r.id}')">Wyślij</button>
        <button class="btn btn-secondary" style="padding:.4rem .875rem;font-size:.75rem"
          onclick="document.getElementById('replyForm_${r.id}').classList.add('hidden')">Anuluj</button>
      </div>
    </div>
  </div>`;
}

function openReplyBox(id) {
  document.getElementById(`replyForm_${id}`)?.classList.remove('hidden');
  document.getElementById(`replyText_${id}`)?.focus();
}

async function replyToReview(id) {
  const text = document.getElementById(`replyText_${id}`)?.value.trim();
  if (!text) { toast('Wpisz odpowiedź', 'error'); return; }
  try {
    await updateDoc(doc(db, 'reviews', id), { ownerReply: text });
    const r = _reviews.find(x => x.id === id);
    if (r) r.ownerReply = text;
    renderReviews();
    toast('Odpowiedź zapisana');
  } catch(e) { toast('Błąd zapisu', 'error'); }
}

// helpers
function stars(n) {
  return Array.from({length:5}, (_,i) =>
    `<span class="material-icons" style="font-size:1rem;color:${i<Math.round(n)?'#fbbf24':'var(--zinc-200)'}">star</span>`
  ).join('');
}
function formatDate(d) {
  if (!d) return '';
  const [y,m,day] = String(d).slice(0,10).split('-');
  return `${day}.${m}.${y}`;
}
const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");
