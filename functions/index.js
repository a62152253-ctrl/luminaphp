const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const SMTP_USER = defineSecret('SMTP_USER');
const SMTP_PASS = defineSecret('SMTP_PASS');

// ─── EMAIL TRANSPORT ────────────────────────────────────────────────────────

function makeTransport(user, pass) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendMail(transporter, opts) {
  try { await transporter.sendMail(opts); } catch (e) {
    console.error('sendMail error:', e.message);
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function getEmail(uid) {
  try { return (await admin.auth().getUser(uid)).email || null; } catch { return null; }
}

const STATUS_PL = {
  potwierdzona: 'Wizyta potwierdzona',
  confirmed:    'Wizyta potwierdzona',
  cancelled:    'Wizyta anulowana',
  anulowana:    'Wizyta anulowana',
  zakończona:   'Wizyta zakończona',
  completed:    'Wizyta zakończona',
  'nie przyszedł': 'Klient nie przyszedł',
};

// ─── EMAIL TEMPLATES ────────────────────────────────────────────────────────

function tmplHeader() {
  return `<div style="background:#09090b;padding:1.25rem 2rem;">
    <span style="font-family:sans-serif;font-size:1.1rem;font-weight:900;color:white;letter-spacing:-.03em;">
      Lumina <span style="color:#f43f5e;">●</span>
    </span>
  </div>`;
}

function tmplRow(label, value) {
  return `<tr>
    <td style="padding:.45rem 0;color:#71717a;font-size:.8rem;white-space:nowrap;">${label}</td>
    <td style="padding:.45rem 0 .45rem 1rem;font-weight:600;color:#09090b;">${html(value || '—')}</td>
  </tr>`;
}

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tmplTable(appt, fields) {
  const rows = {
    salon:     tmplRow('Salon',        appt.businessName),
    klient:    tmplRow('Klient',       appt.clientName),
    usluga:    tmplRow('Usługa',       appt.serviceName),
    pracownik: tmplRow('Pracownik',    appt.staffName || 'Dowolny'),
    data:      tmplRow('Data i czas',  `${appt.date} ${appt.time}`),
    cena:      tmplRow('Cena',         `${appt.price || 0} zł`),
  };
  return `<table style="width:100%;border-collapse:collapse;">
    ${fields.map(f => rows[f] || '').join('')}
  </table>`;
}

function emailOwner(appt) {
  return `<!DOCTYPE html><html lang="pl"><body style="margin:0;background:#f4f4f5;padding:2rem;font-family:sans-serif;">
  <div style="max-width:460px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    ${tmplHeader()}
    <div style="padding:1.75rem 2rem;">
      <h2 style="margin:0 0 .25rem;font-size:1.125rem;color:#09090b;">Nowa rezerwacja</h2>
      <p style="margin:0 0 1.5rem;color:#71717a;font-size:.875rem;">Klient zarezerwował wizytę w Twoim salonie.</p>
      <div style="background:#f4f4f5;border-radius:8px;padding:1rem 1.25rem;">
        ${tmplTable(appt, ['klient','usluga','pracownik','data','cena'])}
      </div>
      <p style="margin:1.5rem 0 0;font-size:.8rem;color:#a1a1aa;">Zarządzaj wizytami w panelu Lumina.</p>
    </div>
  </div>
</body></html>`;
}

function emailClientNew(appt) {
  return `<!DOCTYPE html><html lang="pl"><body style="margin:0;background:#f4f4f5;padding:2rem;font-family:sans-serif;">
  <div style="max-width:460px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    ${tmplHeader()}
    <div style="padding:1.75rem 2rem;">
      <h2 style="margin:0 0 .25rem;font-size:1.125rem;color:#09090b;">Rezerwacja złożona</h2>
      <p style="margin:0 0 1.5rem;color:#71717a;font-size:.875rem;">Twoja rezerwacja oczekuje na potwierdzenie przez salon.</p>
      <div style="background:#f4f4f5;border-radius:8px;padding:1rem 1.25rem;">
        ${tmplTable(appt, ['salon','usluga','pracownik','data','cena'])}
      </div>
      <p style="margin:1.5rem 0 0;font-size:.8rem;color:#a1a1aa;">Otrzymasz email gdy salon potwierdzi wizytę.</p>
    </div>
  </div>
</body></html>`;
}

function emailClientStatus(appt, title) {
  const isOk = ['potwierdzona','confirmed'].includes(appt.status);
  const accent = isOk ? '#22c55e' : '#f43f5e';
  return `<!DOCTYPE html><html lang="pl"><body style="margin:0;background:#f4f4f5;padding:2rem;font-family:sans-serif;">
  <div style="max-width:460px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    ${tmplHeader()}
    <div style="padding:1.75rem 2rem;">
      <h2 style="margin:0 0 1.5rem;font-size:1.125rem;color:${accent};">${title}</h2>
      <div style="background:#f4f4f5;border-radius:8px;padding:1rem 1.25rem;">
        ${tmplTable(appt, ['salon','usluga','data'])}
      </div>
    </div>
  </div>
</body></html>`;
}

function emailClaimAdmin(claim) {
  return `<!DOCTYPE html><html lang="pl"><body style="margin:0;background:#f4f4f5;padding:2rem;font-family:sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    ${tmplHeader()}
    <div style="padding:1.75rem 2rem;">
      <h2 style="margin:0 0 .25rem;font-size:1.125rem;color:#09090b;">Nowe zgłoszenie salonu</h2>
      <p style="margin:0 0 1.5rem;color:#71717a;font-size:.875rem;">Ktoś zgłosił roszczenie do profilu salonu w Luminie.</p>
      <div style="background:#f4f4f5;border-radius:8px;padding:1rem 1.25rem;">
        <table style="width:100%;border-collapse:collapse;">
          ${tmplRow('Salon', claim.businessName)}
          ${tmplRow('Zgłaszający', claim.userName)}
          ${tmplRow('Email', claim.userEmail)}
          ${tmplRow('Telefon', claim.userPhone)}
          ${tmplRow('NIP', claim.nip)}
          ${tmplRow('Status', claim.statusLabel || claim.status)}
          ${tmplRow('Ryzyko', claim.riskLevel || '—')}
        </table>
      </div>
      <p style="margin:1.5rem 0 0;font-size:.8rem;color:#a1a1aa;">Sprawdź kolekcję claims w Firestore i zweryfikuj dowody własności.</p>
    </div>
  </div>
</body></html>`;
}

// ─── NOTIF SETTINGS HELPER ──────────────────────────────────────────────────

const NOTIF_DEFAULTS = {
  emailOwnerNew: true, emailClientNew: true, emailClientStatus: true,
  inAppOwner: true, inAppClient: true,
};

async function getNotifSettings(db, bizId) {
  try {
    const snap = await db.doc(`businesses/${bizId}`).get();
    return { ...NOTIF_DEFAULTS, ...(snap.data()?.notifSettings || {}) };
  } catch {
    return NOTIF_DEFAULTS;
  }
}

// ─── FUNCTION 1: nowa wizyta ────────────────────────────────────────────────

exports.onAppointmentCreated = onDocumentCreated(
  { document: 'appointments/{id}', secrets: [SMTP_USER, SMTP_PASS] },
  async (event) => {
    const appt = event.data.data();
    const db   = admin.firestore();

    // Tylko wizyty złożone przez klienta (mają userId)
    if (!appt.userId) return;

    const ns = await getNotifSettings(db, appt.businessId);

    const transport = makeTransport(SMTP_USER.value(), SMTP_PASS.value());
    const from = `Lumina <${SMTP_USER.value()}>`;

    const tasks = [];

    if (ns.emailOwnerNew || ns.emailClientNew) {
      const [ownerEmail, clientEmail] = await Promise.all([
        ns.emailOwnerNew  ? getEmail(appt.businessId) : null,
        ns.emailClientNew ? getEmail(appt.userId)     : null,
      ]);
      if (ownerEmail)  tasks.push(sendMail(transport, { from, to: ownerEmail,  subject: `Nowa rezerwacja — ${appt.clientName || 'Klient'}`,         html: emailOwner(appt) }));
      if (clientEmail) tasks.push(sendMail(transport, { from, to: clientEmail, subject: `Rezerwacja złożona — ${appt.businessName || 'Salon'}`,      html: emailClientNew(appt) }));
    }

    if (ns.inAppOwner) tasks.push(db.collection('notifications').add({
      userId: appt.businessId, type: 'booking', title: 'Nowa rezerwacja',
      message: `${appt.clientName || 'Klient'} • ${appt.serviceName || ''} • ${appt.date} ${appt.time}`,
      read: false, appointmentId: event.data.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }));

    if (ns.inAppClient) tasks.push(db.collection('notifications').add({
      userId: appt.userId, type: 'booking', title: 'Rezerwacja złożona',
      message: `${appt.serviceName || ''} w ${appt.businessName || 'salonie'} • ${appt.date} ${appt.time}`,
      read: false, appointmentId: event.data.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }));

    await Promise.all(tasks);
  }
);

// ─── FUNCTION 2: zmiana statusu ─────────────────────────────────────────────

exports.onAppointmentStatusChanged = onDocumentUpdated(
  { document: 'appointments/{id}', secrets: [SMTP_USER, SMTP_PASS] },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();
    if (before.status === after.status) return;

    const db    = admin.firestore();
    const title = STATUS_PL[after.status];
    if (!title) return;

    const ns = await getNotifSettings(db, after.businessId);
    const writes = [];

    // In-app dla klienta
    if (ns.inAppClient && after.userId) {
      writes.push(db.collection('notifications').add({
        userId:        after.userId,
        type:          'booking',
        title,
        message:       `${after.serviceName || ''} • ${after.date} ${after.time}`,
        read:          false,
        appointmentId: event.data.after.id,
        createdAt:     admin.firestore.FieldValue.serverTimestamp(),
      }));
    }

    // Email do klienta przy potwierdzeniu / anulowaniu
    const notifyStatuses = ['potwierdzona','confirmed','cancelled','anulowana'];
    if (ns.emailClientStatus && after.userId && notifyStatuses.includes(after.status)) {
      writes.push(
        getEmail(after.userId).then(email => {
          if (!email) return;
          const transport = makeTransport(SMTP_USER.value(), SMTP_PASS.value());
          return sendMail(transport, {
            from: `Lumina <${SMTP_USER.value()}>`,
            to: email,
            subject: `${title} — ${after.businessName || 'Salon'}`,
            html: emailClientStatus(after, title),
          });
        })
      );
    }

    await Promise.all(writes);
  }
);

// ─── FUNCTION 3: nowe zgłoszenie salonu ─────────────────────────────────────

exports.onClaimCreated = onDocumentCreated(
  { document: 'claims/{id}', secrets: [SMTP_USER, SMTP_PASS] },
  async (event) => {
    const claim = event.data.data();
    const db = admin.firestore();
    const writes = [];

    if (claim.userId) {
      writes.push(db.collection('notifications').add({
        userId: claim.userId,
        type: 'system',
        title: 'Zgłoszenie salonu przyjęte',
        message: `${claim.businessName || 'Salon'} • ${claim.statusLabel || 'oczekuje na weryfikację'}`,
        read: false,
        claimId: event.data.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }));
    }

    try {
      const transport = makeTransport(SMTP_USER.value(), SMTP_PASS.value());
      writes.push(sendMail(transport, {
        from: `Lumina <${SMTP_USER.value()}>`,
        to: SMTP_USER.value(),
        subject: `Nowe zgłoszenie salonu — ${claim.businessName || 'Lumina'}`,
        html: emailClaimAdmin({ ...claim, id: event.data.id }),
      }));
    } catch (e) {
      console.error('claim email setup error:', e.message);
    }

    await Promise.all(writes);
  }
);
