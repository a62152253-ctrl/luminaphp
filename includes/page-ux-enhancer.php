<?php
if (!defined('LUMINA_PAGE_UX_ENHANCER_INCLUDED')) {
    define('LUMINA_PAGE_UX_ENHANCER_INCLUDED', true);
}
$pageName = basename($_SERVER['PHP_SELF'] ?? 'page.php');
$pageLabel = str_replace('.php', '', $pageName);
$pageLabel = str_replace('_', ' ', $pageLabel);
$pageLabel = ucwords($pageLabel);
?>
<section class="lumina-mini-ux" data-page-name="<?= htmlspecialchars($pageName, ENT_QUOTES, 'UTF-8') ?>">
  <div class="lumina-ux-card">
    <div class="lumina-ux-top">
      <span class="lumina-ux-pill">⚡ Mini UX</span>
      <button type="button" class="lumina-ux-link" data-action="tip">Pokaż tip</button>
    </div>
    <div class="lumina-ux-grid">
      <div>
        <h3>Lepsze przejście po stronie</h3>
        <p>Ten blok dodaje płynne akcje, szybkie podpowiedzi i wygodne przyciski, które pomagają skupić się na najważniejszych zadaniach.</p>
      </div>
      <div class="lumina-ux-actions">
        <button type="button" class="lumina-ux-btn primary" data-action="copy">Kopiuj link</button>
        <button type="button" class="lumina-ux-btn" data-action="scroll">Do góry</button>
        <button type="button" class="lumina-ux-btn" data-action="save">Zapisz stan</button>
      </div>
    </div>
    <div class="lumina-ux-meta">
      <span>Strona: <?= htmlspecialchars($pageLabel, ENT_QUOTES, 'UTF-8') ?></span>
      <span>Tryb: szybki</span>
      <span>Wspomaganie: 1 klik</span>
    </div>
    <div class="lumina-ux-progress" aria-hidden="true">
      <div class="lumina-ux-progress-bar"></div>
    </div>
  </div>
  <div class="lumina-ux-toast" role="status" aria-live="polite"></div>
</section>

<style>
.lumina-mini-ux { margin: 1.4rem 0 1rem; }
.lumina-ux-card {
  background: linear-gradient(135deg, rgba(99,102,241,.10), rgba(16,185,129,.08));
  border: 1px solid rgba(99,102,241,.16);
  border-radius: 1.1rem;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 30px rgba(15,23,42,.06);
}
.lumina-ux-top { display:flex; justify-content:space-between; align-items:center; gap:.75rem; margin-bottom:.75rem; flex-wrap:wrap; }
.lumina-ux-pill { display:inline-flex; align-items:center; gap:.35rem; border-radius:999px; background:rgba(255,255,255,.8); color:#4338ca; font-size:.75rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; padding:.35rem .65rem; }
.lumina-ux-link { background:rgba(255,255,255,.8); border:0; border-radius:999px; color:#374151; font-weight:700; padding:.5rem .8rem; cursor:pointer; }
.lumina-ux-grid { display:grid; gap:.85rem; grid-template-columns:1.5fr 1fr; align-items:center; }
.lumina-ux-grid h3 { margin:0 0 .25rem; font-size:1rem; color:#111827; }
.lumina-ux-grid p { margin:0; color:#52525b; font-size:.95rem; line-height:1.55; }
.lumina-ux-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:.55rem; }
.lumina-ux-btn { border:0; border-radius:999px; padding:.6rem .85rem; background:rgba(255,255,255,.95); color:#374151; font-weight:700; cursor:pointer; }
.lumina-ux-btn.primary { background:linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6); color:#fff; }
.lumina-ux-meta { display:flex; flex-wrap:wrap; gap:.55rem; margin-top:.75rem; color:#4b5563; font-size:.84rem; }
.lumina-ux-meta span { padding:.3rem .6rem; border-radius:999px; background:rgba(255,255,255,.76); }
.lumina-ux-progress { height:.4rem; border-radius:999px; background:rgba(255,255,255,.7); margin-top:.8rem; overflow:hidden; }
.lumina-ux-progress-bar { width:0; height:100%; border-radius:999px; background:linear-gradient(90deg, #6366f1, #10b981); transition:width .2s ease; }
.lumina-ux-toast { position:fixed; right:1rem; bottom:1rem; max-width:min(90vw,320px); padding:.8rem 1rem; border-radius:.9rem; background:rgba(17,24,39,.95); color:#fff; box-shadow:0 16px 36px rgba(0,0,0,.24); opacity:0; transform:translateY(8px); pointer-events:none; transition:all .2s ease; z-index:9999; }
.lumina-ux-toast.show { opacity:1; transform:translateY(0); }
@media (max-width:760px) { .lumina-ux-grid { grid-template-columns:1fr; } .lumina-ux-actions { justify-content:flex-start; } }
</style>

<script>
(function(){
  var shell = document.currentScript ? document.currentScript.previousElementSibling : null;
  if (!shell) return;
  var toast = shell.querySelector('.lumina-ux-toast');
  var progressBar = shell.querySelector('.lumina-ux-progress-bar');
  var buttons = shell.querySelectorAll('.lumina-ux-btn, .lumina-ux-link');
  var pageName = shell.getAttribute('data-page-name') || 'page';
  var tips = [
    'Szybkie przyciski skracają drogę do najważniejszych zadań.',
    'Zapisany stan strony ułatwia szybkie powroty do poprzedniego miejsca.',
    'Płynne akcje sprawiają, że nawigacja jest przyjemniejsza na telefonie.'
  ];
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function(){ toast.classList.remove('show'); }, 1800);
  }
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var ratio = Math.min(100, Math.round((scrollTop / maxScroll) * 100));
    if (progressBar) progressBar.style.width = ratio + '%';
  }
  buttons.forEach(function(button){
    button.addEventListener('click', function(){
      var action = button.getAttribute('data-action');
      if (action === 'copy') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href).then(function(){ showToast('Link skopiowany'); }).catch(function(){ showToast('Link gotowy do skopiowania'); });
        } else {
          showToast('Link gotowy do skopiowania');
        }
      } else if (action === 'scroll') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Przewinięto do góry');
      } else if (action === 'save') {
        try {
          var saved = JSON.parse(localStorage.getItem('lumina-page-state') || '{}');
          saved[pageName] = document.title || 'Strona';
          localStorage.setItem('lumina-page-state', JSON.stringify(saved));
          showToast('Stan zapisany');
        } catch (e) {
          showToast('Nie udało się zapisać stanu');
        }
      } else {
        showToast(tips[Math.floor(Math.random() * tips.length)]);
      }
    });
  });
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('load', updateProgress);
  updateProgress();
  try {
    var stored = JSON.parse(localStorage.getItem('lumina-page-state') || '{}');
    if (stored[pageName]) {
      showToast('Wrócono do: ' + stored[pageName]);
    }
  } catch (e) {}
  window.addEventListener('keydown', function(event){
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      var focusTarget = document.querySelector('input, textarea, select');
      if (focusTarget) focusTarget.focus();
      showToast('Szybkie wyszukiwanie gotowe');
    }
  });
})();
</script>
