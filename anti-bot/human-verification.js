/**
 * System pytań CAPTCHA dla perm ban
 * Jeśli użytkownik ma perm ban, musi odpowiedzieć na 10 pytań
 * - Prawidłowe odpowiedzi na wszystkie = Unban
 * - Błędna odpowiedź = Perm ban na zawsze
 */

import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const CAPTCHA_QUESTIONS = [
  {
    id: 1,
    question: "Jakie jest 2 + 2?",
    answers: ["4"],
    image: null
  },
  {
    id: 2,
    question: "Ile palców jest na jednej ręce?",
    answers: ["5"],
    image: null
  },
  {
    id: 3,
    question: "Ile kół ma samochód?",
    answers: ["4"],
    image: null
  },
  {
    id: 4,
    question: "W jakim sezonie pada śnieg?",
    answers: ["zima", "zimie"],
    image: null
  },
  {
    id: 5,
    question: "Ile dni ma tydzień?",
    answers: ["7"],
    image: null
  },
  {
    id: 6,
    question: "Jaki kolor ma niebo w pogodny dzień?",
    answers: ["niebieski", "niebieski", "blue"],
    image: null
  },
  {
    id: 7,
    question: "Ile nóg ma pies?",
    answers: ["4"],
    image: null
  },
  {
    id: 8,
    question: "Ile palców jest na obu rękach?",
    answers: ["10"],
    image: null
  },
  {
    id: 9,
    question: "Jaki owoc jest żółty i zakrzywiony?",
    answers: ["banan"],
    image: null
  },
  {
    id: 10,
    question: "Ile miesięcy ma rok?",
    answers: ["12"],
    image: null
  }
];

export class HumanVerificationCaptcha {
  constructor(userId) {
    this.userId = userId;
    this.database = getDatabase();
    this.currentQuestion = 0;
    this.correctAnswers = 0;
    this.totalQuestions = CAPTCHA_QUESTIONS.length;
  }

  /**
   * Sprawdza czy użytkownik ma perm ban
   */
  async hasPermBan() {
    const bannedRef = ref(this.database, `permanently_banned/${this.userId}`);
    try {
      const snapshot = await get(bannedRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking perm ban:", error);
      return false;
    }
  }

  /**
   * Sprawdza czy użytkownik jest w trakcie veryfikacji
   */
  async isVerifying() {
    const verifyRef = ref(this.database, `verification_in_progress/${this.userId}`);
    try {
      const snapshot = await get(verifyRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Inicjalizuje weryfikację - pokazuje pytania
   */
  async startVerification() {
    // Zapisz że użytkownik jest w trakcie weryfikacji
    const verifyRef = ref(this.database, `verification_in_progress/${this.userId}`);
    await set(verifyRef, {
      startedAt: Date.now(),
      correctAnswers: 0,
      totalQuestions: this.totalQuestions
    });

    this.showCaptchaScreen();
  }

  /**
   * Wyświetla ekran CAPTCHA z pytaniami
   */
  showCaptchaScreen() {
    // Usuń poprzedni overlay
    const existingOverlay = document.getElementById("captcha-overlay");
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement("div");
    overlay.id = "captcha-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      backdrop-filter: blur(10px);
    `;

    const container = document.createElement("div");
    container.style.cssText = `
      background: rgba(40, 40, 40, 0.98);
      padding: 50px;
      border-radius: 20px;
      border: 3px solid #ff6b6b;
      max-width: 700px;
      box-shadow: 0 0 50px rgba(255, 107, 107, 0.5);
      font-family: 'Arial', sans-serif;
    `;

    const question = CAPTCHA_QUESTIONS[this.currentQuestion];

    container.innerHTML = `
      <div style="text-align: center; color: #ff6b6b; margin-bottom: 30px;">
        <h1 style="font-size: 2.5em; margin: 0 0 10px 0;">🔐 HUMAN VERIFICATION</h1>
        <p style="font-size: 1.1em; margin: 0; color: #ff8787;">Pytanie ${this.currentQuestion + 1}/${this.totalQuestions}</p>
      </div>

      <div style="
        background: rgba(0, 0, 0, 0.5);
        padding: 30px;
        border-radius: 15px;
        margin: 30px 0;
        border-left: 5px solid #ff6b6b;
      ">
        <h2 style="
          color: #fff;
          font-size: 1.5em;
          margin: 0;
          text-align: center;
        ">${question.question}</h2>
      </div>

      <div style="margin-bottom: 30px;">
        <input 
          type="text" 
          id="answer-input" 
          placeholder="Wpisz swoją odpowiedź..." 
          style="
            width: 100%;
            padding: 15px;
            font-size: 1.2em;
            border: 2px solid #ff6b6b;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            text-align: center;
          "
          autofocus
        />
      </div>

      <div style="display: flex; gap: 15px;">
        <button id="submit-answer-btn" style="
          flex: 1;
          padding: 15px;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        ">SPRAWDŹ ODPOWIEDŹ</button>
      </div>

      <div style="
        margin-top: 30px;
        text-align: center;
        color: #ff8787;
        font-size: 0.95em;
      ">
        ⚠️ Błędna odpowiedź = Perm ban na zawsze<br>
        ✅ Wszystkie prawidłowe = Unban
      </div>
    `;

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    // Event listeners
    const input = overlay.querySelector("#answer-input");
    const submitBtn = overlay.querySelector("#submit-answer-btn");

    const handleSubmit = async () => {
      const answer = input.value.toLowerCase().trim();
      await this.checkAnswer(answer, overlay);
    };

    submitBtn.addEventListener("click", handleSubmit);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    });
  }

  /**
   * Sprawdza odpowiedź
   */
  async checkAnswer(userAnswer, overlay) {
    const question = CAPTCHA_QUESTIONS[this.currentQuestion];
    const isCorrect = question.answers.some(
      (answer) => answer.toLowerCase() === userAnswer.toLowerCase()
    );

    if (isCorrect) {
      this.correctAnswers++;
      this.currentQuestion++;

      if (this.currentQuestion < this.totalQuestions) {
        // Następne pytanie
        this.showCorrectMessage(overlay, () => {
          overlay.remove();
          this.showCaptchaScreen();
        });
      } else {
        // Wszystkie odpowiedzi prawidłowe - Unban!
        await this.completeVerification(true);
        overlay.remove();
      }
    } else {
      // Błędna odpowiedź - Perm ban na zawsze
      await this.completeVerification(false);
      overlay.remove();
    }
  }

  /**
   * Pokazuje komunikat o prawidłowej odpowiedzi
   */
  showCorrectMessage(overlay, callback) {
    const container = overlay.querySelector("div");
    container.style.background = "rgba(76, 175, 80, 0.1)";
    container.style.borderColor = "#4caf50";

    const message = document.createElement("div");
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 40px 60px;
      border-radius: 15px;
      font-size: 1.8em;
      z-index: 1000000;
      text-align: center;
      box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
    `;
    message.textContent = "✅ PRAWIDŁOWA ODPOWIEDŹ!";

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
      callback();
    }, 1500);
  }

  /**
   * Kończy weryfikację
   */
  async completeVerification(success) {
    const verifyRef = ref(this.database, `verification_in_progress/${this.userId}`);
    const bannedRef = ref(this.database, `permanently_banned/${this.userId}`);

    try {
      if (success) {
        // Unban użytkownika
        await set(bannedRef, null); // Usuń z permanently_banned
        await set(verifyRef, null); // Usuń z weryfikacji

        this.showFinalMessage(
          true,
          "✅ WERYFIKACJA POMYŚLNA!",
          "Twoje konto zostało odblokowane. Możesz teraz korzystać z aplikacji.",
          "#4caf50"
        );
      } else {
        // Perm ban na zawsze
        await set(bannedRef, {
          userId: this.userId,
          bannedAt: Date.now(),
          reason: "Failed human verification - Incorrect answer",
          failedAt: Date.now()
        });
        await set(verifyRef, null);

        this.showFinalMessage(
          false,
          "🚫 WERYFIKACJA NIEUDANA",
          "Podałeś błędną odpowiedź. Twoje konto jest teraz PERMANENTNIE zablokowane.",
          "#ff6b6b"
        );
      }
    } catch (error) {
      console.error("Error completing verification:", error);
    }
  }

  /**
   * Pokazuje ostateczny komunikat
   */
  showFinalMessage(success, title, message, color) {
    // Usuń wszystkie overlaye
    const allOverlays = document.querySelectorAll(
      "#captcha-overlay, #final-message-overlay"
    );
    allOverlays.forEach((el) => el.remove());

    const overlay = document.createElement("div");
    overlay.id = "final-message-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      backdrop-filter: blur(5px);
    `;

    const container = document.createElement("div");
    container.style.cssText = `
      background: rgba(30, 30, 30, 0.98);
      padding: 60px;
      border-radius: 20px;
      border: 3px solid ${color};
      max-width: 600px;
      text-align: center;
      box-shadow: 0 0 50px rgba(${color === "#4caf50" ? "76, 175, 80" : "255, 107, 107"}, 0.5);
    `;

    container.innerHTML = `
      <h1 style="color: ${color}; font-size: 2.8em; margin: 0 0 20px 0;">${title}</h1>
      <p style="color: #ccc; font-size: 1.2em; margin: 0; line-height: 1.8;">${message}</p>
      <div style="margin-top: 40px; font-size: 1.1em; color: #aaa;">
        Przeniesienie za 5 sekund...
      </div>
    `;

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Countdown
    let seconds = 5;
    const interval = setInterval(() => {
      seconds--;
      const countdownEl = container.querySelector("div:last-child");
      countdownEl.textContent = `Przeniesienie za ${seconds} sekund...`;

      if (seconds <= 0) {
        clearInterval(interval);
        overlay.remove();
        document.body.style.overflow = "auto";

        if (success) {
          // Reload strony
          window.location.reload();
        } else {
          // Pokaż perm ban screen
          this.showPermBanScreen();
        }
      }
    }, 1000);
  }

  /**
   * Ekran perm banu
   */
  showPermBanScreen() {
    const overlay = document.createElement("div");
    overlay.id = "perm-ban-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      backdrop-filter: blur(5px);
    `;

    const container = document.createElement("div");
    container.style.cssText = `
      background: rgba(30, 30, 30, 0.98);
      padding: 60px;
      border-radius: 20px;
      border: 3px solid #ff0000;
      max-width: 700px;
      text-align: center;
      box-shadow: 0 0 50px rgba(255, 0, 0, 0.6);
    `;

    container.innerHTML = `
      <h1 style="color: #ff0000; font-size: 3em; margin: 0 0 20px 0;">🚫 PERMANENT BAN</h1>
      <p style="color: #ff6666; font-size: 1.3em; margin: 0 0 30px 0;">Twoje konto zostało PERMANENTNIE zablokowane</p>
      
      <div style="
        background: rgba(255, 0, 0, 0.1);
        padding: 30px;
        border-radius: 15px;
        margin: 30px 0;
        border-left: 5px solid #ff0000;
      ">
        <p style="color: #ccc; font-size: 1.1em; margin: 0; line-height: 1.8;">
          ❌ Nie przeszedłeś weryfikacji człowieka<br>
          ❌ Odpowiedź na pytanie była błędna<br>
          ❌ Nie ma możliwości odblokowania<br>
          ❌ Skontaktuj się z administracją
        </p>
      </div>

      <p style="color: #999; font-size: 0.95em; margin-top: 30px;">
        Kod błędu: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
      </p>
    `;

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }
}

export default HumanVerificationCaptcha;
