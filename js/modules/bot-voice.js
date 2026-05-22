/* ===================================================================
   LUMINA BOT — Web Speech API (voice input + output)
   Polish: pl-PL
   =================================================================== */

let _recognition  = null;
let _synth        = window.speechSynthesis || null;
let _listening    = false;
let _onResult     = null;
let _onError      = null;
let _onEnd        = null;
let _polishVoice  = null;

export const voiceAvailable = !!(
  (window.SpeechRecognition || window.webkitSpeechRecognition) && _synth
);

function pickPolishVoice() {
  if (_polishVoice) return _polishVoice;
  const voices = _synth.getVoices();
  _polishVoice = voices.find(v => v.lang.startsWith('pl'))
    || voices.find(v => v.lang.startsWith('pl-PL'))
    || null;
  return _polishVoice;
}

/* Ensure voices are loaded (Chrome loads them async) */
function ensureVoices() {
  return new Promise(resolve => {
    const voices = _synth?.getVoices() || [];
    if (voices.length) { resolve(); return; }
    if (_synth && 'onvoiceschanged' in _synth) {
      _synth.onvoiceschanged = () => resolve();
      setTimeout(resolve, 1200); // fallback
    } else {
      setTimeout(resolve, 500);
    }
  });
}

export async function speak(text, onEnd) {
  if (!_synth) { onEnd?.(); return; }
  _synth.cancel();
  await ensureVoices();

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'pl-PL';
  utt.rate = 1.0;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  const voice = pickPolishVoice();
  if (voice) utt.voice = voice;

  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  _synth.speak(utt);
}

export function stopSpeaking() {
  _synth?.cancel();
}

export function startListening(onResult, onError, onEnd) {
  if (_listening) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { onError?.('unsupported'); return; }

  _onResult = onResult;
  _onError  = onError;
  _onEnd    = onEnd;

  _recognition = new SR();
  _recognition.lang = 'pl-PL';
  _recognition.continuous = false;
  _recognition.interimResults = false;
  _recognition.maxAlternatives = 1;

  _recognition.onstart = () => { _listening = true; };

  _recognition.onresult = (e) => {
    const transcript = e.results[0]?.[0]?.transcript || '';
    _onResult?.(transcript);
  };

  _recognition.onerror = (e) => {
    _listening = false;
    if (e.error !== 'aborted') _onError?.(e.error);
  };

  _recognition.onend = () => {
    _listening = false;
    _onEnd?.();
  };

  try {
    _recognition.start();
  } catch(e) {
    _listening = false;
    onError?.(e.message);
  }
}

export function stopListening() {
  if (!_listening || !_recognition) return;
  try { _recognition.stop(); } catch(_) {}
  _listening = false;
}

export function isListening() { return _listening; }
