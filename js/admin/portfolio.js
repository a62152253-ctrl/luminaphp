// admin/portfolio.js — Portfolio (zdjęcia wykonanych usług)
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp }
  from '../firebase-config.js';
import { toast } from '../modules/utils.js';

const CATEGORIES = ['Wszystkie','Fryzury','Paznokcie','Brwi i Rzęsy','Makijaż','Masaż','Kosmetologia','Inne'];

let _bizId, _photos = [], _activeCategory = 'Wszystkie';

export async function initPortfolio(bizId) {
  _bizId = bizId;
  await loadPhotos();
  renderPortfolio();
  window.portfolioAdd      = addPhoto;
  window.portfolioDelete   = deletePhoto;
  window.portfolioSetCat   = setCategory;
}

async function loadPhotos() {
  try {
    const q = query(collection(db, 'portfolio'), where('businessId', '==', _bizId));
    const snap = await getDocs(q);
    _photos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  } catch(e) { _photos = []; }
}

function renderPortfolio() {
  const el = document.getElementById('portfolioContent');
  if (!el) return;

  const filtered = _activeCategory === 'Wszystkie'
    ? _photos
    : _photos.filter(p => p.category === _activeCategory);

  el.innerHTML = `
    <!-- Category filter -->
    <div class="portfolio-cats">
      ${CATEGORIES.map(c => `
        <button class="portfolio-cat-btn ${c === _activeCategory ? 'active' : ''}"
          onclick="portfolioSetCat('${c}')">${c}</button>`).join('')}
    </div>

    <!-- Add photo form -->
    <div class="portfolio-add-form">
      <input type="url" id="portfolioUrl" class="settings-input" placeholder="URL zdjęcia (https://...)">
      <input type="text" id="portfolioCaption" class="settings-input" placeholder="Opis (opcjonalnie)">
      <select id="portfolioCategory" class="settings-input">
        ${CATEGORIES.filter(c => c !== 'Wszystkie').map(c => `<option>${c}</option>`).join('')}
      </select>
      <button class="btn btn-accent" onclick="portfolioAdd()">
        <span class="material-icons">add_photo_alternate</span> Dodaj
      </button>
    </div>

    <!-- Photos grid -->
    ${!filtered.length
      ? `<div class="biz-empty"><span class="material-icons">photo_library</span>
          <p>Brak zdjęć${_activeCategory !== 'Wszystkie' ? ' w tej kategorii' : ''}.</p></div>`
      : `<div class="portfolio-grid">
          ${filtered.map(p => `
            <div class="portfolio-item">
              <img src="${esc(p.url)}" alt="${esc(p.caption||'')}" class="portfolio-img"
                onerror="this.style.display='none'">
              <div class="portfolio-item-overlay">
                <div class="portfolio-item-caption">${esc(p.caption||'')}</div>
                <div class="portfolio-item-cat">${esc(p.category||'')}</div>
              </div>
              <button class="portfolio-delete-btn" onclick="portfolioDelete('${p.id}')">
                <span class="material-icons">delete</span>
              </button>
            </div>`).join('')}
        </div>`}`;
}

async function addPhoto() {
  const url     = document.getElementById('portfolioUrl')?.value.trim();
  const caption = document.getElementById('portfolioCaption')?.value.trim();
  const category= document.getElementById('portfolioCategory')?.value || 'Inne';

  if (!url) { toast('Podaj URL zdjęcia', 'error'); return; }

  try {
    const data = { businessId: _bizId, url, caption, category, createdAt: serverTimestamp() };
    const ref  = await addDoc(collection(db, 'portfolio'), data);
    _photos.unshift({ id: ref.id, ...data });
    document.getElementById('portfolioUrl').value     = '';
    document.getElementById('portfolioCaption').value = '';
    renderPortfolio();
    toast('Zdjęcie dodane');
  } catch(e) { toast('Błąd dodawania', 'error'); }
}

async function deletePhoto(id) {
  if (!confirm('Usunąć zdjęcie?')) return;
  try {
    await deleteDoc(doc(db, 'portfolio', id));
    _photos = _photos.filter(p => p.id !== id);
    renderPortfolio();
    toast('Zdjęcie usunięte');
  } catch(e) { toast('Błąd', 'error'); }
}

function setCategory(cat) {
  _activeCategory = cat;
  renderPortfolio();
}

const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/'/g, "\\'");
