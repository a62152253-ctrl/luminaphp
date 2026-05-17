import { auth, db, storage, doc, updateDoc, updateProfile, storageRef, uploadBytes, getDownloadURL } from '../firebase-config.js';
import { toast } from './utils.js';

let _pendingFile = null;

export function openProfileModal() {
  const user = window.App?.user;
  if (!user) return;

  const preview   = document.getElementById('profileAvatarPreview');
  const nickInput = document.getElementById('profileNickInput');
  if (preview)   preview.src    = user.photoURL || 'https://i.pravatar.cc/200';
  if (nickInput) nickInput.value = user.displayName || '';
  _pendingFile = null;

  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
}

export function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => modal.classList.add('hidden'), 200);
  document.body.style.overflow = '';
  _pendingFile = null;
}

export function onProfilePhotoChange(input) {
  const file = input.files[0];
  if (!file) return;
  _pendingFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('profileAvatarPreview');
    if (preview) preview.src = e.target.result;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

export async function saveProfile() {
  const user = window.App?.user;
  if (!user) return;

  const nickInput = document.getElementById('profileNickInput');
  const saveBtn   = document.getElementById('profileSaveBtn');
  const nick = nickInput?.value.trim();

  if (!nick) { toast('Pseudonim nie może być pusty', 'error'); return; }
  if (nick.length > 40) { toast('Pseudonim może mieć maksymalnie 40 znaków', 'error'); return; }

  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<span class="material-icons" style="font-size:1rem;animation:spin .8s linear infinite">sync</span> Zapisuję…'; }

  try {
    let photoURL = user.photoURL || '';

    if (_pendingFile) {
      try {
        const sRef = storageRef(storage, `avatars/${user.uid}`);
        await uploadBytes(sRef, _pendingFile);
        photoURL = await getDownloadURL(sRef);
      } catch (storageErr) {
        toast('Nie udało się wgrać zdjęcia — profil zostanie zapisany bez zmiany avatara. Sprawdź połączenie z internetem.', 'error');
        _pendingFile = null;
      }
    }

    await updateProfile(auth.currentUser, { displayName: nick, photoURL: photoURL || null });
    await updateDoc(doc(db, 'users', user.uid), { displayName: nick, photoURL });

    const els = {
      userAvatar:    document.getElementById('userAvatar'),
      userName:      document.getElementById('userName'),
      sidebarAvatar: document.getElementById('sidebarAvatar'),
      sidebarName:   document.getElementById('sidebarName'),
    };
    if (els.userAvatar)    els.userAvatar.src          = photoURL || '';
    if (els.userName)      els.userName.textContent    = nick;
    if (els.sidebarAvatar) els.sidebarAvatar.src        = photoURL || '';
    if (els.sidebarName)   els.sidebarName.textContent  = nick;

    window.App.user = auth.currentUser;

    toast('Profil zaktualizowany!', 'success');
    closeProfileModal();
  } catch (e) {
    toast('Błąd zapisu profilu: ' + e.message, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<span class="material-icons" style="font-size:1rem">save</span> Zapisz'; }
  }
}
