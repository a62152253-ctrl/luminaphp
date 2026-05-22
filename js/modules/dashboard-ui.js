import { db, collection, getDocs, query, where } from '../firebase-config.js';
import { DashState, setText } from './dashboard-core.js';
import { loadBusinesses } from './businesses.js';
import { renderAppointments } from './booking-mgr.js';
import { getPoints, getTier, TIERS } from './loyalty.js';
import {
  filterAppointments, sortList, getNextAppointment, isUpcoming, isCancelled, getApptDate, getFilterLabel,
  computeMonthlySpending, getAiRecommendations,
} from './dashboard-insights.js';
import { escHtml, emptyState, statusLabel, formatDatePl, formatTimestamp, formatCurrency } from './utils.js';

export async function renderLoyaltySidebar(uid) {
  const el = document.getElementById('sidebarLoyalty');
  if (!el || !uid) return;

  try {
    const data = await getPoints(uid);
    const pts = data.points || 0;
    const tier = getTier(pts);
    const next = TIERS.find(t => t.min > pts);
    const progress = next ? Math.min(100, ((pts - tier.min) / (next.min - tier.min)) * 100) : 100;

    el.innerHTML = `
      <div class="dash-loyalty-card">
        <div class="dash-loyalty-head">
          <span class="material-icons" style="color:${tier.color}">${tier.icon}</span>
          <div>
            <strong>${escHtml(tier.label)}</strong>
            <span>${pts} pkt</span>
          </div>
        </div>
        <div class="dash-loyalty-bar"><span style="width:${progress}%"></span></div>
        <p class="dash-loyalty-hint">${next ? `${next.min - pts} pkt do ${next.label}` : 'Maksymalny poziom!'}</p>
        <a href="/luminaphp/?page=loyalty" class="dash-loyalty-link">Program lojalnościowy →</a>
      </div>`;
  } catch {
    el.innerHTML = '<a href="/luminaphp/?page=loyalty" class="dash-loyalty-link">Program lojalnościowy →</a>';
  }
}

export async function renderMarketplacePicks() {
  const grid = document.getElementById('dashMarketplacePicks');
  if (!grid) return;

  try {
    const snap = await getDocs(query(collection(db, 'flashDeals'), where('active', '==', true)));
    if (!snap.empty) {
      const deals = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => !d.expiresAt || d.expiresAt.toDate?.() > new Date())
        .sort((a, b) => (a.expiresAt?.seconds || 0) - (b.expiresAt?.seconds || 0))
        .slice(0, 4);

      if (deals.length) {
        grid.innerHTML = deals.map(d => `
          <a href="/luminaphp/?page=marketplace" class="dash-market-card dash-market-card--deal">
            <div class="dash-market-deal-badge">-${d.discountPercent || 30}%</div>
            <img src="${escHtml(d.businessPhoto || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400')}" alt="" loading="lazy">
            <strong>${escHtml(d.serviceName || 'Flash Deal')}</strong>
            <span>${escHtml(d.businessName || '')} · <b style="color:var(--accent)">${d.discountedPrice || 0} zł</b></span>
          </a>`).join('');
        return;
      }
    }

    // Fallback: top businesses by rating
    const all = await loadBusinesses();
    const picks = [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    if (!picks.length) {
      grid.innerHTML = '<p class="dash-muted">Brak salonów — <a href="/luminaphp/?page=explore">przeglądaj marketplace</a></p>';
      return;
    }
    grid.innerHTML = picks.map(b => `
      <a href="/luminaphp/?page=business&id=${escHtml(b.id)}" class="dash-market-card">
        <img src="${escHtml(b.photoURL || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400')}" alt="" loading="lazy">
        <strong>${escHtml(b.name || 'Salon')}</strong>
        <span>${escHtml(b.category || '')} · ${escHtml(b.city || '')}</span>
      </a>`).join('');
  } catch {
    grid.innerHTML = '<p class="dash-muted">Nie udało się załadować salonów.</p>';
  }
}

export async function renderOverviewWidgets() {
  const next = getNextAppointment();
  const up = DashState.appointments.filter(isUpcoming);
  const fav = (window.App?.favorites || []).length;

  setText('overviewUpcoming', up.length);
  setText('overviewFavorites', fav);
  setText('overviewReviews', DashState.reviews.length);

  renderMarketplacePicks();

  const strip = document.getElementById('overviewNextStrip');
  if (!strip) return;

  if (!next) {
    strip.innerHTML = '<p class="dash-strip-empty">Brak nadchodzącej wizyty — <a href="/luminaphp/?page=explore">zarezerwuj teraz</a></p>';
    return;
  }

  strip.innerHTML = `
    <div class="dash-strip-item">
      <span class="material-icons">event</span>
      <div>
        <strong>${escHtml(next.serviceName || 'Wizyta')}</strong>
        <span>${formatDatePl(next.date)} · ${escHtml(next.time || '')}</span>
      </div>
    </div>
    <a href="?page=business&id=${escHtml(next.businessId || '')}" class="btn btn-accent btn-sm">Otwórz</a>`;
}

export function renderActivityFeed() {
  const el = document.getElementById('activityFeed');
  if (!el) return;

  const icons = { upcoming: 'schedule', history: 'check_circle', cancel: 'block', star: 'star' };
  const events = [];

  DashState.appointments.slice(0, 10).forEach(a => {
    events.push({
      ts: getApptDate(a)?.getTime() || 0,
      icon: isCancelled(a) ? 'cancel' : isUpcoming(a) ? 'upcoming' : 'history',
      title: a.serviceName || 'Wizyta',
      sub: `${a.businessName || 'Salon'} · ${statusLabel(a.status)}`,
    });
  });

  DashState.reviews.slice(0, 4).forEach(r => {
    events.push({
      ts: r.createdAt?.toDate?.()?.getTime() || 0,
      icon: 'star',
      title: `Opinia ${'★'.repeat(r.rating || 0)}`,
      sub: r.businessName || 'Salon',
    });
  });

  events.sort((a, b) => b.ts - a.ts);

  if (!events.length) {
    el.innerHTML = '<p class="dash-muted">Brak aktywności — zacznij od rezerwacji.</p>';
    return;
  }

  el.innerHTML = events.slice(0, 6).map(e => `
    <div class="dash-activity-item dash-activity-item--${e.icon}">
      <span class="material-icons">${icons[e.icon]}</span>
      <div>
        <strong>${escHtml(e.title)}</strong>
        <span>${escHtml(e.sub)}</span>
      </div>
    </div>`).join('');
}

export function renderMiniCalendar() {
  const el = document.getElementById('miniCalendar');
  if (!el) return;

  const today = new Date();
  const dows = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  const apptDates = new Set(
    DashState.appointments.filter(a => !isCancelled(a)).map(a => a.date).filter(Boolean)
  );

  let html = '<div class="dash-cal-grid">';
  dows.forEach(d => { html += `<span class="dash-cal-dow">${d}</span>`; });

  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const pad = (start.getDay() + 6) % 7;
  for (let i = 0; i < pad; i++) html += '<span class="dash-cal-day dash-cal-day--empty"></span>';

  for (let d = 1; d <= end.getDate(); d++) {
    const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cls = [
      'dash-cal-day',
      d === today.getDate() ? 'dash-cal-day--today' : '',
      apptDates.has(ds) ? 'dash-cal-day--has' : '',
    ].filter(Boolean).join(' ');
    html += `<span class="${cls}">${d}</span>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

export function renderBookingsList() {
  const listEl = document.getElementById('appointmentsList');
  const timelineEl = document.getElementById('appointmentsTimeline');
  if (!listEl) return;

  if (!DashState.appointments.length) {
    renderAppointments([], 'appointmentsList');
    setText('appointmentsMeta', 'Brak wizyt');
    setText('bookingsSubtitle', 'Zarezerwuj pierwszy termin w ulubionym salonie.');
    timelineEl?.classList.add('hidden');
    return;
  }

  const filtered = sortList(
    filterAppointments(DashState.appointments, DashState.filter, DashState.search),
    DashState.filter
  );

  if (DashState.view === 'timeline' && timelineEl) {
    listEl.classList.add('hidden');
    timelineEl.classList.remove('hidden');
    renderTimeline(filtered, timelineEl);
  } else {
    listEl.classList.remove('hidden');
    timelineEl?.classList.add('hidden');
    if (!filtered.length) {
      listEl.innerHTML = emptyState(
        'filter_alt_off', 'Brak w tym widoku', 'Zmień filtr lub wyszukiwanie.',
        '<button class="btn btn-ghost" onclick="window.resetBookingFilter?.()">Pokaż wszystkie</button>'
      );
    } else {
      renderAppointments(filtered, 'appointmentsList');
    }
  }

  const n = filtered.length;
  setText('appointmentsMeta', `${n} ${n === 1 ? 'pozycja' : n < 5 ? 'pozycje' : 'pozycji'} · ${getFilterLabel(DashState.filter)}`);
  setText('bookingsSubtitle', `Filtr: ${getFilterLabel(DashState.filter)}${DashState.search ? ` · „${DashState.search}"` : ''}`);
}

function renderTimeline(list, el) {
  if (!list.length) {
    el.innerHTML = emptyState('timeline', 'Pusta oś czasu', 'Brak wizyt w tym widoku.');
    return;
  }

  el.innerHTML = `<div class="dash-timeline">${list.map(a => `
    <article class="dash-timeline-item${isCancelled(a) ? ' is-cancelled' : ''}" id="appt-${escHtml(a.id)}">
      <div class="dash-timeline-dot"></div>
      <div class="dash-timeline-body">
        <time>${formatDatePl(a.date)} · ${escHtml(a.time || '')}</time>
        <h4>${escHtml(a.serviceName || 'Wizyta')}</h4>
        <p>${escHtml(a.businessName || '')}</p>
        <div class="dash-timeline-actions">
          ${a.businessId ? `<a href="?page=business&id=${escHtml(a.businessId)}" class="booking-action-btn booking-action-btn--primary">Salon</a>` : ''}
          ${!isCancelled(a) ? `<button type="button" class="booking-action-btn" onclick="window.addApptToCalendar?.('${escHtml(a.id)}')">Kalendarz</button>` : ''}
        </div>
      </div>
    </article>`).join('')}</div>`;
}

export function renderForYou() {
  const el = document.getElementById('aiRecsGrid');
  if (!el) return;
  const recs = getAiRecommendations(DashState.appointments);
  el.innerHTML = recs.map(r => `
    <a href="/luminaphp/?page=explore" class="dash-rec-card">
      <div class="dash-rec-icon"><span class="material-icons">${escHtml(r.icon)}</span></div>
      <strong>${escHtml(r.title)}</strong>
      <span>${escHtml(r.hint)}</span>
    </a>`).join('');
}

export function renderBeautyJournal() {
  const el = document.getElementById('journalList');
  if (!el) return;
  const entries = DashState.journal;
  if (!entries.length) {
    el.innerHTML = '<p class="dash-muted">Brak notatek — dodaj pierwszą po wizycie.</p>';
    return;
  }
  el.innerHTML = entries.map(e => `
    <article class="dash-journal-item">
      <div class="dash-journal-item-head">
        <strong>${escHtml(e.title || 'Notatka')}</strong>
        <div class="dash-journal-item-meta">
          ${e.date ? `<span><span class="material-icons">event</span>${escHtml(e.date)}</span>` : ''}
          <button type="button" class="dash-journal-delete" onclick="window.deleteJournalEntry?.('${escHtml(e.id)}')" aria-label="Usuń">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
      ${e.note ? `<p>${escHtml(e.note)}</p>` : ''}
    </article>`).join('');
}

export function renderSavedStyles() {
  const el = document.getElementById('savedStylesGrid');
  if (!el) return;
  const items = DashState.savedStyles;
  if (!items.length) {
    el.innerHTML = '<p class="dash-muted">Brak inspiracji — dodaj zdjęcie ze swojego ulubionego stylu.</p>';
    return;
  }
  el.innerHTML = items.map(s => `
    <div class="dash-style-card">
      <img src="${escHtml(s.imageUrl)}" alt="${escHtml(s.title || 'Inspiracja')}" loading="lazy">
      <div class="dash-style-card-footer">
        <span>${escHtml(s.title || 'Styl')}</span>
        <button type="button" onclick="window.deleteStyle?.('${escHtml(s.id)}')" aria-label="Usuń">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>`).join('');
}

export function renderGiftCards() {
  const el = document.getElementById('myGiftCards');
  if (!el) return;
  const cards = DashState.giftCards;
  if (!cards.length) {
    el.innerHTML = '<p class="dash-muted">Nie masz aktywnych kart podarunkowych.</p>';
    return;
  }
  el.innerHTML = cards.map(c => `
    <div class="dash-gift-card">
      <span class="material-icons">card_giftcard</span>
      <div>
        <strong>${escHtml(c.code || '—')}</strong>
        <span>Saldo: <b>${formatCurrency(c.balance || 0)}</b></span>
        ${c.expires ? `<span>Ważna do: ${escHtml(c.expires)}</span>` : ''}
      </div>
    </div>`).join('');
}

export function renderSubscriptions() {
  const el = document.getElementById('subscriptionsList');
  if (!el) return;
  const subs = DashState.subscriptions;
  if (!subs.length) {
    el.innerHTML = '<p class="dash-muted">Brak aktywnych pakietów subskrypcyjnych.</p>';
    return;
  }
  el.innerHTML = subs.map(s => `
    <div class="dash-sub-card">
      <div class="dash-sub-icon"><span class="material-icons">subscriptions</span></div>
      <div class="dash-sub-body">
        <strong>${escHtml(s.name || 'Pakiet')}</strong>
        <span>${escHtml(s.description || '')}</span>
        <div class="dash-sub-meta">
          <span>Pozostało: <b>${s.remaining ?? '—'}</b> wizyt</span>
          ${s.expires ? `<span>Ważny do: ${escHtml(s.expires)}</span>` : ''}
        </div>
      </div>
    </div>`).join('');
}

export function renderDiscounts(loyaltyTier) {
  const el = document.getElementById('myDiscounts');
  if (!el) return;
  const discounts = DashState.discounts;
  const tierBenefit = loyaltyTier
    ? { code: loyaltyTier.discount, label: `${loyaltyTier.label} — rabat lojalnościowy`, type: 'tier' }
    : null;
  const all = tierBenefit ? [tierBenefit, ...discounts] : discounts;
  if (!all.length) {
    el.innerHTML = '<p class="dash-muted">Brak aktywnych rabatów — zbieraj punkty lojalnościowe, aby odblokować korzyści.</p>';
    return;
  }
  el.innerHTML = all.map(d => `
    <div class="dash-discount-row">
      <div class="dash-discount-icon dash-discount-icon--${escHtml(d.type || 'coupon')}">
        <span class="material-icons">${d.type === 'tier' ? 'emoji_events' : 'local_offer'}</span>
      </div>
      <div>
        <strong>${escHtml(d.label || d.code || 'Rabat')}</strong>
        ${d.code && d.type !== 'tier' ? `<code class="dash-discount-code">${escHtml(d.code)}</code>` : ''}
        ${d.expires ? `<span class="dash-discount-exp">Ważny do: ${escHtml(d.expires)}</span>` : ''}
      </div>
    </div>`).join('');
}

export function renderMonthlyExpenseChart(budget) {
  const canvas = document.getElementById('statsMonthlyChart');
  if (!canvas || !window.Chart) return;

  const data = computeMonthlySpending(DashState.appointments);
  const labels = data.map(m => m.label);
  const values = data.map(m => m.total);
  const budgetLine = budget > 0 ? Array(data.length).fill(budget) : null;

  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Wydatki',
          data: values,
          backgroundColor: 'rgba(244,63,94,0.18)',
          borderColor: '#f43f5e',
          borderWidth: 2,
          borderRadius: 8,
        },
        ...(budgetLine ? [{
          label: 'Budżet',
          data: budgetLine,
          type: 'line',
          borderColor: '#6366f1',
          borderDash: [6, 3],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }] : []),
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: !!budgetLine } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => `${v} zł` } } },
    },
  });
}

export function renderReviewsTab() {
  const el = document.getElementById('reviewsList');
  if (!el) return;

  if (!DashState.reviews.length) {
    el.innerHTML = emptyState(
      'star_border', 'Brak opinii', 'Oceń salon po wizycie.',
      '<a href="/luminaphp/?page=explore" class="btn btn-accent" style="margin-top:1rem;display:inline-flex">Znajdź salon</a>'
    );
    return;
  }

  el.innerHTML = DashState.reviews.map(r => {
    const stars = [1, 2, 3, 4, 5].map(i =>
      `<span class="material-icons" style="font-size:1rem;color:${i <= (r.rating || 0) ? '#fbbf24' : 'var(--zinc-300)'}">star</span>`
    ).join('');
    return `
    <article class="review-item dash-review-card">
      <header>
        <div>
          <strong>${escHtml(r.businessName || 'Salon')}</strong>
          <span>${r.createdAt ? formatTimestamp(r.createdAt) : ''}</span>
        </div>
        <div class="review-stars">${stars}</div>
      </header>
      <p>${escHtml(r.text || r.comment || 'Bez komentarza')}</p>
    </article>`;
  }).join('');
}
