import { db, collection, getDocs, addDoc, query, where, orderBy, updateDoc, doc, serverTimestamp }
  from '../firebase-config.js';
import { formatTimestamp } from './utils.js';

export async function createNotification(userId, type, title, message, link = '') {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId, type, title, message, link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch(_) {}
}

export function countUnread(notifications) {
  return notifications.filter(n => !n.read).length;
}

export async function markAllRead(notifications) {
  const unread = notifications.filter(n => !n.read);
  await Promise.all(unread.map(n => {
    n.read = true;
    return updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
  }));
  return notifications;
}

export async function loadNotifications(uid) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    return [];
  }
}

export function renderNotifications(notifications) {
  const badge = document.getElementById('notifBadge');
  const body  = document.getElementById('notifBody');
  if (!badge || !body) return;

  const unread = notifications.filter(n => !n.read).length;
  badge.textContent = unread;
  badge.classList.toggle('hidden', unread === 0);

  if (!notifications.length) {
    body.innerHTML = `<div class="notif-empty">
      <div class="notif-empty-icon"><span class="material-icons">notifications_off</span></div>
      <p style="font-size:.6875rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--zinc-300)">Brak powiadomień</p>
    </div>`;
    return;
  }

  const clearBtn = document.querySelector('.notif-clear');
  if (clearBtn) clearBtn.onclick = () => window.clearNotifs?.();

  const NOTIF_ICONS = {
    booking:   'calendar_today',
    cancelled: 'event_busy',
    review:    'star',
    reminder:  'alarm',
    promo:     'local_offer',
    system:    'settings',
  };

  body.innerHTML = notifications.map(n => {
    const clickHandler = n.link
      ? `window.markRead('${n.id}');window.location.href='${n.link}'`
      : `window.markRead('${n.id}')`;
    return `
    <div class="notif-item${n.read ? '' : ' unread'}" onclick="${clickHandler}" style="${n.link ? 'cursor:pointer' : ''}">
      <div class="notif-icon">
        <span class="material-icons">${NOTIF_ICONS[n.type] || 'notifications'}</span>
      </div>
      <div style="flex:1;min-width:0">
        <p class="notif-title">${n.title || ''}</p>
        <p class="notif-msg">${n.message || ''}</p>
        <p class="notif-time">${formatTimestamp(n.createdAt)}</p>
      </div>
      ${!n.read ? '<div class="notif-dot"></div>' : ''}
    </div>`;
  }).join('');
}

export async function markRead(id, notifications) {
  const n = notifications.find(x => x.id === id);
  if (!n || n.read) return;
  n.read = true;
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch(e) {}
}

export async function clearAllNotifications(notifications) {
  const promises = notifications.map(n => {
    n.read = true;
    return updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
  });
  await Promise.all(promises);
  return [];
}

export function toggleNotifs() {
  document.getElementById('notifDropdown')?.classList.toggle('open');
}
