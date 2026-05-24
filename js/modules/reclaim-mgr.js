import { db, collection, addDoc, serverTimestamp } from '../firebase-config.js';
import { escHtml, toast, onAppReady } from './utils.js';

let _bizId      = null;
let _bizName    = '';
let _openedAt   = 0;
let _reportType = null;

export function initReclaim(bizId, bizName, bizVerified = false) {
  _bizId    = bizId;
  _bizName  = bizName;

  window.openReclaimModal  = openModal;
  window.closeReclaimModal = closeModal;
  window.submitReclaim     = submit;
  window.reclaimMsgCount   = msgCount;
  window.selectReportType  = selectType;

  const triggerBtn = document.getElementById('reclaimTrigger');
  if (!triggerBtn) return;

  const tryHide = () => {
    const user = window.App?.user;
    if (bizVerified && user?.uid === bizId) triggerBtn.style.display = 'none';
  };

  if (window.App?._ready) tryHide();
  else onAppReady(tryHide);
}

function openModal() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const modal = document.getElementById('reclaimModal');
  if (!modal || !modal.classList.contains('hidden')) return;

  _openedAt   = Date.now();
  _reportType = null;

  modal.classList.remove('hidden');
  document.getElementById('reclaimStep1')?.classList.remove('hidden');
  document.getElementById('reclaimStep2')?.classList.add('hidden');

  const errEl = document.getElementById('reclaimError');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }

  document.querySelectorAll('.report-type-btn').forEach(b => b.classList.remove('active'));

  const ta = document.getElementById('reportMsg');
  if (ta) ta.value = '';
  const counter = document.getElementById('reclaimMsgCounter');
  if (counter) counter.textContent = '';

  const btn = document.getElementById('reclaimSubmitBtn');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-icons">flag</span> Wyślij zgłoszenie';
  }
}

function closeModal() {
  document.getElementById('reclaimModal')?.classList.add('hidden');
}

function selectType(type, el) {
  _reportType = type;
  document.querySelectorAll('.report-type-btn').forEach(b => b.classList.remove('active'));
  el?.classList.add('active');
  const errEl = document.getElementById('reclaimError');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
}

function msgCount(val) {
  const counter = document.getElementById('reclaimMsgCounter');
  if (!counter) return;
  counter.textContent = val.length > 0 ? `${val.length} znaków` : '';
}

async function submit() {
  const user = window.App?.user;
  if (!user) { toast('Zaloguj się', 'error'); return; }

  if (!_reportType) {
    showError('Wybierz typ zgłoszenia.');
    return;
  }

  // Honeypot check
  if (document.getElementById('reclaimHp')?.value) {
    showResult(true); // silently fake success for bots
    return;
  }

  // Basic timing anti-spam
  const elapsed = (Date.now() - _openedAt) / 1000;
  if (elapsed < 2) {
    showResult(true);
    return;
  }

  const msg = (document.getElementById('reportMsg')?.value || '').trim();

  const btn = document.getElementById('reclaimSubmitBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons" style="animation:spin 1s linear infinite">autorenew</span> Wysyłanie…';
  }

  try {
    await addDoc(collection(db, 'reports'), {
      businessId:   _bizId,
      businessName: _bizName,
      userId:       user.uid,
      userEmail:    user.email || '',
      reportType:   _reportType,
      message:      msg,
      status:       'pending',
      createdAt:    serverTimestamp(),
    });
    showResult(true);
  } catch (e) {
    showError('Błąd zapisu: ' + e.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons">flag</span> Wyślij zgłoszenie';
    }
  }
}

function showError(txt) {
  const errEl = document.getElementById('reclaimError');
  if (!errEl) return;
  errEl.textContent = txt;
  errEl.style.display = 'flex';
  errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showResult(success) {
  document.getElementById('reclaimStep1')?.classList.add('hidden');
  const step2 = document.getElementById('reclaimStep2');
  if (!step2) return;
  step2.classList.remove('hidden');

  const icon  = success ? 'check_circle' : 'error_outline';
  const cls   = success ? 'reclaim-result--ok' : 'reclaim-result--warn';
  step2.innerHTML = `
    <div class="reclaim-result ${cls}">
      <span class="material-icons reclaim-result-icon">${escHtml(icon)}</span>
      <h4>Zgłoszenie wysłane</h4>
      <p>Dziękujemy! Sprawdzimy ten profil i podejmiemy odpowiednie działania.</p>
      <button class="btn btn-ghost" style="margin-top:1.25rem" onclick="window.closeReclaimModal()">Zamknij</button>
    </div>`;
}
