import {
  db, collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp, orderBy,
} from '../firebase-config.js';
import { cancelBooking, addToCalendar } from '../modules/booking-mgr.js';
import { loadFavoriteIds, renderFavoritesGrid, toggleFavorite } from '../modules/favorites.js';
import { loadBusinesses } from '../modules/businesses.js';
import { exportAppointmentsCSV } from '../modules/csv-export.js';
import { toast, spinner } from '../modules/utils.js';
import { getPoints, getTier } from '../modules/loyalty.js';
import {
  DashState, initDashboardTabs, initBookingFilters, initBookingSearch, initViewToggle,
  initQuickActions, updateSidebarUser, syncSidebarBadges, renderLoginPrompt, switchDashboardTab, setText,
} from '../modules/dashboard-core.js';
import {
  computeStats, applyStatsToDom, updateHeroCopy, updateNextVisitCard,
  getNextAppointment, buildScheduleSummary, buildIcs, filterAppointments, sortList, getApptDate,
} from '../modules/dashboard-insights.js';
import {
  renderBookingsList, renderReviewsTab, renderOverviewWidgets, renderActivityFeed,
  renderMiniCalendar, renderLoyaltySidebar, renderForYou, renderBeautyJournal, renderSavedStyles,
  renderGiftCards, renderSubscriptions, renderDiscounts, renderMonthlyExpenseChart,
} from '../modules/dashboard-ui.js';

let _countdownTimer = null;

export async function initDashboard() {
  const user = window.App?.user;
  if (!user) {
    renderLoginPrompt();
    return;
  }

  updateSidebarUser(user);
  bindGlobals();
  bindModals();
  bindBudget();

  initDashboardTabs(onTabChange);
  initBookingFilters(onFilterChange);
  initBookingSearch(refreshBookings);
  initViewToggle(refreshBookings);
  initQuickActions({
    'focus-next': focusNextAppointment,
    calendar: addNextToCalendar,
    'book-again': () => switchDashboardTab('bookings', onTabChange),
    reminder: () => switchDashboardTab('stats', onTabChange),
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
  startCountdown();
}

function onTabChange(tab) {
  if (tab === 'bookings') refreshBookings();
  if (tab === 'favorites') loadFavoritesTab();
  if (tab === 'reviews') renderReviewsTab();
  if (tab === 'overview') refreshOverview();
  if (tab === 'dla-ciebie') loadDlaCiebieTab();
  if (tab === 'finanse') loadFinanseTab();
  if (tab === 'stats') renderMonthlyExpenseChart(getSavedBudget());
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

  window.rebookAppt = id => {
    const appt = DashState.appointments.find(a => a.id === id);
    if (!appt?.businessId) { toast('Brak danych salonu', 'error'); return; }
    window.location.href = `/luminaphp/?page=business&id=${appt.businessId}`;
  };

  window.deleteJournalEntry = async id => {
    const uid = window.App?.user?.uid;
    if (!uid) return;
    try {
      await deleteDoc(doc(db, 'beautyJournal', id));
      DashState.journal = DashState.journal.filter(e => e.id !== id);
      renderBeautyJournal();
      toast('Notatka usunięta', 'success');
    } catch { toast('Błąd usuwania', 'error'); }
  };

  window.deleteStyle = async id => {
    const uid = window.App?.user?.uid;
    if (!uid) return;
    try {
      await deleteDoc(doc(db, 'savedStyles', id));
      DashState.savedStyles = DashState.savedStyles.filter(s => s.id !== id);
      renderSavedStyles();
      toast('Inspiracja usunięta', 'success');
    } catch { toast('Błąd usuwania', 'error'); }
  };

  window.openWaitlistModal = () => {
    document.getElementById('waitlistModal')?.classList.remove('hidden');
  };
}

function bindModals() {
  const uid = window.App?.user?.uid;

  // Journal modal
  document.getElementById('addJournalBtn')?.addEventListener('click', () => {
    document.getElementById('journalModal')?.classList.remove('hidden');
    document.getElementById('journalDate').value = new Date().toISOString().split('T')[0];
  });
  const closeJournal = () => {
    document.getElementById('journalModal')?.classList.add('hidden');
    document.getElementById('journalForm')?.reset();
  };
  document.getElementById('closeJournalBtn')?.addEventListener('click', closeJournal);
  document.getElementById('cancelJournalBtn')?.addEventListener('click', closeJournal);
  document.getElementById('journalForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!uid) return;
    const title = document.getElementById('journalTitle').value.trim();
    const note = document.getElementById('journalNote').value.trim();
    const date = document.getElementById('journalDate').value;
    try {
      const ref = await addDoc(collection(db, 'beautyJournal'), {
        userId: uid, title, note, date, createdAt: serverTimestamp(),
      });
      DashState.journal.unshift({ id: ref.id, title, note, date });
      renderBeautyJournal();
      closeJournal();
      toast('Notatka zapisana', 'success');
    } catch { toast('Błąd zapisu', 'error'); }
  });

  // Style modal
  document.getElementById('addStyleBtn')?.addEventListener('click', () => {
    document.getElementById('styleModal')?.classList.remove('hidden');
  });
  const closeStyle = () => {
    document.getElementById('styleModal')?.classList.add('hidden');
    document.getElementById('styleForm')?.reset();
  };
  document.getElementById('closeStyleBtn')?.addEventListener('click', closeStyle);
  document.getElementById('cancelStyleBtn')?.addEventListener('click', closeStyle);
  document.getElementById('styleForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!uid) return;
    const imageUrl = document.getElementById('styleUrl').value.trim();
    const title = document.getElementById('styleTitle').value.trim();
    try {
      const ref = await addDoc(collection(db, 'savedStyles'), {
        userId: uid, imageUrl, title, createdAt: serverTimestamp(),
      });
      DashState.savedStyles.unshift({ id: ref.id, imageUrl, title });
      renderSavedStyles();
      closeStyle();
      toast('Inspiracja zapisana', 'success');
    } catch { toast('Błąd zapisu', 'error'); }
  });

  // Waitlist modal
  const closeWaitlist = () => {
    document.getElementById('waitlistModal')?.classList.add('hidden');
    document.getElementById('waitlistForm')?.reset();
  };
  document.getElementById('closeWaitlistBtn')?.addEventListener('click', closeWaitlist);
  document.getElementById('cancelWaitlistBtn')?.addEventListener('click', closeWaitlist);
  document.getElementById('waitlistForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!uid) return;
    const salon = document.getElementById('waitlistSalon').value.trim();
    const date = document.getElementById('waitlistDate').value;
    const note = document.getElementById('waitlistNote').value.trim();
    try {
      await addDoc(collection(db, 'waitlist'), {
        userId: uid, salon, date, note, status: 'waiting', createdAt: serverTimestamp(),
      });
      closeWaitlist();
      toast('Dołączono do listy oczekujących', 'success');
    } catch { toast('Błąd zapisu', 'error'); }
  });

  // Gift card check
  document.getElementById('checkGiftBtn')?.addEventListener('click', async () => {
    const code = document.getElementById('giftCardCode')?.value.trim().toUpperCase();
    const resultEl = document.getElementById('giftCardResult');
    if (!code || !resultEl) return;
    try {
      const snap = await getDocs(query(collection(db, 'giftCards'), where('code', '==', code)));
      resultEl.classList.remove('hidden');
      if (snap.empty) {
        resultEl.className = 'dash-gift-result dash-gift-result--error';
        resultEl.textContent = 'Nie znaleziono karty o tym kodzie.';
      } else {
        const card = snap.docs[0].data();
        resultEl.className = 'dash-gift-result dash-gift-result--ok';
        resultEl.textContent = `Saldo: ${card.balance ?? 0} zł${card.expires ? ` · Ważna do: ${card.expires}` : ''}`;
      }
    } catch { toast('Błąd sprawdzania karty', 'error'); }
  });

  // Close modals on backdrop click
  ['journalModal', 'styleModal', 'waitlistModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
      if (e.target.id === id) e.target.classList.add('hidden');
    });
  });
}

function bindBudget() {
  const input = document.getElementById('monthlyBudget');
  if (input) input.value = getSavedBudget() || '';
  document.getElementById('saveBudgetBtn')?.addEventListener('click', () => {
    const v = Number(document.getElementById('monthlyBudget')?.value) || 0;
    localStorage.setItem('lumina_monthly_budget', v);
    renderMonthlyExpenseChart(v);
    toast('Budżet zapisany', 'success');
  });
}

function getSavedBudget() {
  return Number(localStorage.getItem('lumina_monthly_budget')) || 0;
}

async function loadDlaCiebieTab() {
  const uid = window.App?.user?.uid;
  if (!uid) return;

  renderForYou();

  if (!DashState.journal.length) {
    try {
      const snap = await getDocs(query(
        collection(db, 'beautyJournal'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      ));
      DashState.journal = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { DashState.journal = []; }
  }
  renderBeautyJournal();

  if (!DashState.savedStyles.length) {
    try {
      const snap = await getDocs(query(
        collection(db, 'savedStyles'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      ));
      DashState.savedStyles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { DashState.savedStyles = []; }
  }
  renderSavedStyles();
}

async function loadFinanseTab() {
  const uid   = window.App?.user?.uid;
  const email = window.App?.user?.email || '';
  if (!uid) return;

  if (!DashState.giftCards.length) {
    try {
      // Legacy giftCards collection
      const gcSnap = await getDocs(query(collection(db, 'giftCards'), where('userId', '==', uid)));
      const giftCards = gcSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Vouchers bought via marketplace (as sender)
      const sentSnap = await getDocs(query(collection(db, 'vouchers'), where('senderUid', '==', uid)));
      sentSnap.docs.forEach(d => {
        const v = d.data();
        giftCards.push({ id: d.id, code: v.code, balance: v.amount, expires: '', _type: 'voucher' });
      });

      // Vouchers received (as recipient)
      if (email) {
        const recvSnap = await getDocs(query(collection(db, 'vouchers'), where('recipientEmail', '==', email)));
        recvSnap.docs.forEach(d => {
          const v = d.data();
          if (!giftCards.find(gc => gc.id === d.id)) {
            giftCards.push({ id: d.id, code: v.code, balance: v.amount, expires: '', _type: 'voucher' });
          }
        });
      }

      DashState.giftCards = giftCards;
    } catch { DashState.giftCards = []; }
  }
  renderGiftCards();

  if (!DashState.subscriptions.length) {
    try {
      const snap = await getDocs(query(
        collection(db, 'subscriptions'),
        where('userId', '==', uid),
        where('status', '==', 'active')
      ));
      DashState.subscriptions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { DashState.subscriptions = []; }
  }
  renderSubscriptions();

  try {
    const snap = await getDocs(query(collection(db, 'discounts'), where('userId', '==', uid)));
    DashState.discounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { DashState.discounts = []; }

  let loyaltyTier = null;
  try {
    const pts = (await getPoints(uid))?.points || 0;
    loyaltyTier = getTier(pts);
  } catch { /* skip */ }
  renderDiscounts(loyaltyTier);
}

function startCountdown() {
  if (_countdownTimer) clearInterval(_countdownTimer);
  tickCountdown();
  _countdownTimer = setInterval(tickCountdown, 1000);
}

function tickCountdown() {
  const next = getNextAppointment();
  const el = document.getElementById('nextVisitCountdown');
  const waitlistBtn = document.getElementById('waitlistBtn');
  if (!el) return;

  if (!next) {
    el.classList.add('hidden');
    if (waitlistBtn) waitlistBtn.classList.add('hidden');
    return;
  }

  const d = getApptDate(next);
  if (!d) { el.classList.add('hidden'); return; }

  const diff = d.getTime() - Date.now();
  if (diff <= 0) { el.classList.add('hidden'); return; }

  el.classList.remove('hidden');
  if (waitlistBtn) waitlistBtn.classList.remove('hidden');

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const set = (id, val) => {
    const e = document.getElementById(id);
    if (e) e.textContent = String(val).padStart(2, '0');
  };
  set('cdDays', days);
  set('cdHours', hours);
  set('cdMins', mins);
  set('cdSecs', secs);
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

async function refreshAll() {
  applyStatsToDom(computeStats(DashState.appointments));
  updateHeroCopy();
  updateNextVisitCard();
  refreshBookings();
  await refreshOverview();
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

async function refreshOverview() {
  await renderOverviewWidgets();
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
    await renderOverviewWidgets();
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
