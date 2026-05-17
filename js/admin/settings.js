// admin/settings.js — Ustawienia salonu
import { db, doc, updateDoc, serverTimestamp } from '../firebase-config.js';
import { toast } from '../modules/utils.js';
import {
  BUSINESS_CATEGORIES,
  buildBusinessSlug,
  buildSearchKeywords,
  cleanText,
  isValidPhone,
  normalizeHours,
  normalizePhone,
  normalizeUrl,
} from '../modules/business-profile.js';

const DAYS_PL = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];
const DEFAULT_HOURS = { open: '09:00', close: '18:00', closed: false };

let _bizId, _bizDoc;

export function initSettings(bizId, bizDoc) {
  _bizId  = bizId;
  _bizDoc = bizDoc;
  fillForm();
  renderHoursGrid();
  window.bizSaveSettings = saveSettings;
}

const NOTIF_DEFAULTS = {
  emailOwnerNew:    true,
  emailClientNew:   true,
  emailClientStatus: true,
  inAppOwner:       true,
  inAppClient:      true,
};

function fillForm() {
  _set('bizSettingName',     _bizDoc?.name     || '');
  _set('bizSettingCity',     _bizDoc?.city     || '');
  _set('bizSettingAddress',  _bizDoc?.address  || '');
  _set('bizSettingDesc',     _bizDoc?.description || '');
  _set('bizSettingPhone',    _bizDoc?.phone    || '');
  _set('bizSettingWebsite',  _bizDoc?.website  || '');

  const catEl = document.getElementById('bizSettingCategory');
  if (catEl && _bizDoc?.category) {
    for (const opt of catEl.options) {
      if (opt.value === _bizDoc.category || opt.text === _bizDoc.category) {
        opt.selected = true; break;
      }
    }
  }

  const ns = { ...NOTIF_DEFAULTS, ...(_bizDoc?.notifSettings || {}) };
  _chk('notifEmailOwner',       ns.emailOwnerNew);
  _chk('notifEmailClientNew',   ns.emailClientNew);
  _chk('notifEmailClientStatus',ns.emailClientStatus);
  _chk('notifInAppOwner',       ns.inAppOwner);
  _chk('notifInAppClient',      ns.inAppClient);
}

function renderHoursGrid() {
  const el = document.getElementById('bizHoursGrid');
  if (!el) return;
  const hours = _bizDoc?.hours || {};

  el.innerHTML = DAYS_PL.map((day, i) => {
    const h = hours[i] || DEFAULT_HOURS;
    return `<div class="biz-hours-row">
      <label class="biz-hours-day">${day}</label>
      <label class="biz-hours-closed-lbl">
        <input type="checkbox" id="hClosed_${i}" ${h.closed ? 'checked' : ''}
          onchange="document.getElementById('hTimes_${i}').style.opacity=this.checked?'.3':'1'">
        Zamknięte
      </label>
      <div class="biz-hours-times" id="hTimes_${i}" style="opacity:${h.closed?'.3':'1'}">
        <input type="time" id="hOpen_${i}"  class="settings-input biz-hours-time" value="${h.open  || '09:00'}">
        <span>–</span>
        <input type="time" id="hClose_${i}" class="settings-input biz-hours-time" value="${h.close || '18:00'}">
      </div>
    </div>`;
  }).join('');
}

async function saveSettings() {
  const name     = cleanText(document.getElementById('bizSettingName')?.value, 80);
  const city     = cleanText(document.getElementById('bizSettingCity')?.value, 64);
  const address  = cleanText(document.getElementById('bizSettingAddress')?.value, 120);
  const desc     = cleanText(document.getElementById('bizSettingDesc')?.value, 700);
  const phone    = normalizePhone(document.getElementById('bizSettingPhone')?.value);
  const websiteRaw = document.getElementById('bizSettingWebsite')?.value.trim() || '';
  const website  = normalizeUrl(websiteRaw);
  const category = document.getElementById('bizSettingCategory')?.value       || '';

  if (!name) { toast('Podaj nazwę salonu', 'error'); return; }
  if (!BUSINESS_CATEGORIES.includes(category)) { toast('Wybierz prawidłową branżę', 'error'); return; }
  if (!city) { toast('Podaj miasto salonu', 'error'); return; }
  if (!address || !/\d/.test(address)) { toast('Podaj pełny adres z numerem budynku', 'error'); return; }
  if (phone && !isValidPhone(phone)) { toast('Podaj prawidłowy numer telefonu', 'error'); return; }
  if (websiteRaw && !website) { toast('Podaj prawidłowy adres strony www', 'error'); return; }

  const { hours, errors } = normalizeHours((i) => ({
    closed: document.getElementById(`hClosed_${i}`)?.checked || false,
    open: document.getElementById(`hOpen_${i}`)?.value || '09:00',
    close: document.getElementById(`hClose_${i}`)?.value || '18:00',
  }));
  if (errors.length) {
    toast(errors[0], 'error');
    return;
  }

  const notifSettings = {
    emailOwnerNew:     _chkVal('notifEmailOwner'),
    emailClientNew:    _chkVal('notifEmailClientNew'),
    emailClientStatus: _chkVal('notifEmailClientStatus'),
    inAppOwner:        _chkVal('notifInAppOwner'),
    inAppClient:       _chkVal('notifInAppClient'),
  };

  const data = {
    name,
    city,
    address,
    description: desc,
    phone,
    website,
    category,
    hours,
    notifSettings,
    slug: buildBusinessSlug(name, city),
    searchKeywords: buildSearchKeywords(name, category, city, address),
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'businesses', _bizId), data);
    Object.assign(_bizDoc, data);
    // Update sidebar name
    const nameEl = document.getElementById('adminBizName');
    if (nameEl) nameEl.textContent = name;
    toast('Ustawienia zapisane');
  } catch(e) { toast('Błąd zapisu: ' + e.message, 'error'); }
}

function _set(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = val;
}
function _chk(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}
function _chkVal(id) {
  return document.getElementById(id)?.checked ?? true;
}
