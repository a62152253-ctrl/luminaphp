import { db, collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, getDocs, limit }
  from '../firebase-config.js';
import { escHtml, formatTimestamp } from './utils.js';

export function openConversation(conversationId, containerId = 'chatMessages') {
  const el = document.getElementById(containerId);
  if (!el) return null;

  return onSnapshot(
    query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    ),
    snap => {
      el.innerHTML = snap.docs.map(d => renderMessage(d.id, d.data())).join('');
      el.scrollTop = el.scrollHeight;
    }
  );
}

function renderMessage(id, m) {
  const mine = m.senderId === window.App?.user?.uid;
  return `<div class="chat-msg ${mine ? 'chat-msg--mine' : 'chat-msg--other'}" data-id="${escHtml(id)}">
    <div class="chat-msg-bubble">${escHtml(m.text)}</div>
    <span class="chat-msg-time">${formatTimestamp(m.createdAt)}</span>
  </div>`;
}

export async function sendMessage(conversationId, text, senderId, senderName) {
  if (!text?.trim()) return null;
  const ref = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    text: text.trim(),
    senderId,
    senderName: senderName || 'Użytkownik',
    read: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text.trim(),
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function markAsRead(conversationId, userId) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  await Promise.all(
    snap.docs
      .filter(d => d.data().senderId !== userId)
      .map(d => updateDoc(d.ref, { read: true }))
  );
}

export async function loadHistory(conversationId) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
}

export function listenConversations(userId, containerId, onSelect) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!snap.size) {
      el.innerHTML = '<div class="empty-state"><p>Brak konwersacji</p></div>';
      return;
    }
    el.innerHTML = snap.docs.map(d => {
      const c = d.data();
      const idx = c.participants?.indexOf(userId) ?? 0;
      const otherIdx = idx === 0 ? 1 : 0;
      const other = c.participantNames?.[otherIdx] || 'Salon';
      return `<button class="chat-conv-item" data-id="${escHtml(d.id)}" type="button">
        <div class="chat-conv-avatar"><span class="material-icons">store</span></div>
        <div class="chat-conv-body">
          <div class="chat-conv-name">${escHtml(other)}</div>
          <div class="chat-conv-preview">${escHtml(c.lastMessage || '')}</div>
        </div>
        <span class="chat-conv-time">${formatTimestamp(c.lastMessageAt)}</span>
      </button>`;
    }).join('');
    el.querySelectorAll('.chat-conv-item').forEach(btn => {
      btn.addEventListener('click', () => onSelect?.(btn.dataset.id));
    });
  });
}

export async function createConversation(clientId, businessId, businessName) {
  const ref = await addDoc(collection(db, 'conversations'), {
    participants: [clientId, businessId],
    participantNames: [window.App?.user?.displayName || 'Klient', businessName],
    businessId,
    clientId,
    lastMessage: '',
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });
  return ref.id;
}
