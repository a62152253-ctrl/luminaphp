import { db, collection, getDocs, query, where } from '../firebase-config.js';
import { cancelBooking, addToCalendar } from '../modules/booking-mgr.js';
import { loadFavoriteIds, renderFavoritesGrid, toggleFavorite } from '../modules/favorites.js';
import { loadBusinesses } from '../modules/businesses.js';
import { exportAppointmentsCSV } from '../modules/csv-export.js';
import { toast, spinner } from '../modules/utils.js';
import {
  DashState, initDashboardTabs, initBookingFilters, initBookingSearch, initViewToggle,
  initQuickActions, updateSidebarUser, syncSidebarBadges, renderLoginPrompt, switchDashboardTab, setText,
} from '../modules/dashboard-core.js';
import {
  computeStats, applyStatsToDom, updateHeroCopy, updateNextVisitCard,
  getNextAppointment, buildScheduleSummary, buildIcs, filterAppointments, sortList,
} from '../modules/dashboard-insights.js';
import {
  renderBookingsList, renderReviewsTab, renderOverviewWidgets, renderActivityFeed,
  renderMiniCalendar, renderLoyaltySidebar,
} from '../modules/dashboard-ui.js';

export async function initDashboard() {
  const user = window.App?.user;
  if (!user) {
    renderLoginPrompt();
    return;
  }

  updateSidebarUser(user);
  bindGlobals();

  initDashboardTabs(onTabChange);
  initBookingFilters(onFilterChange);
  initBookingSearch(refreshBookings);
  initViewToggle(refreshBookings);
  initQuickActions({
    'focus-next': focusNextAppointment,
    calendar: addNextToCalendar,
    copy: copySchedule,
    export: exportCsv,
    profile: () => window.openProfileModal?.(),
  });

  await Promise.all([
    loadBookings(user.uid),
    loadFavoritesData(user.uid),
    loadReviewsData(user.uid),
    renderLoyaltySidebar(user.uid),
  ]);

  refreshAll();
}

function onTabChange(tab) {
  if (tab === 'bookings') refreshBookings();
  if (tab === 'favorites') loadFavoritesTab();
  if (tab === 'reviews') renderReviewsTab();
  if (tab === 'overview') refreshOverview();
}

function onFilterChange(filter) {
  DashState.filter = filter || 'all';
  document.querySelectorAll('.dashboard-filter[data-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === DashState.filter);
  });
  refreshBookings();
}

function bindGlobals() {
  window.resetBookingFilter = () => onFilterChange('all');

  window.cancelAppt = async id => {
    if (!(await cancelBooking(id))) return;
    const appt = DashState.appointments.find(a => a.id === id);
    if (appt) appt.status = 'cancelled';
    refreshAll();
  };

  window.addApptToCalendar = id => {
    const appt = DashState.appointments.find(a => a.id === id);
    if (!appt) return;
    addToCalendar(appt);
    toast('Dodano do kalendarza', 'success');
  };
}

async function loadBookings(uid) {
  const listEl = document.getElementById('appointmentsList');
  if (listEl) listEl.innerHTML = spinner('3rem auto');

  try {
    const snap = await getDocs(query(collection(db, 'appointments'), where('userId', '==', uid)));
    DashState.appointments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    DashState.appointments = [];
    toast('Nie udało się załadować wizyt', 'error');
  }
}

async function loadFavoritesData(uid) {
  try {
    window.App.favorites = await loadFavoriteIds(uid);
  } catch {
    window.App.favorites = [];
  }
  setText('favoritesMeta', formatFavMeta(window.App.favorites.length));
}

async function loadReviewsData(uid) {
  try {
    const snap = await getDocs(query(collection(db, 'reviews'), where('userId', '==', uid)));
    DashState.reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    DashState.reviews = [];
  }
  updateReviewsMeta();
}

function refreshAll() {
  applyStatsToDom(computeStats(DashState.appointments));
  updateHeroCopy();
  updateNextVisitCard();
  refreshBookings();
  refreshOverview();
  syncSidebarBadges({
    bookings: DashState.appointments.length,
    favorites: (window.App?.favorites || []).length,
    reviews: DashState.reviews.length,
  });
}

function refreshBookings() {
  applyStatsToDom(computeStats(DashState.appointments));
  renderBookingsList();
}

function refreshOverview() {
  renderOverviewWidgets();
  renderActivityFeed();
  renderMiniCalendar();
  updateHeroCopy();
  updateNextVisitCard();
}

async function loadFavoritesTab() {
  const uid = window.App?.user?.uid;
  const grid = document.getElementById('favoritesGrid');
  if (!uid || !grid) return;

  if (!DashState.businesses.length) {
    grid.innerHTML = spinner('3rem auto');
    DashState.businesses = await loadBusinesses();
  }

  const favorites = window.App.favorites || await loadFavoriteIds(uid);
  window.App.favorites = favorites;
  renderFavoritesGrid(favorites, DashState.businesses, 'favoritesGrid');
  setText('favoritesMeta', formatFavMeta(favorites.length));

  window.toggleFav = async bizId => {
    const updated = await toggleFavorite(uid, bizId, window.App.favorites);
    window.App.favorites = updated;
    renderFavoritesGrid(updated, DashState.businesses, 'favoritesGrid');
    setText('favoritesMeta', formatFavMeta(updated.length));
    syncSidebarBadges({
      bookings: DashState.appointments.length,
      favorites: updated.length,
      reviews: DashState.reviews.length,
    });
    renderOverviewWidgets();
  };
}

function updateReviewsMeta() {
  const reviews = DashState.reviews;
  if (!reviews.length) {
    setText('reviewsMeta', 'Brak opinii');
    return;
  }
  const avg = (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1).replace('.', ',');
  setText('reviewsMeta', `${reviews.length} opinii · średnia ${avg}/5`);
}

function formatFavMeta(n) {
  if (!n) return 'Brak ulubionych salonów';
  return `${n} ${n === 1 ? 'salon' : n < 5 ? 'salony' : 'salonów'}`;
}

function focusNextAppointment() {
  const next = getNextAppointment();
  if (!next) {
    toast('Brak nadchodzącej wizyty', 'error');
    return;
  }
  switchDashboardTab('bookings', onTabChange);
  onFilterChange('upcoming');
  requestAnimationFrame(() => {
    const card = document.getElementById(`appt-${next.id}`);
    card?.classList.add('booking-item--pulse');
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => card?.classList.remove('booking-item--pulse'), 1400);
  });
}

function addNextToCalendar() {
  const next = getNextAppointment();
  if (!next) {
    toast('Brak wizyty do eksportu', 'error');
    return;
  }
  const ics = buildIcs(next);
  if (!ics) {
    toast('Nieprawidłowa data wizyty', 'error');
    return;
  }
  const blob = new Blob([ics], { type: 'text/calendar' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'lumina-wizyta.ics',
  });
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Pobrano plik kalendarza', 'success');
}

async function copySchedule() {
  if (!DashState.appointments.length) {
    toast('Brak wizyt do skopiowania', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(buildScheduleSummary());
    toast('Skopiowano plan wizyt', 'success');
  } catch {
    toast('Nie udało się skopiować', 'error');
  }
}

function exportCsv() {
  if (!DashState.appointments.length) {
    toast('Brak wizyt do eksportu', 'error');
    return;
  }
  exportAppointmentsCSV(sortList(DashState.appointments, 'all'), 'lumina-wizyty.csv');
  toast('Eksport CSV gotowy', 'success');
}
