/* ===================================================================
   LUMINA BOT — App context & knowledge (pages, FAQ, flows)
   =================================================================== */

import { normalizePL } from './bot-knowledge.js';

const API = '/luminaphp/api/bot-nlp.php';
const CACHE_KEY = 'lumina_bot_app_v1';

let _knowledge = null;

export function getAppContext() {
  const params = new URLSearchParams(window.location.search);
  const page   = params.get('page') || 'home';
  const user   = window.App?.user || null;

  return {
    page,
    pageTitle: document.title || 'Lumina',
    bizId: params.get('id') || null,
    query: params.get('q') || '',
    city: params.get('city') || '',
    cat: params.get('cat') || '',
    loggedIn: !!user,
    userName: user?.displayName?.split(' ')[0] || null,
    isOwner: !!(user?.role === 'owner' || user?.isOwner),
  };
}

export async function loadAppKnowledge() {
  if (_knowledge) return _knowledge;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      _knowledge = JSON.parse(raw);
      if (_knowledge?.pages) return _knowledge;
    }
  } catch {}

  try {
    const resp = await fetch(`${API}?action=app`);
    if (resp.ok) {
      _knowledge = await resp.json();
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(_knowledge)); } catch {}
    }
  } catch {}

  return _knowledge || { pages: {}, faqs: [], pagePrompts: {} };
}

export function matchFaq(query, knowledge) {
  if (!knowledge?.faqs?.length) return null;
  const norm = normalizePL(query);

  let best = null;
  let bestScore = 0;

  for (const faq of knowledge.faqs) {
    for (const pattern of faq.patterns || []) {
      const p = normalizePL(pattern);
      if (!p) continue;
      if (norm.includes(p) || p.includes(norm)) {
        const score = p.length / Math.max(norm.length, 1);
        if (score > bestScore) {
          bestScore = score;
          best = faq;
        }
      }
    }
  }

  return bestScore >= 0.35 ? best : null;
}

export function getPageHint(ctx, knowledge) {
  const prompts = knowledge?.pagePrompts?.[ctx.page];
  if (!prompts?.length) {
    const page = knowledge?.pages?.[ctx.page];
    return page?.hints?.[0] || null;
  }
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function describePage(ctx, knowledge) {
  return knowledge?.pages?.[ctx.page]?.desc || '';
}

const TIME_LABELS = {
  today: 'dzisiaj', tomorrow: 'jutro', day_after_tomorrow: 'pojutrze',
  monday: 'poniedziałek', tuesday: 'wtorek', wednesday: 'środa',
  thursday: 'czwartek', friday: 'piątek', saturday: 'sobotę', sunday: 'niedzielę',
  weekend: 'weekend', morning: 'rano', evening: 'wieczorem', noon: 'południe',
};

export function formatEntityContext(entities, knowledge) {
  const parts = [];
  if (entities?.cities?.length) {
    parts.push(`miasto: **${capitalize(entities.cities[0])}**`);
  }
  if (entities?.categories?.length) {
    const cat = knowledge?.categories?.[entities.categories[0]];
    parts.push(`kategoria: **${cat?.label || entities.categories[0]}**`);
  }
  if (entities?.time) {
    parts.push(`termin: **${TIME_LABELS[entities.time] || entities.time}**`);
  }
  return parts.length ? parts.join(' · ') : '';
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
