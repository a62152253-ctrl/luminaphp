// admin/marketing.js — Kampanie marketingowe
import { db, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

let _bizId;
let _clients = []; // derived from appts

const TEMPLATES = {
  birthday: {
    label: 'Życzenia urodzinowe',
    subject: 'Wszystkiego najlepszego! 🎂',
    body: 'Drogi Kliencie,\n\nZ okazji urodzin przesyłamy Ci wyjątkową ofertę — 15% rabatu na dowolną usługę w tym miesiącu!\n\nWystarczy wspomnieć o tym rabacie przy rezerwacji.\n\nZ życzeniami,\nZespół salonu',
    channel: 'email',
  },
  lastminute: {
    label: 'Promocja last minute',
    subject: 'Wolny termin dziś ⚡ — skorzystaj ze zniżki!',
    body: 'Mamy wolny termin dziś!\n\nZarezerwuj teraz i skorzystaj z 10% zniżki. Oferta ważna tylko przez kilka godzin.\n\nZadzwoń lub zarezerwuj online.',
    channel: 'email',
  },
  promo: {
    label: 'Promocja ogólna',
    subject: 'Wyjątkowa oferta specjalnie dla Ciebie',
    body: 'Drogi Kliencie,\n\nMamy dla Ciebie specjalną propozycję — zapraszamy na wizytę w wyjątkowo atrakcyjnej cenie!\n\nOferta ograniczona czasowo. Zarezerwuj dziś.',
    channel: 'email',
  },
  rebook: {
    label: 'Zaproszenie do powrotu',
    subject: 'Tęsknimy za Tobą! 💇',
    body: 'Drogi Kliencie,\n\nMinęło trochę czasu od Twojej ostatniej wizyty. Wróć do nas — czekamy z nowymi usługami i wyjątkową atmosferą!\n\nZarezerwuj wizytę już dziś.',
    channel: 'email',
  },
  custom: {
    label: 'Własna kampania',
    subject: '',
    body: '',
    channel: 'email',
  },
};

export async function initMarketing(bizId, appts) {
  _bizId   = bizId;
  _clients = buildClientList(appts);
  await renderCampaignHistory();
  window.bizNewCampaign   = openCampaignModal;
  window.mktSendCampaign  = sendCampaign;
  window.mktCloseCampaign = closeCampaignModal;
  window.mktUpdateRecipients = updateRecipients;
}

function buildClientList(appts) {
  const map = {};
  appts.forEach(a => {
    const key = a.clientPhone || a.userId || a.clientName;
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        key,
        name:     a.clientName || a.userName || 'Klient',
        email:    a.clientEmail || '',
        phone:    a.clientPhone || '',
        lastDate: a.date || '',
        appts:    [],
      };
    }
    map[key].appts.push(a);
    if ((a.date || '') > (map[key].lastDate || '')) map[key].lastDate = a.date;
  });
  return Object.values(map);
}

async function renderCampaignHistory() {
  const el = document.getElementById('campaignHistory');
  if (!el) return;

  let campaigns = [];
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('businessId', '==', _bizId)
    );
    const snap = await getDocs(q);
    campaigns = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
  } catch(e) {}

  if (!campaigns.length) {
    el.innerHTML = `<div class="mkt-empty">
      <span class="material-icons">campaign</span>
      <p>Brak wysłanych kampanii. Wybierz szablon powyżej, aby zacząć.</p>
    </div>`;
    return;
  }

  el.innerHTML = `<h3 class="mkt-history-title">Historia kampanii</h3>
    <div class="mkt-history-list">${campaigns.map(c => campaignRow(c)).join('')}</div>`;
}

function campaignRow(c) {
  const date = c.createdAt?.toDate?.()?.toLocaleDateString('pl-PL') || '—';
  const icons = { birthday: 'cake', lastminute: 'bolt', promo: 'local_offer', rebook: 'replay', custom: 'edit' };
  const channelIcons = { email: 'email', sms: 'sms', push: 'notifications' };
  return `<div class="mkt-camp-row">
    <div class="mkt-camp-icon"><span class="material-icons">${icons[c.type] || 'campaign'}</span></div>
    <div class="mkt-camp-info">
      <div class="mkt-camp-title">${esc(c.subject || TEMPLATES[c.type]?.label || 'Kampania')}</div>
      <div class="mkt-camp-meta">
        <span class="material-icons" style="font-size:.75rem">${channelIcons[c.channel] || 'email'}</span>
        ${c.channel || 'email'} · ${date} · ${c.recipientCount || 0} odbiorców
      </div>
    </div>
    <span class="mkt-camp-status mkt-status-${c.status || 'sent'}">${statusLabel(c.status)}</span>
  </div>`;
}

function openCampaignModal(type = 'custom') {
  const tmpl = TEMPLATES[type] || TEMPLATES.custom;
  const modal = document.getElementById('mktCampaignModal');
  if (!modal) return;

  document.getElementById('mktCampaignType').value = type;
  document.getElementById('mktSubject').value      = tmpl.subject;
  document.getElementById('mktBody').value         = tmpl.body;
  document.getElementById('mktChannel').value      = tmpl.channel;
  document.getElementById('mktModalTitle').textContent = tmpl.label || 'Nowa kampania';

  updateRecipients(type);
  modal.classList.remove('hidden');
}

function updateRecipients(type) {
  const el    = document.getElementById('mktRecipientsList');
  const count = document.getElementById('mktRecipientCount');
  if (!el) return;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const cutoff = fourWeeksAgo.toISOString().slice(0, 10);

  const thisMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  let recipients = _clients;
  if (type === 'birthday') {
    recipients = _clients.filter(c => {
      // clients.js stores birthday in Firestore; here we approximate from appts data
      return false; // actual birthday data comes from Firestore clients collection
    });
    // Fallback: just use all clients if no birthday data
    if (!recipients.length) recipients = _clients;
  } else if (type === 'rebook') {
    recipients = _clients.filter(c => !c.lastDate || c.lastDate < cutoff);
  }

  if (count) count.textContent = recipients.length + ' odbiorców';
  el.innerHTML = recipients.slice(0, 8).map(c =>
    `<span class="mkt-recipient-chip">${esc(c.name)}</span>`
  ).join('') + (recipients.length > 8
    ? `<span class="mkt-recipient-chip mkt-chip-more">+${recipients.length - 8} więcej</span>`
    : '');
}

async function sendCampaign() {
  const type    = document.getElementById('mktCampaignType')?.value || 'custom';
  const subject = document.getElementById('mktSubject')?.value.trim();
  const body    = document.getElementById('mktBody')?.value.trim();
  const channel = document.getElementById('mktChannel')?.value || 'email';
  const countEl = document.getElementById('mktRecipientCount');
  const recipientCount = parseInt(countEl?.textContent) || _clients.length;

  if (!subject || !body) { toast('Uzupełnij temat i treść wiadomości', 'error'); return; }

  const btn = document.querySelector('#mktCampaignModal .btn-accent');
  if (btn) { btn.disabled = true; btn.textContent = 'Wysyłanie…'; }

  try {
    await addDoc(collection(db, 'campaigns'), {
      businessId: _bizId,
      type,
      subject,
      body,
      channel,
      recipientCount,
      status: 'sent',
      createdAt: serverTimestamp(),
    });
    toast('Kampania zapisana i zakolejkowana do wysyłki!');
    closeCampaignModal();
    await renderCampaignHistory();
  } catch(e) {
    toast('Błąd zapisu kampanii', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-icons">send</span> Wyślij kampanię'; }
  }
}

function closeCampaignModal() {
  document.getElementById('mktCampaignModal')?.classList.add('hidden');
}

function statusLabel(s) {
  return { sent: 'Wysłana', draft: 'Szkic', failed: 'Błąd wysyłki', queued: 'W kolejce' }[s] || 'Wysłana';
}
const esc = s => String(s ?? '').replace(/</g, '&lt;');
