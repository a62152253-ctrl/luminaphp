/* ===================================================================
   LUMINA BOT — UI Orchestrator (premium widget)
   =================================================================== */

import { getBrain } from './bot-brain.js';
import { executeAction, getActionLabel } from './bot-actions.js';
import { speak, startListening, stopListening, isListening, voiceAvailable, stopSpeaking } from './bot-voice.js';
import { INTENTS } from './bot-knowledge.js';
import { composeReply, pushHistory, getModelStatus } from './bot-dialogue.js';
import { getAppContext } from './bot-app.js';

const DELAY_MS = 450;

let _open = false;
let _voiceOn = false;
let _msgCount = 0;
let _root, _panel, _fab, _msgs, _input, _sendBtn, _micBtn, _badge, _voiceBtn, _statusEl, _unread, _suggestionsEl;

function buildWidget() {
  if (!document.querySelector('link[href*="main.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/luminaphp/css/main.css';
    document.head.appendChild(link);
  }

  _root = document.createElement('div');
  _root.id = 'luminaBot';
  _root.innerHTML = `
    <button class="bot-fab" id="botFab" aria-label="Otwórz Lumina Bot" aria-expanded="false">
      <span class="bot-fab-glow" aria-hidden="true"></span>
      <span class="material-icons bot-fab-icon">auto_awesome</span>
      <span class="material-icons bot-fab-close">close</span>
      <span class="bot-badge" id="botBadge"></span>
    </button>
    <div class="bot-panel" id="botPanel" role="dialog">
      <div class="bot-panel-bg" aria-hidden="true"></div>
      <div class="bot-header">
        <div class="bot-header-avatar"><span class="material-icons">auto_awesome</span></div>
        <div class="bot-header-info">
          <div class="bot-header-name">Lumina AI</div>
          <div class="bot-header-status">
            <span class="bot-status-dot"></span>
            <span id="botStatusText">Ładuję…</span>
          </div>
        </div>
        ${voiceAvailable ? '<button class="bot-header-voice" id="botVoiceToggle" aria-pressed="false"><span class="material-icons">volume_up</span></button>' : ''}
      </div>
      <div class="bot-suggestions" id="botSuggestions"></div>
      <div class="bot-messages" id="botMessages" aria-live="polite"></div>
      <div class="bot-input-area">
        ${voiceAvailable ? '<button class="bot-mic-btn" id="botMicBtn"><span class="material-icons">mic</span></button>' : ''}
        <textarea class="bot-input" id="botInput" placeholder="Zapytaj o salony, wizyty, promocje…" rows="1"></textarea>
        <button class="bot-send-btn" id="botSendBtn"><span class="material-icons">arrow_upward</span></button>
      </div>
    </div>`;

  document.body.appendChild(_root);

  _panel = document.getElementById('botPanel');
  _fab = document.getElementById('botFab');
  _msgs = document.getElementById('botMessages');
  _input = document.getElementById('botInput');
  _sendBtn = document.getElementById('botSendBtn');
  _badge = document.getElementById('botBadge');
  _voiceBtn = document.getElementById('botVoiceToggle');
  _micBtn = document.getElementById('botMicBtn');
  _statusEl = document.getElementById('botStatusText');
  _suggestionsEl = document.getElementById('botSuggestions');

  bindEvents();
  renderPageSuggestions();
}

function bindEvents() {
  _fab.addEventListener('click', togglePanel);
  _sendBtn.addEventListener('click', handleSend);
  _input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  _input.addEventListener('input', () => {
    _input.style.height = 'auto';
    _input.style.height = Math.min(_input.scrollHeight, 88) + 'px';
  });
  _voiceBtn?.addEventListener('click', () => {
    _voiceOn = !_voiceOn;
    _voiceBtn.setAttribute('aria-pressed', _voiceOn);
    _voiceBtn.querySelector('.material-icons').textContent = _voiceOn ? 'volume_up' : 'volume_off';
  });
  _micBtn?.addEventListener('click', handleMic);
  document.addEventListener('click', e => {
    if (_open && !_root.contains(e.target)) togglePanel();
  });
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'b') { e.preventDefault(); togglePanel(); }
  });
}

function renderPageSuggestions() {
  if (!_suggestionsEl) return;
  const ctx = getAppContext();
  const map = {
    home:          ['Barber Warszawa', 'Promocje', 'Mapa salonów', 'Jak działa Lumina'],
    explore:       ['Manicure Kraków', 'Masaż relaksacyjny', 'Barber', 'Mapa'],
    map:           ['Salony w pobliżu', 'Fryzjer', 'Filtruj miasto'],
    dashboard:     ['Anuluj wizytę', 'Nowa rezerwacja', 'Moje punkty'],
    offers:        ['Znajdź salon', 'Moje wizyty', 'Barber promo'],
    loyalty:       ['Ile mam punktów', 'Jak zdobywać', 'Zaproś znajomego'],
    favorites:     ['Znajdź nowy salon', 'Promocje', 'Moje wizyty'],
    profile:       ['Zmień hasło', 'Moje wizyty', 'Program lojalnościowy'],
    notifications: ['Moje wizyty', 'Znajdź salon', 'Promocje'],
    referral:      ['Mój kod', 'Jak działa', 'Program lojalnościowy'],
    business:      ['Zarejestruj salon', 'Jak to działa', 'Kontakt'],
    reviews:       ['Znajdź salon', 'Moje wizyty', 'Eksploruj'],
    auth:          ['Jak działa Lumina', 'Eksploruj salony', 'Promocje'],
    booking:       ['Moje wizyty', 'Anuluj wizytę', 'Nowa rezerwacja'],
    invoice:       ['Moje wizyty', 'Znajdź salon'],
  };
  const items = map[ctx.page] || ['Znajdź salon', 'Pomoc', 'Promocje'];
  _suggestionsEl.innerHTML = items.map(s =>
    `<button type="button" class="bot-suggestion" data-s="${escAttr(s)}">${escMsg(s)}</button>`
  ).join('');
  _suggestionsEl.querySelectorAll('.bot-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-s');
      if (!_open) togglePanel();
      addUserMsg(v);
      processInput(v);
    });
  });
}

function updateStatus() {
  if (_statusEl) _statusEl.textContent = getModelStatus(getBrain());
}

function togglePanel() {
  _open = !_open;
  _fab.classList.toggle('open', _open);
  _panel.classList.toggle('open', _open);
  _fab.setAttribute('aria-expanded', _open);

  if (_open) {
    _unread = 0;
    _badge.classList.remove('show');
    _badge.textContent = '';
    setTimeout(() => _input.focus(), 180);
    updateStatus();
    if (_msgCount === 0) {
      const ctx = getAppContext();
      const greet = ctx.userName
        ? `Hej, **${ctx.userName}**! Jestem **Lumina AI** — pomogę Ci znaleźć salon, zarezerwować wizytę, sprawdzić promocje i więcej. Co dziś szukasz?`
        : 'Hej! Jestem **Lumina AI** — Twój asystent beauty. Znajdę salon, umówię wizytę, pokażę mapę i promocje. Napisz czego szukasz!';
      addBotMsg(greet, INTENTS.find(i => i.id === 'greeting')?.chips || []);
    }
  } else {
    stopSpeaking();
    if (isListening()) stopListening();
  }
}

function addBotMsg(text, chips = [], meta = null) {
  _msgCount++;
  removeTyping();
  const wrap = document.createElement('div');
  wrap.className = 'bot-msg bot-msg--bot';
  const metaHtml = meta?.confidence != null
    ? `<div class="bot-msg-meta">${Math.round(meta.confidence * 100)}% dopasowania</div>`
    : '';
  wrap.innerHTML = `
    <div class="bot-msg-avatar"><span class="material-icons">auto_awesome</span></div>
    <div class="bot-msg-body">
      <div class="bot-msg-bubble">${formatRich(text)}</div>
      ${metaHtml}
    </div>`;
  _msgs.appendChild(wrap);
  if (chips.length) appendChips(chips);
  scrollBottom();
  if (_voiceOn) speak(stripMd(text));
  if (!_open) { _unread++; _badge.textContent = _unread; _badge.classList.add('show'); }
}

function appendChips(chips) {
  const row = document.createElement('div');
  row.className = 'bot-chips';
  row.innerHTML = chips.map(c => `<button type="button" class="bot-chip" data-chip="${escAttr(c)}">${escMsg(c)}</button>`).join('');
  _msgs.appendChild(row);
  row.querySelectorAll('.bot-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      addUserMsg(btn.getAttribute('data-chip'));
      processInput(btn.getAttribute('data-chip'));
      row.remove();
    });
  });
}

function addUserMsg(text) {
  const wrap = document.createElement('div');
  wrap.className = 'bot-msg bot-msg--user';
  wrap.innerHTML = `<div class="bot-msg-bubble">${escMsg(text)}</div>`;
  _msgs.appendChild(wrap);
  scrollBottom();
  pushHistory('user', text);
}

function showActionToast(label) {
  const t = document.createElement('div');
  t.className = 'bot-action-toast';
  t.innerHTML = `<span class="material-icons">bolt</span> ${escMsg(label)}`;
  _panel.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

function showTyping() {
  removeTyping();
  const d = document.createElement('div');
  d.className = 'bot-typing';
  d.id = 'botTyping';
  d.innerHTML = '<span></span><span></span><span></span>';
  _msgs.appendChild(d);
  scrollBottom();
}

function removeTyping() { document.getElementById('botTyping')?.remove(); }
function scrollBottom() { requestAnimationFrame(() => { _msgs.scrollTop = _msgs.scrollHeight; }); }

function handleSend() {
  const text = _input.value.trim();
  if (!text) return;
  _input.value = '';
  _input.style.height = '';
  addUserMsg(text);
  processInput(text);
}

async function processInput(text) {
  showTyping();
  _sendBtn.disabled = true;
  await new Promise(r => setTimeout(r, DELAY_MS));
  _sendBtn.disabled = false;
  try {
    const brain = getBrain();
    const result = await brain.classify(text);
    const reply = await composeReply(result, text);
    addBotMsg(reply.text, reply.chips, reply.meta);
    pushHistory('bot', stripMd(reply.text));
    if (result.intent?.action && result.confidence > 0.10) {
      setTimeout(() => {
        showActionToast(getActionLabel(result.intent.id));
        executeAction(result.intent, result.entities);
      }, 700);
    }
  } catch (e) {
    console.warn('[Bot]', e);
    addBotMsg('Coś poszło nie tak — spróbuj **pomoc** lub **znajdź salon**.', ['Pomoc', 'Znajdź salon']);
  }
}

function handleMic() {
  if (isListening()) { stopListening(); _micBtn?.classList.remove('listening'); return; }
  _micBtn?.classList.add('listening');
  _micBtn.querySelector('.material-icons').textContent = 'mic_off';
  startListening(
    t => { addUserMsg(t); processInput(t); },
    () => addBotMsg('Nie udało się nagrać — sprawdź mikrofon.', []),
    () => { _micBtn?.classList.remove('listening'); _micBtn.querySelector('.material-icons').textContent = 'mic'; }
  );
}

function formatRich(str) {
  return escMsg(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/_(.+?)_/g, '<em>$1</em>');
}
function stripMd(s) { return String(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/_(.+?)_/g, '$1'); }
function escMsg(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
function escAttr(str) { return String(str).replace(/"/g,'&quot;'); }

export function initBot() {
  if (document.getElementById('luminaBot')) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildWidget);
  else buildWidget();
}
