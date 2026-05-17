import { listenConversations, openConversation, sendMessage, markAsRead, createConversation }
  from '../modules/chat.js';
import { loadBusinesses } from '../modules/businesses.js';
import { toast } from '../modules/utils.js';

let _unsub = null;
let _convId = null;

export async function initChat() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  listenConversations(user.uid, 'chatConversations', selectConversation);

  document.getElementById('chatForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const text = document.getElementById('chatInput')?.value;
    if (!_convId || !text) return;
    await sendMessage(_convId, text, user.uid, user.displayName);
    document.getElementById('chatInput').value = '';
  });

  document.getElementById('newChatBtn')?.addEventListener('click', async () => {
    const biz = (await loadBusinesses())[0];
    if (!biz) { toast('Brak salonów', 'error'); return; }
    const id = await createConversation(user.uid, biz.id, biz.name);
    selectConversation(id);
  });
}

function selectConversation(id) {
  _convId = id;
  if (_unsub) _unsub();
  document.getElementById('chatEmpty')?.classList.add('hidden');
  document.getElementById('chatWindow')?.classList.remove('hidden');
  _unsub = openConversation(id);
  markAsRead(id, window.App.user.uid);
}
