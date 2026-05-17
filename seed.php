<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Lumina — Seed kont testowych</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0f0f0f; color: #f4f4f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 1.5rem; padding: 3rem; max-width: 42rem; width: 100%; }
    h1 { font-size: 1.75rem; font-weight: 900; margin-bottom: .5rem; }
    .sub { color: #71717a; font-size: .875rem; margin-bottom: 2.5rem; }
    .accounts { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
    .account { background: #09090b; border: 1px solid #27272a; border-radius: 1rem; padding: 1.25rem 1.5rem; }
    .account-label { font-size: .5625rem; font-weight: 900; text-transform: uppercase; letter-spacing: .15em; color: #f43f5e; margin-bottom: .5rem; }
    .account-name { font-weight: 700; font-size: 1rem; margin-bottom: .25rem; }
    .account-cred { font-size: .8125rem; color: #a1a1aa; font-family: monospace; }
    .btn { display: inline-flex; align-items: center; gap: .5rem; padding: .875rem 2rem; border-radius: .75rem; font-weight: 900; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; border: none; cursor: pointer; transition: all .2s; width: 100%; justify-content: center; }
    .btn-primary { background: #f43f5e; color: white; }
    .btn-primary:hover { background: #e11d48; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .log { margin-top: 2rem; background: #09090b; border-radius: .75rem; padding: 1.25rem; font-family: monospace; font-size: .75rem; max-height: 16rem; overflow-y: auto; display: none; }
    .log-line { padding: .2rem 0; border-bottom: 1px solid #1a1a1a; }
    .log-line.ok { color: #4ade80; }
    .log-line.err { color: #f87171; }
    .log-line.info { color: #60a5fa; }
    .success-box { margin-top: 2rem; background: #052e16; border: 1px solid #166534; border-radius: .75rem; padding: 1.5rem; display: none; }
    .success-box h3 { color: #4ade80; font-size: .875rem; font-weight: 900; margin-bottom: .75rem; }
    .success-box ul { list-style: none; font-size: .8125rem; color: #86efac; line-height: 1.8; }
  </style>
</head>
<body>
<div class="card">
  <h1>Seed — Konta testowe</h1>
  <p class="sub">Tworzy 3 konta testowe w Firebase (auth + Firestore). Uruchom tylko raz.</p>

  <div class="accounts">
    <div class="account">
      <div class="account-label">Klient</div>
      <div class="account-name">Jan Kowalski</div>
      <div class="account-cred">klient@lumina.test / Lumina123!</div>
    </div>
    <div class="account">
      <div class="account-label">Salon 1 — Barber</div>
      <div class="account-name">Barber Shop Pro · właściciel: Marek Nowak</div>
      <div class="account-cred">salon1@lumina.test / Lumina123!</div>
    </div>
    <div class="account">
      <div class="account-label">Salon 2 — Paznokcie</div>
      <div class="account-name">Nail Studio Maria · właścicielka: Maria Kowalska</div>
      <div class="account-cred">salon2@lumina.test / Lumina123!</div>
    </div>
  </div>

  <button class="btn btn-primary" id="seedBtn" onclick="runSeed()">
    <span class="material-icons" style="font-size:1.125rem">rocket_launch</span>
    Utwórz konta testowe
  </button>

  <div class="log" id="logBox"></div>
  <div class="success-box" id="successBox">
    <h3>✓ Konta gotowe!</h3>
    <ul>
      <li>Klient: klient@lumina.test / Lumina123!</li>
      <li>Salon 1: salon1@lumina.test / Lumina123!</li>
      <li>Salon 2: salon2@lumina.test / Lumina123!</li>
    </ul>
  </div>
</div>

<script type="module">
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updateProfile }
  from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const cfg = {
  projectId: "gen-lang-client-0496892385",
  appId: "1:307361550098:web:cc1ede012cd56924b0adcb",
  apiKey: "AIzaSyAAQrH_mPvX8EenGOjbNNZn5EdmPc2OLn8",
  authDomain: "gen-lang-client-0496892385.firebaseapp.com",
  storageBucket: "gen-lang-client-0496892385.firebasestorage.app",
  messagingSenderId: "307361550098"
};
const app  = initializeApp(cfg, 'seed');
const auth = getAuth(app);
const db   = getFirestore(app, "ai-studio-lumina-541a713b-1937-4f08-a912-0b6d435f4ae6");

const log = (msg, type = 'info') => {
  const box = document.getElementById('logBox');
  box.style.display = 'block';
  const line = document.createElement('div');
  line.className = 'log-line ' + type;
  line.textContent = msg;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
};

window.runSeed = async function() {
  const btn = document.getElementById('seedBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons" style="font-size:1.125rem">hourglass_empty</span> Tworzę...';

  // ── 1. KLIENT ──────────────────────────────────────────────
  try {
    log('Tworzę konto klienta…');
    const cred = await createUserWithEmailAndPassword(auth, 'klient@lumina.test', 'Lumina123!');
    await updateProfile(cred.user, { displayName: 'Jan Kowalski' });
    await setDoc(doc(db, 'users', cred.user.uid), {
      role: 'client',
      displayName: 'Jan Kowalski',
      email: 'klient@lumina.test',
      createdAt: serverTimestamp(),
    });
    log('✓ Klient utworzony (uid: ' + cred.user.uid + ')', 'ok');
  } catch(e) {
    log('Klient: ' + (e.code === 'auth/email-already-in-use' ? 'już istnieje, pomijam' : e.message),
        e.code === 'auth/email-already-in-use' ? 'info' : 'err');
  }

  // ── 2. SALON 1 — BARBER ────────────────────────────────────
  let salon1uid = null;
  try {
    log('Tworzę konto Salon 1 (Barber)…');
    const cred = await createUserWithEmailAndPassword(auth, 'salon1@lumina.test', 'Lumina123!');
    await updateProfile(cred.user, { displayName: 'Marek Nowak' });
    salon1uid = cred.user.uid;

    await setDoc(doc(db, 'users', salon1uid), {
      role: 'business',
      displayName: 'Marek Nowak',
      email: 'salon1@lumina.test',
      businessId: salon1uid,
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'businesses', salon1uid), {
      name: 'Barber Shop Pro',
      category: 'Barber',
      city: 'Warszawa',
      address: 'ul. Marszałkowska 10',
      ownerId: salon1uid,
      rating: 4.9,
      photoURL: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop',
      description: 'Najlepszy barber w Warszawie. Klasyczne i nowoczesne stylizacje dla prawdziwych gentlemanów.',
      lat: 52.229, lng: 21.012,
      createdAt: serverTimestamp(),
    });

    // Usługi salon 1
    const s1 = collection(db, 'businesses', salon1uid, 'services');
    await addDoc(s1, { name: 'Strzyżenie', category: 'Strzyżenie', duration: 45, price: 80, createdAt: serverTimestamp() });
    await addDoc(s1, { name: 'Strzyżenie + Broda', category: 'Combo', duration: 60, price: 120, createdAt: serverTimestamp() });
    await addDoc(s1, { name: 'Broda', category: 'Broda', duration: 30, price: 60, createdAt: serverTimestamp() });
    await addDoc(s1, { name: 'Stylizacja', category: 'Stylizacja', duration: 30, price: 50, createdAt: serverTimestamp() });

    // Pracownicy salon 1
    const st1 = collection(db, 'businesses', salon1uid, 'staff');
    await addDoc(st1, { name: 'Marek K.', title: 'Senior Barber', photoURL: 'https://i.pravatar.cc/200?img=11', createdAt: serverTimestamp() });
    await addDoc(st1, { name: 'Tomek W.', title: 'Barber', photoURL: 'https://i.pravatar.cc/200?img=12', createdAt: serverTimestamp() });
    await addDoc(st1, { name: 'Piotr D.', title: 'Junior Barber', photoURL: 'https://i.pravatar.cc/200?img=13', createdAt: serverTimestamp() });

    log('✓ Salon 1 (Barber Shop Pro) utworzony', 'ok');
  } catch(e) {
    log('Salon 1: ' + (e.code === 'auth/email-already-in-use' ? 'już istnieje, pomijam' : e.message),
        e.code === 'auth/email-already-in-use' ? 'info' : 'err');
  }

  // ── 3. SALON 2 — PAZNOKCIE ─────────────────────────────────
  try {
    log('Tworzę konto Salon 2 (Nail Studio)…');
    const cred = await createUserWithEmailAndPassword(auth, 'salon2@lumina.test', 'Lumina123!');
    await updateProfile(cred.user, { displayName: 'Maria Kowalska' });
    const salon2uid = cred.user.uid;

    await setDoc(doc(db, 'users', salon2uid), {
      role: 'business',
      displayName: 'Maria Kowalska',
      email: 'salon2@lumina.test',
      businessId: salon2uid,
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'businesses', salon2uid), {
      name: 'Nail Studio Maria',
      category: 'Paznokcie',
      city: 'Warszawa',
      address: 'ul. Nowy Świat 25',
      ownerId: salon2uid,
      rating: 4.8,
      photoURL: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop',
      description: 'Profesjonalne studio paznokci. Manicure, pedicure, żel, akryl — Twoje paznokcie w najlepszych rękach.',
      lat: 52.234, lng: 21.018,
      createdAt: serverTimestamp(),
    });

    // Usługi salon 2
    const s2 = collection(db, 'businesses', salon2uid, 'services');
    await addDoc(s2, { name: 'Manicure hybrydowy', category: 'Manicure', duration: 60, price: 120, createdAt: serverTimestamp() });
    await addDoc(s2, { name: 'Pedicure klasyczny', category: 'Pedicure', duration: 60, price: 100, createdAt: serverTimestamp() });
    await addDoc(s2, { name: 'Żel na naturalną płytkę', category: 'Żel', duration: 75, price: 150, createdAt: serverTimestamp() });
    await addDoc(s2, { name: 'Zdobienie paznokci', category: 'Zdobienie', duration: 30, price: 50, createdAt: serverTimestamp() });

    // Pracownicy salon 2
    const st2 = collection(db, 'businesses', salon2uid, 'staff');
    await addDoc(st2, { name: 'Natalia S.', title: 'Nail Artist', photoURL: 'https://i.pravatar.cc/200?img=25', createdAt: serverTimestamp() });
    await addDoc(st2, { name: 'Zofia B.', title: 'Junior Nail Artist', photoURL: 'https://i.pravatar.cc/200?img=26', createdAt: serverTimestamp() });

    log('✓ Salon 2 (Nail Studio Maria) utworzony', 'ok');
  } catch(e) {
    log('Salon 2: ' + (e.code === 'auth/email-already-in-use' ? 'już istnieje, pomijam' : e.message),
        e.code === 'auth/email-already-in-use' ? 'info' : 'err');
  }

  log('─────────────────────────────', 'info');
  log('Gotowe! Możesz się zalogować.', 'ok');
  document.getElementById('successBox').style.display = 'block';
  btn.innerHTML = '<span class="material-icons" style="font-size:1.125rem">check_circle</span> Gotowe';
};
</script>
</body>
</html>
