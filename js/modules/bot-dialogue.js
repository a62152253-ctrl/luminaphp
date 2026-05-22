/* ===================================================================
   LUMINA BOT — Dialogue engine (contextual, app-aware responses)
   =================================================================== */

import { INTENTS } from './bot-knowledge.js';
import { getAppContext, loadAppKnowledge, matchFaq, getPageHint, formatEntityContext } from './bot-app.js';

const HISTORY_KEY = 'lumina_bot_history_v1';
const MAX_HISTORY = 8;

export function loadHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushHistory(role, text) {
  const h = loadHistory();
  h.push({ role, text, ts: Date.now() });
  while (h.length > MAX_HISTORY) h.shift();
  try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}

export function clearHistory() {
  try { sessionStorage.removeItem(HISTORY_KEY); } catch {}
}

/**
 * Build final bot reply from classification result.
 */
export async function composeReply(result, rawQuery) {
  const { intent, confidence, entities, corrections, faq } = result;
  const ctx = getAppContext();
  const knowledge = await loadAppKnowledge();

  if (faq?.answer) {
    return {
      text: personalize(faq.answer, ctx),
      chips: suggestChips(ctx, knowledge, 'help'),
      meta: { type: 'faq', faqId: faq.id },
    };
  }

  let text = pickIntentResponse(intent, ctx);

  if (corrections && Object.keys(corrections).length) {
    const fixes = Object.entries(corrections)
      .map(([a, b]) => `„${a}” → „${b}”`)
      .join(', ');
    text = `_Poprawiłem literówki:_ ${fixes}\n\n` + text;
  }

  const entityLine = formatEntityContext(entities, knowledge);
  if (entityLine && intent.id !== 'fallback') {
    text += `\n\n_Szukam:_ ${entityLine}`;
  }

  const pageHint = getPageHint(ctx, knowledge);
  if (pageHint && confidence >= 0.45 && intent.id !== 'greeting' && intent.id !== 'goodbye') {
    text += `\n\n_${pageHint}_`;
  }

  if (confidence < 0.42 && intent.id === 'fallback') {
    text = buildClarification(ctx, knowledge, rawQuery);
  } else if (confidence < 0.5 && intent.id !== 'fallback') {
    text += '\n\n_Jeśli o coś innego chodziło — doprecyzuj, chętnie pomogę._';
  }

  if (!ctx.loggedIn && needsAuth(intent.id)) {
    text += '\n\n_Zaloguj się, by skorzystać z tej funkcji — mogę otworzyć logowanie._';
  }

  return {
    text,
    chips: intent.chips?.length ? intent.chips : suggestChips(ctx, knowledge, intent.id),
    meta: {
      intentId: intent.id,
      confidence: Math.round(confidence * 100) / 100,
      page: ctx.page,
    },
  };
}

function pickIntentResponse(intent, ctx) {
  const responses = intent.responses || [];
  let text = responses[Math.floor(Math.random() * responses.length)] || 'Jestem tu, żeby pomóc.';

  if (ctx.userName && intent.id === 'greeting') {
    text = `Hej, **${ctx.userName}**! ` + text.replace(/^Hej[!,]?\s*/i, '');
  }

  if (ctx.page === 'dashboard' && intent.id === 'my_bookings') {
    text = 'Jesteś już w **Moje wizyty** — sprawdź listę rezerwacji poniżej.';
  }
  if (ctx.page === 'map' && intent.id === 'show_map') {
    text = 'Mapa jest już otwarta — kliknij salon na mapie lub podaj miasto.';
  }
  if (ctx.page === 'offers' && intent.id === 'show_promotions') {
    text = 'Przeglądasz **Promocje** — wybierz ofertę, by przejść do salonu.';
  }
  if (ctx.page === 'profile' && intent.id === 'navigate_profile') {
    text = 'Jesteś już w **Ustawieniach profilu** — możesz edytować swoje dane.';
  }
  if (ctx.page === 'notifications' && intent.id === 'navigate_notifications') {
    text = 'Przeglądasz już **Powiadomienia** — sprawdź co nowego!';
  }
  if (ctx.page === 'loyalty' && intent.id === 'navigate_loyalty') {
    text = 'Jesteś w **Programie lojalnościowym** — widzisz swoje punkty poniżej.';
  }
  if (ctx.page === 'explore' && (intent.id === 'search_salon' || intent.id === 'book_appointment')) {
    text = 'Jesteś już w **Eksploracji salonów** — wyszukaj po kategorii lub mieście!';
  }
  if (intent.id === 'book_appointment' && ctx.cat) {
    text = `Znaleziono kategorię **${ctx.cat}** — wybierz salon i umów wizytę!`;
  }

  return text;
}

function buildClarification(ctx, knowledge, query) {
  const desc = knowledge?.pages?.[ctx.page]?.title;
  const base = desc
    ? `Na stronie **${desc}** mogę pomóc z rezerwacją i nawigacją.`
    : 'Chętnie pomogę z Lumina — rezerwacje salonów beauty.';

  return `${base}\n\nNie jestem pewien, o co chodzi w: „${query.slice(0, 80)}”.\n\nSpróbuj np.:\n• **barber Warszawa**\n• **moje wizyty**\n• **jak zarezerwować wizytę**`;
}

function suggestChips(ctx, knowledge, intentId) {
  const pageHints = knowledge?.pages?.[ctx.page]?.hints;
  if (pageHints?.length && intentId === 'fallback') {
    return pageHints.slice(0, 4);
  }
  const fallback = INTENTS.find(i => i.id === 'fallback');
  return fallback?.chips || ['Znajdź salon', 'Pomoc', 'Promocje'];
}

function needsAuth(intentId) {
  return [
    'my_bookings', 'cancel_booking', 'navigate_loyalty', 'navigate_favorites',
    'navigate_admin', 'navigate_notifications', 'navigate_profile', 'navigate_referral',
  ].includes(intentId);
}

function personalize(text, ctx) {
  if (ctx.userName) {
    return text.replace(/\*\*Lumina\*\*/, `**Lumina** (${ctx.userName})`);
  }
  return text;
}

export function getModelStatus(brain) {
  const parts = [];
  if (brain.isLexiconReady()) parts.push('Leksykon');
  if (brain.isEmbeddingReady()) parts.push('AI embed');
  parts.push('Korpus 50k');
  return parts.join(' · ');
}
