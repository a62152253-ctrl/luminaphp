// Firebase Anti-Bot System Configuration
// ======================================

export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

export const ANTI_BOT_CONFIG = {
  // Blokada po 2 kliknięciach na ukryty button
  CLICKS_THRESHOLD: 2,
  
  // Czas blokady (30 minut = 1800 sekund)
  BLOCK_DURATION: 1800000, // ms
  
  // Timeout przed banem (kolejne klikniięcie = ban)
  BAN_TRIGGER_CLICKS: 3,
  
  // Czas banu (30 minut)
  BAN_DURATION: 1800000, // ms
  
  // Hidden button opacity (niewidoczny dla użytkownika)
  BUTTON_OPACITY: 0.001,
  
  // Rozmiar hidden buttona
  BUTTON_SIZE: "10px",
  
  // Timeout do resetu licznika kliknięć (1 minuta)
  CLICK_RESET_TIMEOUT: 60000 // ms
};
