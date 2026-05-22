// admin/widget.js — Generator widgetu rezerwacji
export function initWidget(bizId, bizDoc) {
  const el = document.getElementById('widgetContent');
  if (!el) return;

  const salonName = bizDoc?.name || 'Salon';
  const baseUrl   = `${window.location.origin}/luminaphp/?page=booking&biz=${encodeURIComponent(bizId)}`;

  const iframeCode = `<iframe
  src="${baseUrl}&widget=1"
  width="100%"
  height="720"
  frameborder="0"
  style="border-radius:1rem;border:1px solid #e4e4e7;max-width:480px"
  title="Rezerwacja — ${salonName}"
  allow="geolocation"
></iframe>`;

  const jsCode = `<!-- Widget rezerwacji Lumina -->
<div id="lumina-booking-widget" data-biz="${bizId}"></div>
<script>
  (function(){
    var s = document.createElement('script');
    s.src = '${window.location.origin}/luminaphp/js/widget-loader.js';
    s.async = true;
    s.dataset.biz = '${bizId}';
    document.head.appendChild(s);
  })();
<\/script>`;

  el.innerHTML = `
    <div class="widget-intro">
      <div class="widget-intro-icon"><span class="material-icons">code</span></div>
      <div>
        <h3>Widget rezerwacji online</h3>
        <p>Wklej poniższy kod na swojej stronie lub udostępnij bezpośredni link, aby klienci mogli rezerwować wizyty bez opuszczania Twojej strony.</p>
      </div>
    </div>

    <div class="widget-options-grid">

      <div class="widget-option-card">
        <div class="widget-option-head">
          <div class="widget-option-icon" style="background:#eef2ff;color:#4f46e5">
            <span class="material-icons">web</span>
          </div>
          <div>
            <strong>Iframe — osadzony widget</strong>
            <p>Wklej bezpośrednio w kod HTML swojej strony. Idealny do stron www.</p>
          </div>
        </div>
        <div class="widget-code-wrap">
          <pre id="iframeCode" class="widget-code">${escHtml(iframeCode)}</pre>
          <button class="widget-copy-btn" onclick="widgetCopy('iframeCode', this)">
            <span class="material-icons">content_copy</span> Kopiuj kod
          </button>
        </div>
      </div>

      <div class="widget-option-card">
        <div class="widget-option-head">
          <div class="widget-option-icon" style="background:#fef9c3;color:#a16207">
            <span class="material-icons">javascript</span>
          </div>
          <div>
            <strong>JavaScript — dynamiczny przycisk</strong>
            <p>Ładuje widget jako pływający przycisk "Zarezerwuj". Działa na każdej stronie.</p>
          </div>
        </div>
        <div class="widget-code-wrap">
          <pre id="jsCode" class="widget-code">${escHtml(jsCode)}</pre>
          <button class="widget-copy-btn" onclick="widgetCopy('jsCode', this)">
            <span class="material-icons">content_copy</span> Kopiuj kod
          </button>
        </div>
      </div>

      <div class="widget-option-card">
        <div class="widget-option-head">
          <div class="widget-option-icon" style="background:#f0fdf4;color:#15803d">
            <span class="material-icons">link</span>
          </div>
          <div>
            <strong>Bezpośredni link</strong>
            <p>Wrzuć w bio na Instagramie, Facebooku lub Linktree — klienci klikają i rezerwują.</p>
          </div>
        </div>
        <div class="widget-code-wrap">
          <pre id="directLink" class="widget-code">${escHtml(baseUrl)}</pre>
          <button class="widget-copy-btn" onclick="widgetCopy('directLink', this)">
            <span class="material-icons">content_copy</span> Kopiuj link
          </button>
        </div>
      </div>

    </div>

    <div class="widget-preview-section">
      <div class="widget-preview-header">
        <h3><span class="material-icons">preview</span> Podgląd widgetu</h3>
        <a href="${baseUrl}" target="_blank" class="btn btn-ghost btn-sm">
          <span class="material-icons">open_in_new</span> Otwórz w nowej karcie
        </a>
      </div>
      <div class="widget-preview-wrap">
        <iframe src="${baseUrl}&widget=1"
          class="widget-preview-frame"
          title="Podgląd strony rezerwacji"
          loading="lazy">
        </iframe>
      </div>
    </div>`;

  window.widgetCopy = (id, btn) => {
    const codeEl = document.getElementById(id);
    if (!codeEl) return;
    navigator.clipboard.writeText(codeEl.textContent.trim()).then(() => {
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons">check</span> Skopiowano!';
        btn.style.color = '#16a34a';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
      }
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = codeEl.textContent.trim();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons">check</span> Skopiowano!';
        setTimeout(() => { btn.innerHTML = orig; }, 1800);
      }
    });
  };
}

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
