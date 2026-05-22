import { login, loginWithEmail, registerClient, registerBusiness, loadUserDoc }
  from '../modules/auth-state.js';
import { db, doc, getDoc } from '../firebase-config.js';

// ===== UI HELPERS =====
function showError(msg) {
  if (!msg) return;
  const el = document.getElementById('authError');
  if (!el) return;
  el.classList.remove('success');
  const icon = el.querySelector('.auth-error-icon');
  if (icon) icon.textContent = 'error';
  document.getElementById('authErrorMsg').textContent = msg;
  el.classList.add('show');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideError() {
  document.getElementById('authError')?.classList.remove('show');
}
function setLoading(btnId, loading, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.origText = btn.textContent;
    btn.textContent = 'Ładowanie…';
  } else {
    btn.textContent = btn.dataset.origText || label || btn.textContent;
  }
}

// ===== REDIRECT AFTER AUTH =====
async function redirectAfterAuth(user) {
  try {
    const userDoc = await loadUserDoc(user.uid, user);
    window.App         = window.App || {};
    window.App.userDoc = userDoc;
    window.App.role    = userDoc.role;

    if (userDoc.role === 'business') {
      window.location.href = await bizRedirectUrl(userDoc.businessId || user.uid);
    } else if (userDoc.role === 'client') {
      window.location.href = '/luminaphp/?page=dashboard';
    } else {
      window._authBusy = false;
      setLoading('btnLogin', false, 'Zaloguj');
      setLoading('btnRegister', false, 'Utwórz konto');
    }
  } catch(e) {
    window._authBusy = false;
    setLoading('btnLogin', false, 'Zaloguj');
    setLoading('btnRegister', false, 'Utwórz konto');
  }
}

async function bizRedirectUrl(bizId) {
  try {
    const snap = await getDoc(doc(db, 'businesses', bizId));
    return snap.exists() && snap.data().profileComplete
      ? '/luminaphp/?page=admin'
      : '/luminaphp/?page=setup';
  } catch(e) {
    return '/luminaphp/?page=setup';
  }
}

// ===== EMAIL LOGIN =====
window.authLogin = async () => {
  hideError();
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if (!email)    { showError('Wpisz adres e-mail.');  return; }
  if (!password) { showError('Wpisz hasło.');          return; }

  window._authBusy = true;
  setLoading('btnLogin', true);
  try {
    const cred = await loginWithEmail(email, password);
    await redirectAfterAuth(cred.user);
  } catch(e) {
    window._authBusy = false;
    showError(firebaseErrorPl(e.code, e.message));
    setLoading('btnLogin', false);
  }
};

// ===== GOOGLE LOGIN =====
window.authGoogle = async () => {
  hideError();
  const btn = document.querySelector('.auth-panel.active .auth-google');
  if (btn) { btn.disabled = true; btn.textContent = 'Otwieranie okna…'; }
  try {
    await login();
  } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      showError(firebaseErrorPl(e.code, e.message));
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg class="auth-google-logo" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg> Kontynuuj z Google`;
    }
  }
};

function validateRegisterBase(name, email, password) {
  if (!name)                    return 'Podaj imię i nazwisko.';
  if (!email)                   return 'Podaj adres e-mail.';
  if (!password)                return 'Podaj hasło.';
  if (password.length < 8)      return 'Hasło musi mieć min. 8 znaków.';
  if (!/[0-9]/.test(password))  return 'Hasło musi zawierać co najmniej jedną cyfrę.';
  return null;
}

// ===== REGISTER =====
window.authRegister = async () => {
  hideError();
  const name     = document.getElementById('regName')?.value.trim();
  const email    = document.getElementById('regEmail')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const isBiz    = document.getElementById('roleBusiness')?.classList.contains('active');

  const baseErr = validateRegisterBase(name, email, password);
  if (baseErr) { showError(baseErr); return; }

  if (isBiz) {
    const bizName  = document.getElementById('regBizName')?.value.trim();
    const category = document.getElementById('regBizCategory')?.value;
    const city     = document.getElementById('regBizCity')?.value.trim();
    if (!bizName)  { showError('Podaj nazwę salonu.');  return; }
    if (!category) { showError('Wybierz branżę.');      return; }
    if (!city)     { showError('Podaj miasto salonu.'); return; }

    window._authBusy = true;
    setLoading('btnRegister', true);
    try {
      const user = await registerBusiness({ ownerName: name, bizName, category, city, email, password });
      window._authBusy = false;
      await redirectAfterAuth(user);
    } catch(e) {
      window._authBusy = false;
      showError(firebaseErrorPl(e.code, e.message));
      setLoading('btnRegister', false);
    }
    return;
  }

  window._authBusy = true;
  setLoading('btnRegister', true);
  try {
    const user = await registerClient(name, email, password);
    window._authBusy = false;
    await redirectAfterAuth(user);
  } catch(e) {
    window._authBusy = false;
    showError(firebaseErrorPl(e.code, e.message));
    setLoading('btnRegister', false);
  }
};

// ===== FORGOT PASSWORD =====
window.authForgot = async (e) => {
  e?.preventDefault();
  hideError();
  const email = document.getElementById('loginEmail')?.value.trim();
  if (!email) { showError('Wpisz adres e-mail, aby zresetować hasło.'); return; }
  try {
    const { resetPassword } = await import('../modules/auth-state.js');
    await resetPassword(email);
    showResetSuccess(email);
  } catch(err) {
    showError(firebaseErrorPl(err.code, err.message));
  }
};

function showResetSuccess(email) {
  const el = document.getElementById('authError');
  if (!el) return;
  const icon = el.querySelector('.auth-error-icon');
  if (icon) icon.textContent = 'check_circle';
  document.getElementById('authErrorMsg').textContent =
    `Link do resetu hasła wysłany na ${email}. Sprawdź skrzynkę.`;
  el.classList.add('show', 'success');
}

// ===== PASSWORD TOGGLE =====
window.authTogglePassword = (inputId, btn) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('.material-icons');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.textContent = 'visibility_off';
  } else {
    input.type = 'password';
    if (icon) icon.textContent = 'visibility';
  }
};

// ===== PASSWORD STRENGTH =====
function updatePasswordStrength(pw) {
  const bars = document.querySelectorAll('#pwStrength .pw-bar');
  if (!bars.length) return;
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  score = Math.min(score, 3);
  const cls = score >= 3 ? 'strong' : score >= 2 ? 'medium' : pw.length ? 'weak' : '';
  bars.forEach((bar, i) => {
    bar.className = 'pw-bar';
    if (cls && i < score) bar.classList.add(cls);
  });
}

// ===== FIREBASE ERROR CODES =====
function firebaseErrorPl(code, fallbackMsg = '') {
  const map = {
    'auth/invalid-credential':        'Nieprawidłowy e-mail lub hasło.',
    'auth/invalid-login-credentials': 'Nieprawidłowy e-mail lub hasło.',
    'auth/wrong-password':            'Nieprawidłowe hasło.',
    'auth/user-not-found':            'Nie znaleziono konta z tym adresem e-mail.',
    'auth/email-already-in-use':      'Ten adres e-mail jest już zajęty.',
    'auth/invalid-email':             'Nieprawidłowy format adresu e-mail.',
    'auth/weak-password':             'Hasło jest za słabe (min. 8 znaków + cyfra).',
    'auth/missing-password':          'Wpisz hasło.',
    'auth/missing-email':             'Wpisz adres e-mail.',
    'auth/too-many-requests':         'Zbyt wiele prób logowania. Odczekaj chwilę.',
    'auth/network-request-failed':    'Błąd sieci. Sprawdź połączenie z internetem.',
    'auth/popup-blocked':             'Przeglądarka zablokowała popup. Zezwól na popupy dla tej strony.',
    'auth/popup-closed-by-user':      '',
    'auth/cancelled-popup-request':   '',
    'auth/unauthorized-domain':       'Ta domena nie jest autoryzowana w Firebase.',
    'auth/user-disabled':             'To konto zostało zablokowane.',
    'auth/operation-not-allowed':     'Ta metoda logowania nie jest włączona.',
    'auth/requires-recent-login':     'Ta operacja wymaga ponownego logowania.',
  };
  const msg = map[code];
  if (msg !== undefined) return msg || null;
  if (fallbackMsg && fallbackMsg.length < 120) return fallbackMsg;
  return 'Coś poszło nie tak. Spróbuj ponownie.';
}

// ===== INIT =====
export function initAuth() {
  if (window.App?.user) {
    redirectAfterAuth(window.App.user);
    return;
  }

  ['loginEmail', 'loginPassword'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') window.authLogin();
    });
  });

  document.getElementById('regPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.authRegister();
  });
  document.getElementById('regBizCity')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.authRegister();
  });
  document.getElementById('regPassword')?.addEventListener('input', e => {
    updatePasswordStrength(e.target.value);
  });
}
