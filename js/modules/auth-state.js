import { auth, db, googleProvider,
         signInWithPopup, signOut, onAuthStateChanged,
         signInWithEmailAndPassword, createUserWithEmailAndPassword,
         sendPasswordResetEmail, updateProfile,
         EmailAuthProvider, linkWithCredential,
         doc, getDoc, setDoc, serverTimestamp }
  from '../firebase-config.js';
import { toast } from './utils.js';
import { BUSINESS_CATEGORIES, buildBusinessSlug, buildSearchKeywords, cleanText } from './business-profile.js';

const AUTH_ERROR_MAP = {
  'auth/wrong-password':       'Nieprawidłowe hasło.',
  'auth/user-not-found':       'Nie znaleziono użytkownika z tym e-mailem.',
  'auth/email-already-in-use': 'Ten e-mail jest już zarejestrowany.',
  'auth/weak-password':        'Hasło musi mieć co najmniej 6 znaków.',
  'auth/invalid-email':        'Nieprawidłowy adres e-mail.',
  'auth/too-many-requests':    'Zbyt wiele prób. Odczekaj chwilę.',
  'auth/popup-closed-by-user': 'Logowanie anulowane.',
  'auth/network-request-failed': 'Błąd sieci. Sprawdź połączenie.',
};

export function authErrorMessage(error) {
  return AUTH_ERROR_MAP[error?.code] || error?.message || 'Nieznany błąd. Spróbuj ponownie.';
}

// ===== LOGIN =====
export async function login() {
  await signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ===== REGISTER =====
export async function registerClient(name, email, password, phone = '') {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const data = { role: 'client', displayName: name, email, createdAt: serverTimestamp() };
  if (phone) data.phone = phone;
  await setDoc(doc(db, 'users', cred.user.uid), data);
  return cred.user;
}

export async function registerClientWithPhone(name, email, password, phoneUser) {
  if (!phoneUser) throw new Error('Brak zweryfikowanego numeru telefonu.');
  const emailCred = EmailAuthProvider.credential(email, password);
  await linkWithCredential(phoneUser, emailCred);
  await updateProfile(phoneUser, { displayName: name });
  await setDoc(doc(db, 'users', phoneUser.uid), {
    role:          'client',
    displayName:   name,
    email,
    phone:         phoneUser.phoneNumber || '',
    phoneVerified: true,
    createdAt:     serverTimestamp(),
  });
  return phoneUser;
}

export async function registerBusiness({ ownerName, bizName, category, city, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const safeOwnerName = cleanText(ownerName, 90);
  const safeBizName = cleanText(bizName, 80);
  const safeCategory = BUSINESS_CATEGORIES.includes(category) ? category : 'Inne';
  const safeCity = cleanText(city, 64);

  await updateProfile(cred.user, { displayName: safeOwnerName });
  const uid = cred.user.uid;
  await setDoc(doc(db, 'users', uid), {
    role: 'business',
    displayName: safeOwnerName,
    email,
    businessId: uid,
    businessOnboardingStatus: 'draft',
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'businesses', uid), {
    name: safeBizName,
    category: safeCategory,
    city: safeCity,
    address: safeCity,
    ownerId: uid,
    ownerEmail: email,
    rating: 0,
    photoURL: '',
    description: '',
    profileComplete: false,
    isPublished: false,
    verificationStatus: 'unverified',
    onboardingStatus: 'draft',
    profileQualityScore: 15,
    slug: buildBusinessSlug(safeBizName, safeCity),
    searchKeywords: buildSearchKeywords(safeBizName, safeCategory, safeCity),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return cred.user;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ===== LOGOUT =====
export async function logout() {
  try {
    await signOut(auth);
  } catch(_) {}
  toast('Wylogowano pomyślnie');
  if (window.App) {
    window.App.user          = null;
    window.App.userDoc       = null;
    window.App.role          = null;
    window.App.notifications = [];
    window.App.favorites     = [];
  }
  const page = new URLSearchParams(location.search).get('page') || 'home';
  const protected_ = ['admin','dashboard','setup','services','employees','gallery'];
  if (protected_.includes(page)) {
    setTimeout(() => { window.location.href = '/luminaphp/'; }, 900);
  }
}

export function isProtectedPage(page) {
  return ['admin','dashboard','setup','services','employees','gallery'].includes(page);
}

export function getRedirectAfterLogin(role, bizProfileComplete) {
  if (role === 'business') return bizProfileComplete ? '/luminaphp/?page=admin' : '/luminaphp/?page=setup';
  if (role === 'client')   return '/luminaphp/?page=dashboard';
  return '/luminaphp/';
}

// ===== USER DOC (role + profile) =====
export async function loadUserDoc(uid, user = null) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return { uid, ...snap.data() };
    if (window._authBusy) return { uid, role: null };
    const defaults = {
      role: 'client',
      displayName: user?.displayName || '',
      email: user?.email || '',
      createdAt: serverTimestamp(),
    };
    if (user) await setDoc(doc(db, 'users', uid), defaults);
    return { uid, ...defaults };
  } catch(e) {
    return { uid, role: null };
  }
}

// ===== AUTH LISTENER =====
export function listenAuth(callback) {
  onAuthStateChanged(auth, callback);
}

// ===== HEADER =====
export function renderHeader(user) {
  const loginBtn    = document.getElementById('loginBtn');
  const userSection = document.getElementById('userSection');
  if (!loginBtn || !userSection) return;

  const role = window.App?.role ?? null;

  if (user) {
    loginBtn.classList.add('hidden');
    userSection.classList.remove('hidden');
    userSection.style.display = 'flex';
    updateHeaderUser(user);
    updateHeaderNav(role);
  } else {
    loginBtn.classList.remove('hidden');
    userSection.classList.add('hidden');
    userSection.style.display = '';
    document.querySelectorAll('.nav-dashboard, [data-role]').forEach(el => el.classList.add('hidden'));
  }
}

function setAvatarFallback(img, name) {
  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name||'U')}&background=6366f1&color=fff`;
  img.onerror = null;
}

function updateHeaderUser(user) {
  const avatar = document.getElementById('userAvatar');
  const name   = document.getElementById('userName');
  if (avatar) {
    avatar.src = user.photoURL || '';
    avatar.onerror = () => setAvatarFallback(avatar, user.displayName);
  }
  if (name) name.textContent = user.displayName || user.email;
}

function updateHeaderNav(role) {
  const headerUserLink = document.getElementById('headerUserLink');
  if (role === null) {
    if (headerUserLink) headerUserLink.href = '#';
    document.querySelectorAll('[data-role], .nav-dashboard').forEach(el => el.classList.add('hidden'));
    return;
  }
  if (headerUserLink) {
    headerUserLink.href = role === 'business' ? '/luminaphp/?page=admin' : '/luminaphp/?page=dashboard';
  }
  document.querySelectorAll('.nav-dashboard').forEach(el => {
    el.classList.toggle('hidden', el.dataset.role !== 'client');
  });
  document.querySelectorAll('[data-role="business"]').forEach(el => {
    el.classList.toggle('hidden', role !== 'business');
  });
  document.querySelectorAll('[data-role="client"]').forEach(el => {
    el.classList.toggle('hidden', role !== 'client');
  });
}

export function renderSidebar(user) {
  if (!user) return;
  const sa = document.getElementById('sidebarAvatar');
  const sn = document.getElementById('sidebarName');
  if (sa) {
    sa.src = user.photoURL || '';
    sa.onerror = () => setAvatarFallback(sa, user.displayName);
  }
  if (sn) sn.textContent = user.displayName || user.email;
}
