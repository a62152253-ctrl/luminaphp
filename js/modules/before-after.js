import { escHtml } from './utils.js';

export function initSlider(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.ba-slider').forEach(slider => {
    const handle = slider.querySelector('.ba-handle');
    const after = slider.querySelector('.ba-after');
    if (!handle || !after) return;

    const move = clientX => {
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      handle.style.left = pct + '%';
      after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    };

    const onMove = e => move(e.touches ? e.touches[0].clientX : e.clientX);
    handle.addEventListener('mousedown', () => {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMove);
      }, { once: true });
    });
    handle.addEventListener('touchmove', onMove, { passive: true });
  });
}

export function loadPairs(pairs, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = pairs.map(p => renderPair(p)).join('');
  initSlider(containerId);
}

function renderPair(p) {
  return `<div class="ba-card" data-category="${escHtml(p.category || '')}">
    <div class="ba-slider">
      <img src="${escHtml(p.before)}" alt="Przed" class="ba-img ba-before">
      <img src="${escHtml(p.after)}" alt="Po" class="ba-img ba-after">
      <div class="ba-handle"><span class="material-icons">drag_handle</span></div>
    </div>
    <p class="ba-caption">${escHtml(p.caption || '')}</p>
  </div>`;
}

export function filterByCategory(category, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.querySelectorAll('.ba-card').forEach(card => {
    const show = !category || card.dataset.category === category;
    card.style.display = show ? '' : 'none';
  });
}

export function shareResult(title, url) {
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(url);
  }
}
