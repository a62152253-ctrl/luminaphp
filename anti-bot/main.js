/**
 * Anti-Bot System - Main Entry Point
 * ===================================
 * 
 * System automatycznie:
 * 1. Dodaje ukryte buttony na każdej stronie (w losowych miejscach)
 * 2. Śledzi klikniięcia - 2 klikniięcia = 30 min blokada
 * 3. Kolejne klikniięcia = PERM BAN (z weryfikacją CAPTCHA)
 * 4. Jeśli perm ban - użytkownik musi odpowiedzieć na 10 pytań
 * 5. Prawidłowe odpowiedzi = Unban
 * 6. Błędna odpowiedź = Perm ban na zawsze
 * 7. Wyświetla pełny zablokowany ekran
 * 8. Używa Firebase do przechowywania danych blokad
 */

import HiddenButtonInjector from "./hidden-button-injector.js";
import AntiBot from "./firebase-service.js";

// Globalne zmienne
window.antiBotSystem = {
  injector: HiddenButtonInjector,
  antiBot: new AntiBot(),
};

console.log("✅ Anti-Bot System loaded successfully!");
console.log("📍 Hidden buttons injected on this page");
console.log("🔒 Monitoring user interactions...");
console.log("🚨 Permanent ban system with CAPTCHA verification activated");

// Debug mode - odkomentuj do testowania
// window.antiBotSystem.debugMode = true;
