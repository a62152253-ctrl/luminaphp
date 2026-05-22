/** Stan i nawigacja panelu klienta */
export const DashState = {
  appointments: [],
  reviews: [],
  businesses: [],
  favorites: [],
  loyalty: null,
  journal: [],
  savedStyles: [],
  giftCards: [],
  subscriptions: [],
  discounts: [],
  tab: 'overview',
  filter: 'all',
  search: '',
  view: 'list',
};

export function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function initDashboardTabs(onTab) {
  document.querySelectorAll('.sidebar-link[data-tab], .dashboard-mobile-tab[data-tab]').forEach(ctrl => {
    ctrl.addEventListener('click', e => {
      e.preventDefault();
      switchDashboardTab(ctrl.dataset.tab, onTab);
    });
  });
}

export function switchDashboardTab(tab, onTab) {
  DashState.tab = tab;

  document.querySelectorAll('.sidebar-link[data-tab]').forEach(l => {
    l.classList.toggle('active', l.dataset.tab === tab);
  });
  document.querySelectorAll('.dashboard-mobile-tab[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.dash-tab').forEach(s => {
    s.classList.toggle('hidden', s.dataset.tab !== tab);
  });

  onTab?.(tab);
}

export function initBookingFilters(onFilter) {
  document.querySelectorAll('.dashboard-filter[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => onFilter(btn.dataset.filter));
  });
}

export function initBookingSearch(onSearch) {
  const input = document.getElementById('bookingSearchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    DashState.search = input.value.trim().toLowerCase();
    onSearch();
  });
}

export function initViewToggle(onToggle) {
  document.querySelectorAll('.dash-view-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      DashState.view = btn.dataset.view;
      document.querySelectorAll('.dash-view-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.view === DashState.view);
      });
      onToggle();
    });
  });
}

export function initQuickActions(handlers) {
  document.querySelectorAll('.dashboard-action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handlers[btn.dataset.action]?.());
  });
}

export function updateSidebarUser(user) {
  const avatar = document.getElementById('sidebarAvatar');
  const name = document.getElementById('sidebarName');
  const heroTitle = document.getElementById('dashboardHeroTitle');
  const displayName = user.displayName || user.email || 'Użytkowniku';
  const firstName = displayName.split(/[ @]/)[0] || 'Użytkowniku';

  if (avatar) avatar.src = user.photoURL || 'https://i.pravatar.cc/200';
  if (name) name.textContent = displayName;
  if (heroTitle) heroTitle.textContent = `Cześć, ${firstName}`;
}

export function syncSidebarBadges(counts) {
  const { bookings, favorites, reviews } = counts;
  ['sidebarBookingsCount', 'mobileBookingsCount'].forEach(id => setText(id, bookings));
  ['sidebarFavoritesCount', 'mobileFavoritesCount'].forEach(id => setText(id, favorites));
  ['sidebarReviewsCount', 'mobileReviewsCount'].forEach(id => setText(id, reviews));
}

export function renderLoginPrompt() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  content.innerHTML = `
    <div class="dash-login-wall">
      <div class="dash-login-card">
        <span class="material-icons dash-login-icon">lock</span>
        <h2>Zaloguj się do panelu</h2>
        <p>Twoje wizyty, ulubione salony i program lojalnościowy czekają po zalogowaniu.</p>
        <button type="button" class="btn btn-accent" onclick="window.login()">Kontynuuj z Google</button>
        <a href="/luminaphp/?page=auth" class="dash-login-link">Inne metody logowania</a>
      </div>
    </div>`;
}
