import { listenAuth, renderHeader, renderSidebar, login, logout, loadUserDoc }
  from './modules/auth-state.js';
import { loadNotifications, renderNotifications, markRead,
         clearAllNotifications, toggleNotifs }
  from './modules/notifications-mgr.js';
import { toggleFavorite } from './modules/favorites.js';
import { getCurrentPage } from './modules/utils.js';
import { app, db, doc, getDoc } from './firebase-config.js';
import { openProfileModal, closeProfileModal, onProfilePhotoChange, saveProfile }
  from './modules/profile-mgr.js';
import { initPush, registerServiceWorker } from './modules/fcm-push.js';
import { initCookieConsent } from './modules/cookie-consent.js';
import { initLanguageSwitcher } from './modules/i18n.js';
import { initOfflineSync } from './modules/offline-sync.js';
import { initAnalytics } from './modules/analytics.js';
import { trackClick } from './modules/referral.js';

/* Register SW immediately (PWA installability, even without FCM configured) */
registerServiceWorker();

/* Global feature modules */
initCookieConsent();
initLanguageSwitcher();
initOfflineSync();

/* Referral tracking from URL */
const _refCode = new URLSearchParams(location.search).get('ref');
if (_refCode) trackClick(_refCode);

// ===== GLOBAL STATE =====
window.App = { user: null, userDoc: null, role: null, businesses: [], notifications: [], favorites: [] };

// ===== AUTH LISTENER =====
listenAuth(async user => {
  window.App.user = user;
  renderHeader(user);
  renderSidebar(user);

  if (user) {
    try {
      // Load user's role and profile doc from Firestore (creates doc for new Google users)
      const userDoc = await loadUserDoc(user.uid, user);
      window.App.userDoc = userDoc;
      window.App.role    = userDoc.role;

      // Update header biz link visibility
      renderHeader(user);

      // Redirect from auth page after login (handles Google login + any case auth-page.js misses)
      const currentPage = getCurrentPage();
      if (currentPage === 'auth' && !window._authBusy) {
        if (userDoc.role === 'business') {
          const bizId = userDoc.businessId || user.uid;
          try {
            const bizSnap = await getDoc(doc(db, 'businesses', bizId));
            window.location.href = (bizSnap.exists() && bizSnap.data().profileComplete)
              ? '/luminaphp/?page=admin'
              : '/luminaphp/?page=setup';
          } catch(_) {
            window.location.href = '/luminaphp/?page=setup';
          }
        } else if (userDoc.role === 'client') {
          window.location.href = '/luminaphp/?page=dashboard';
        }
        // null role (Firestore error): stay on auth page
        return;
      }

      // Business user on the client dashboard → send to admin panel
      if (userDoc.role === 'business' && currentPage === 'dashboard') {
        window.location.href = '/luminaphp/?page=admin';
        return;
      }

      // Redirect business owner to setup if profile not complete (when navigating other pages)
      if (userDoc.role === 'business' && currentPage !== 'setup' && currentPage !== 'admin') {
        const bizId = userDoc.businessId || user.uid;
        try {
          const bizSnap = await getDoc(doc(db, 'businesses', bizId));
          if (bizSnap.exists() && !bizSnap.data().profileComplete) {
            window.location.href = '/luminaphp/?page=setup';
            return;
          }
        } catch(_) {}
      }

      // Load notifications (failure must not block _ready)
      try {
        window.App.notifications = await loadNotifications(user.uid);
      } catch(_) {
        window.App.notifications = [];
      }
      renderNotifications(window.App.notifications);

      // FCM push — fire-and-forget, never blocks page load
      initPush(app, user.uid);
    } catch(_) {
      // loadUserDoc failed — leave role as null, still unblock pages
    }
  } else {
    window.App.userDoc   = null;
    window.App.role      = null;
    window.App.notifications = [];
    renderNotifications([]);
  }

  // Always signal ready — pages waiting in tryInit can now proceed
  window.App._ready = true;
});

// ===== GLOBAL HANDLERS =====
window.login  = login;
window.logout = logout;

window.toggleNotifs = toggleNotifs;

// Profile modal
window.openProfileModal    = openProfileModal;
window.closeProfileModal   = closeProfileModal;
window.onProfilePhotoChange = onProfilePhotoChange;
window.saveProfile         = saveProfile;

// User dropdown
window.toggleUserMenu = () => document.getElementById('userMenu')?.classList.toggle('open');
window.closeUserMenu  = () => document.getElementById('userMenu')?.classList.remove('open');

window.markRead = async (id) => {
  await markRead(id, window.App.notifications);
  renderNotifications(window.App.notifications);
};

window.clearNotifs = async () => {
  window.App.notifications = await clearAllNotifications(window.App.notifications);
  renderNotifications(window.App.notifications);
};

window.toggleFav = async (bizId) => {
  const user = window.App?.user;
  if (!user) {
    window.location.href = '/luminaphp/?page=auth';
    return;
  }
  window.App.favorites = await toggleFavorite(user.uid, bizId, window.App.favorites);
};

// Close dropdowns on outside click
document.addEventListener('click', e => {
  const notifDd  = document.getElementById('notifDropdown');
  const notifBtn = document.getElementById('notifBtn');
  if (notifDd && !notifDd.contains(e.target) && !notifBtn?.contains(e.target)) {
    notifDd.classList.remove('open');
  }

  const userMenu = document.getElementById('userMenu');
  const userBtn  = document.getElementById('headerUserBtn');
  if (userMenu && !userMenu.contains(e.target) && !userBtn?.contains(e.target)) {
    userMenu.classList.remove('open');
  }
});

// Close profile modal on overlay click
document.addEventListener('click', e => {
  if (e.target.id === 'profileModal') window.closeProfileModal?.();
});

// ===== DARK MODE =====
(function initDarkMode() {
  const saved = localStorage.getItem('lumina_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;
  if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
})();

window.toggleDarkMode = () => {
  const html  = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('lumina_theme', isDark ? 'light' : 'dark');
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.textContent = isDark ? 'dark_mode' : 'light_mode';
  });
};

// ===== ONLINE / OFFLINE BANNER =====
(function initNetworkStatus() {
  function showOffline() {
    if (document.getElementById('offlineBanner')) return;
    const b = document.createElement('div');
    b.id = 'offlineBanner';
    b.style.cssText = 'position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:#1e293b;color:#f8fafc;padding:.5rem 1.25rem;border-radius:2rem;font-size:.85rem;z-index:9999;display:flex;align-items:center;gap:.5rem;box-shadow:0 4px 20px rgba(0,0,0,.4)';
    b.innerHTML = '<span class="material-icons" style="font-size:1rem;color:#f59e0b">wifi_off</span> Brak połączenia z internetem';
    document.body.appendChild(b);
  }
  function hideOffline() {
    document.getElementById('offlineBanner')?.remove();
  }
  window.addEventListener('offline', showOffline);
  window.addEventListener('online',  hideOffline);
  if (!navigator.onLine) showOffline();
})();

// ===== GLOBAL KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  // Ctrl+K or Cmd+K — jump to explore search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const page = new URLSearchParams(location.search).get('page') || 'home';
    if (page === 'explore') {
      document.getElementById('exploreSearch')?.focus();
    } else {
      window.location.href = '/luminaphp/?page=explore';
    }
  }
  // Escape — close any open dropdown
  if (e.key === 'Escape') {
    document.getElementById('notifDropdown')?.classList.remove('open');
    document.getElementById('userMenu')?.classList.remove('open');
    document.getElementById('mobileNavOverlay')?.classList.remove('open');
  }
});
