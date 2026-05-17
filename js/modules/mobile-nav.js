export function initMobileNav() {
  const layout = document.querySelector('.biz-layout');
  if (!layout) return;

  // Mobile toggle bar
  const toggleBar = document.createElement('div');
  toggleBar.className = 'biz-mobile-toggle';
  toggleBar.innerHTML = `
    <div class="biz-mobile-toggle-brand">
      <span class="material-icons" style="font-size:1.25rem;color:var(--accent)">storefront</span>
      <span id="mobileBizLabel">Panel Salonu</span>
    </div>
    <button class="biz-mobile-toggle-btn" id="mobileNavBtn" aria-label="Otwórz menu">
      <span class="material-icons">menu</span>
    </button>`;

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'biz-mobile-overlay';
  overlay.id = 'mobileNavOverlay';

  layout.insertBefore(toggleBar, layout.firstChild);
  layout.appendChild(overlay);

  const btn = document.getElementById('mobileNavBtn');
  btn?.addEventListener('click', () => layout.classList.toggle('biz-sidebar-open'));
  overlay.addEventListener('click', () => layout.classList.remove('biz-sidebar-open'));

  // Close on nav link click (mobile)
  layout.querySelectorAll('.biz-nav-link').forEach(link => {
    link.addEventListener('click', () => layout.classList.remove('biz-sidebar-open'));
  });

  // Sync label with business name
  const syncName = () => {
    const name = document.getElementById('adminBizName')?.textContent?.trim();
    const lbl  = document.getElementById('mobileBizLabel');
    if (name && name !== 'Mój Salon' && lbl) lbl.textContent = name;
  };
  const bizNameEl = document.getElementById('adminBizName');
  if (bizNameEl) {
    new MutationObserver(syncName).observe(bizNameEl, { childList: true, characterData: true, subtree: true });
  }
}
