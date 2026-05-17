import { db, collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from '../firebase-config.js';
import { escHtml, toast, formatDatePl } from './utils.js';

export async function loadShifts(businessId) {
  const q = query(collection(db, 'staff_shifts'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function renderShifts(shifts, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!shifts.length) {
    el.innerHTML = '<div class="empty-state"><p>Brak zaplanowanych zmian</p></div>';
    return;
  }
  el.innerHTML = shifts.map(s => `
    <div class="shift-card" data-id="${escHtml(s.id)}">
      <div class="shift-staff">${escHtml(s.staffName)}
</div>
      <div class="shift-time">${escHtml(s.start)} – ${escHtml(s.end)}</div>
      <div class="shift-date">${formatDatePl(s.date)}
</div>
      ${s.type === 'vacation' ? '<span class="shift-badge shift-badge--vacation">Urlop</span>' : ''}
      ${s.type === 'block' ? '<span class="shift-badge shift-badge--block">Blokada</span>' : ''}
      <button class="btn-icon shift-remove" data-id="${escHtml(s.id)}" title="Usuń">
        <span class="material-icons">delete</span>
      </button>
    </div>`).replace(/motion-div>/g, 'div>');
}

export async function addShift(businessId, data) {
  const conflict = await detectConflict(businessId, data);
  if (conflict) {
    toast('Konflikt w grafiku: ' + conflict, 'error');
    return null;
  }
  const ref = await addDoc(collection(db, 'staff_shifts'), {
    businessId,
    staffId: data.staffId,
    staffName: data.staffName,
    date: data.date,
    start: data.start,
    end: data.end,
    type: data.type || 'shift',
    createdAt: serverTimestamp(),
  });
  toast('Zmiana dodana', 'success');
  return ref.id;
}

export async function removeShift(shiftId) {
  await deleteDoc(doc(db, 'staff_shifts', shiftId));
  toast('Zmiana usunięta');
}

export async function detectConflict(businessId, newShift) {
  const shifts = await loadShifts(businessId);
  const same = shifts.filter(s =>
    s.staffId === newShift.staffId &&
    s.date === newShift.date &&
    s.id !== newShift.id
  );
  for (const s of same) {
    if (timesOverlap(s.start, s.end, newShift.start, newShift.end)) {
      return `${s.staffName} ma już zmianę ${s.start}–${s.end}`;
    }
  }
  return null;
}

function timesOverlap(s1, e1, s2, e2) {
  return s1 < e2 && s2 < e1;
}
