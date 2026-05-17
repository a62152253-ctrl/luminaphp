import { loadNotifications, renderNotifications, clearAllNotifications } from '../modules/notifications-mgr.js';
import { escHtml, formatTimestamp } from '../modules/utils.js';

const PAGE_SIZE = 15;
let _all = [];
let _filter = 'all';
let _page = 0;

export async function initNotifications() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  _all = await loadNotifications(user.uid);
  document.querySelectorAll('.notif-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.notif-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _filter = btn.dataset.filter;
      _page = 0;
      render();
    });
  });
  document.getElementById('clearAllNotifs')?.addEventListener('click', async () => {
    await clearAllNotifications(_all);
    _all = [];
    render();
  });
  render();
}

function render() {
  let items = _filter === 'all' ? _all : _all.filter(n => n.type === _filter);
  const total = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice(_page * PAGE_SIZE, (_page + 1) * PAGE_SIZE);
  const el = document.getElementById('notificationsList');
  if (!el) return;
  el.innerHTML = pageItems.length ? pageItems.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <span class="material-icons">${iconFor(n.type)}</span>
      <div><strong>${escHtml(n.title || n.message)}</strong>
        <p>${escHtml(n.message || '')}</p>
        <time>${formatTimestamp(n.createdAt)}</time>
      </div>
    </motion-div>`).join('').replace(/motion-div>/g, 'motion-div>'.startsWith('x') ? 'div>' : 'div>') : '<p class="text-muted">Brak powiadomień</p>';

  const pag = document.getElementById('notifPagination');
  if (pag && total > 1) {
    pag.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button class="page-btn ${i === _page ? 'active' : ''}" data-page="${i}">${i + 1}</button>`
    ).join('');
    pag.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => { _page = Number(btn.dataset.page); render(); });
    });
  }
}

function iconFor(type) {
  return { booking: 'calendar_today', promo: 'local_offer', system: 'info' }[type] || 'notifications';
}
