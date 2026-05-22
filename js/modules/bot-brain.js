/* ===================================================================
   LUMINA BOT — Hybrid Classifier (mini-GPT pipeline)
   Spell (50k) → FAQ app → Lexicon → Embeddings → TF-IDF → fusion
   =================================================================== */

import { INTENTS, STOP_WORDS, ENTITIES, normalizePL, buildCorpus } from './bot-knowledge.js';
import { loadAppKnowledge, matchFaq } from './bot-app.js';

const EMB_CACHE_KEY   = 'lumina_bot_emb_v3';
const LEX_CACHE_KEY   = 'lumina_bot_lex_v1';
const CORPUS_STOP_KEY = 'lumina_bot_corpus_stop_v1';
const EMB_CACHE_TTL   = 7 * 24 * 3600 * 1000; // 7 days
const API             = '/luminaphp/api/bot-nlp.php';

/* ─── Math helpers ──────────────────────────────────────────────── */

function dotProduct(a, b) {
  let s = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) s += a[i] * b[i];
  return s;
}

function norm(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}

function cosine(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  return dotProduct(a, b) / (na * nb);
}

/* ─── Lexicon classifier (bot-words.json) ───────────────────────── */

class LexiconClassifier {
  constructor() {
    this._ready      = false;
    this._words      = {};
    this._bigrams    = {};
    this._lexKeys    = new Set();
    this._corpusStop = new Set();
    this._stopMin    = 100_000;
  }

  async init() {
    try {
      const raw = localStorage.getItem(LEX_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.version && cached.words) {
          this._applyLexicon(cached);
        }
      }
    } catch {}

    if (!this._ready) {
      try {
        const resp = await fetch(`${API}?action=lexicon`);
        if (resp.ok) {
          const data = await resp.json();
          this._applyLexicon(data);
          try {
            localStorage.setItem(LEX_CACHE_KEY, JSON.stringify({
              version: data.version,
              wordbase: data.wordbase,
              words: data.words,
              bigrams: data.bigrams,
            }));
          } catch {}
        }
      } catch {}
    }

    this._loadCorpusStop();
  }

  _applyLexicon(data) {
    this._bigrams = data.bigrams || {};
    this._stopMin = data.wordbase?.stop_freq_min ?? 100_000;

    this._words = {};
    for (const [word, intents] of Object.entries(data.words || {})) {
      this._words[normalizePL(word)] = intents;
    }

    this._lexKeys = new Set([
      ...Object.keys(this._words),
      ...Object.keys(this._bigrams).map(b => normalizePL(b)),
    ]);
    this._ready = Object.keys(this._words).length > 0;
  }

  async _loadCorpusStop() {
    try {
      const raw = localStorage.getItem(CORPUS_STOP_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.min === this._stopMin && Array.isArray(cached.words)) {
          this._corpusStop = new Set(cached.words);
          return;
        }
      }
    } catch {}

    try {
      const resp = await fetch(`${API}?action=corpus_stop&min=${this._stopMin}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (Array.isArray(data.words)) {
        this._corpusStop = new Set(data.words.map(w => normalizePL(w)));
        try {
          localStorage.setItem(CORPUS_STOP_KEY, JSON.stringify({
            min: this._stopMin,
            words: data.words,
          }));
        } catch {}
      }
    } catch {}
  }

  classify(query) {
    if (!this._ready) return null;

    const norm = normalizePL(query);
    const scores = {};

    for (const [phrase, intents] of Object.entries(this._bigrams)) {
      const key = normalizePL(phrase);
      if (!key || !norm.includes(key)) continue;
      for (const [intentId, weight] of Object.entries(intents)) {
        scores[intentId] = (scores[intentId] || 0) + weight * 1.4;
      }
    }

    const tokens = tokenize(query, this._corpusStop, this._lexKeys);
    for (const token of tokens) {
      const intents = this._words[token];
      if (!intents) continue;
      for (const [intentId, weight] of Object.entries(intents)) {
        scores[intentId] = (scores[intentId] || 0) + weight;
      }
    }

    let bestId = null;
    let bestScore = 0;
    for (const [id, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    }

    if (!bestId || bestScore < 0.85) return null;

    const confidence = Math.min(1, bestScore / 3.5);
    return {
      intent: INTENTS.find(i => i.id === bestId) || _fallbackIntent(),
      confidence,
      entities: extractEntities(query),
    };
  }
}

/* ─── TF-IDF fallback ───────────────────────────────────────────── */

function tokenize(str, corpusStop = null, lexiconKeys = null) {
  return normalizePL(str)
    .split(/\s+/)
    .filter(t => {
      if (t.length < 2) return false;
      if (lexiconKeys?.has(t)) return true;
      if (STOP_WORDS.has(t)) return false;
      if (corpusStop?.has(t)) return false;
      return true;
    });
}

function termFreq(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const len = tokens.length || 1;
  for (const t in tf) tf[t] /= len;
  return tf;
}

class TFIDFClassifier {
  constructor() {
    this._idf = {};
    this._vocab = [];
    this._vecs = {};
    this._train();
  }

  _train() {
    const corpus = buildCorpus();
    const docTokens = corpus.map(d => tokenize(d.text));
    const N = docTokens.length;
    const df = {};

    for (const tokens of docTokens) {
      const uniq = new Set(tokens);
      for (const t of uniq) df[t] = (df[t] || 0) + 1;
    }

    for (const t in df) {
      this._idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1;
    }
    this._vocab = Object.keys(this._idf);

    for (let i = 0; i < corpus.length; i++) {
      const tf = termFreq(docTokens[i]);
      const v = {};
      for (const t of this._vocab) v[t] = (tf[t] || 0) * (this._idf[t] || 0);
      this._vecs[corpus[i].id] = v;
    }
  }

  classify(query) {
    const tokens = tokenize(query);
    if (!tokens.length) {
      return { intent: _fallbackIntent(), confidence: 0, entities: {} };
    }

    const tf = termFreq(tokens);
    const qv = {};
    for (const t of this._vocab) qv[t] = (tf[t] || 0) * (this._idf[t] || 0);

    let best = { id: 'fallback', score: 0 };
    for (const id in this._vecs) {
      let dot = 0, na = 0, nb = 0;
      for (const t of this._vocab) {
        const av = qv[t] || 0, bv = this._vecs[id][t] || 0;
        dot += av * bv; na += av * av; nb += bv * bv;
      }
      const score = na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
      if (score > best.score) best = { id, score };
    }

    const boost = _keywordBoost(tokens, best.id);
    return {
      intent: INTENTS.find(i => i.id === best.id) || _fallbackIntent(),
      confidence: Math.min(1, best.score + boost),
      entities: extractEntities(query),
    };
  }
}

/* ─── Embedding classifier ──────────────────────────────────────── */

class EmbeddingClassifier {
  constructor() {
    this._ready  = false;
    this._vecs   = {}; // intentId → float[]
    this._failed = false;
  }

  async init() {
    // 1. Try localStorage cache
    try {
      const raw = localStorage.getItem(EMB_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        const age = Date.now() - (cached.ts || 0);
        if (age < EMB_CACHE_TTL && Object.keys(cached.vecs || {}).length >= 15) {
          this._vecs  = cached.vecs;
          this._ready = true;
          return;
        }
      }
    } catch {}

    // 2. Embed intents via API (runs in background, doesn't block bot)
    this._embedIntents();
  }

  async _embedIntents() {
    const texts = INTENTS
      .filter(i => i.id !== 'fallback')
      .map(i => ({ id: i.id, text: i.training.slice(0, 20).join(' ') }));

    // Bulk embed — one POST, PHP handles it
    try {
      const resp = await fetch(`${API}?action=embed_bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: texts.map(t => t.text) }),
      });
      if (!resp.ok) { this._failed = true; return; }
      const data = await resp.json();
      const results = data.results || [];

      for (let i = 0; i < texts.length; i++) {
        const emb = results[i]?.embedding;
        if (emb && Array.isArray(emb)) this._vecs[texts[i].id] = emb;
      }
    } catch {
      // API unreachable — fall back to one-by-one (slower but works if bulk fails)
      for (const { id, text } of texts) {
        try {
          const resp = await fetch(`${API}?action=embed&text=${encodeURIComponent(text)}`);
          if (!resp.ok) continue;
          const d = await resp.json();
          if (d.embedding) this._vecs[id] = d.embedding;
        } catch {}
        await _sleep(100);
      }
    }

    if (Object.keys(this._vecs).length >= 10) {
      this._ready = true;
      try {
        localStorage.setItem(EMB_CACHE_KEY, JSON.stringify({
          ts: Date.now(), vecs: this._vecs,
        }));
      } catch {}
    } else {
      this._failed = true;
    }
  }

  async classifyQuery(query) {
    if (!this._ready) return null;
    try {
      const resp = await fetch(`${API}?action=embed&text=${encodeURIComponent(query)}`);
      if (!resp.ok) return null;
      const d = await resp.json();
      if (!d.embedding) return null;

      let best = { id: 'fallback', score: -1 };
      for (const [id, vec] of Object.entries(this._vecs)) {
        const score = cosine(d.embedding, vec);
        if (score > best.score) best = { id, score };
      }

      const intent = INTENTS.find(i => i.id === best.id) || _fallbackIntent();
      return { intent, confidence: best.score, entities: extractEntities(query) };
    } catch {
      return null;
    }
  }
}

/* ─── Entity extraction ─────────────────────────────────────────── */

const TIME_PATTERNS = {
  dzisiaj: 'today', dzis: 'today', teraz: 'today',
  jutro: 'tomorrow', pojutrze: 'day_after_tomorrow',
  poniedzialek: 'monday', wtorek: 'tuesday', sroda: 'wednesday',
  czwartek: 'thursday', piatek: 'friday', sobota: 'saturday', niedziela: 'sunday',
  weekend: 'weekend', rano: 'morning', wieczor: 'evening', poludnie: 'noon',
};

export function extractEntities(query) {
  const norm = normalizePL(query);
  const entities = { cities: [], categories: [], time: null };

  for (const city of ENTITIES.cities) {
    if (norm.includes(city)) entities.cities.push(city);
  }
  for (const [cat, keywords] of Object.entries(ENTITIES.categories)) {
    if (keywords.some(kw => norm.includes(normalizePL(kw)))) {
      if (!entities.categories.includes(cat)) entities.categories.push(cat);
    }
  }
  for (const [pattern, value] of Object.entries(TIME_PATTERNS)) {
    if (norm.includes(pattern)) { entities.time = value; break; }
  }
  return entities;
}

/* ─── Shared helpers ────────────────────────────────────────────── */

function _fallbackIntent() {
  return INTENTS.find(i => i.id === 'fallback');
}

function _sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function _keywordBoost(tokens, intentId) {
  const map = {
    'hej':'greeting','czesc':'greeting','witaj':'greeting','siema':'greeting','halo':'greeting',
    'pa':'goodbye','nara':'goodbye','bye':'goodbye','ciao':'goodbye',
    'pomoc':'help','help':'help','instrukcja':'help','umiesz':'help',
    'mapa':'show_map','lokalizacja':'show_map','gps':'show_map',
    'promocje':'show_promotions','rabaty':'show_promotions','znizki':'show_promotions',
    'voucher':'show_promotions','kupon':'show_promotions','promo':'show_promotions',
    'barber':'category_barber','barbershop':'category_barber','broda':'category_barber',
    'fade':'category_barber','undercut':'category_barber','zarost':'category_barber',
    'paznokcie':'category_nails','manicure':'category_nails','pedicure':'category_nails',
    'hybryda':'category_nails','akryl':'category_nails','zelowe':'category_nails',
    'fryzjer':'category_hair','fryzjerka':'category_hair','farbowanie':'category_hair',
    'koloryzacja':'category_hair','balayage':'category_hair','keratyna':'category_hair',
    'masaz':'category_massage','masaż':'category_massage','spa':'category_massage',
    'relaks':'category_massage','shiatsu':'category_massage','wellness':'category_massage',
    'kosmetyczka':'category_beauty','kosmetolog':'category_beauty','peeling':'category_beauty',
    'botox':'category_beauty','hialuron':'category_beauty','depilacja':'category_beauty',
    'brwi':'category_brows','rzesy':'category_brows','laminacja':'category_brows',
    'microblading':'category_brows','henna':'category_brows',
    'fizjoterapia':'category_physio','rehabilitacja':'category_physio',
    'kregoslup':'category_physio','kontuzja':'category_physio','taping':'category_physio',
    'tatuz':'category_tattoo','tatuaz':'category_tattoo','piercing':'category_tattoo',
    'tattoo':'category_tattoo','ink':'category_tattoo',
    'lojalnosc':'navigate_loyalty','punkty':'navigate_loyalty','rewards':'navigate_loyalty',
    'ulubione':'navigate_favorites','bookmarki':'navigate_favorites',
    'powiadomienia':'navigate_notifications','notyfikacje':'navigate_notifications',
    'profil':'navigate_profile','ustawienia':'navigate_profile','haslo':'navigate_profile',
    'zaproszenie':'navigate_referral','referal':'navigate_referral','referral':'navigate_referral',
    'cennik':'pricing_query','cena':'pricing_query','kosztuje':'pricing_query',
    'partner':'show_business','prowadze':'show_business','komisja':'show_business',
    'loguj':'auth_login','zaloguj':'auth_login',
    'rejestracja':'auth_register','signup':'auth_register',
  };
  for (const t of tokens) if (map[t] === intentId) return 0.35;
  return 0;
}

/* ─── Spell correction (WordBase50k) ────────────────────────────── */

class SpellCorrector {
  async correct(query) {
    try {
      const resp = await fetch(`${API}?action=spell&text=${encodeURIComponent(query)}`);
      if (!resp.ok) return { text: query, fixes: {} };
      const data = await resp.json();
      return { text: data.text || query, fixes: data.fixes || {} };
    } catch {
      return { text: query, fixes: {} };
    }
  }
}

function fuseResults(candidates, entities) {
  const scores = {};

  for (const c of candidates) {
    const id = c.intent?.id || 'fallback';
    const w  = c.weight ?? 1;
    scores[id] = (scores[id] || 0) + c.confidence * w;
  }

  let bestId = 'fallback';
  let bestScore = 0;
  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  const intent = INTENTS.find(i => i.id === bestId) || _fallbackIntent();
  const confidence = Math.min(1, bestScore / 1.8);

  return { intent, confidence, entities };
}

/* ─── Hybrid BotBrain ───────────────────────────────────────────── */

export class BotBrain {
  constructor() {
    this._lexicon = new LexiconClassifier();
    this._tfidf   = new TFIDFClassifier();
    this._emb     = new EmbeddingClassifier();
    this._spell   = new SpellCorrector();
    this._appKnowledge = null;
  }

  async init() {
    this._lexicon.init().catch(() => {});
    this._emb.init().catch(() => {});
    loadAppKnowledge().then(k => { this._appKnowledge = k; }).catch(() => {});
    fetch(`${API}?action=stats`).catch(() => {});
  }

  async classify(rawQuery) {
    const { text: query, fixes } = await this._spell.correct(rawQuery);

    const knowledge = this._appKnowledge || await loadAppKnowledge();
    this._appKnowledge = knowledge;

    const faq = matchFaq(query, knowledge);
    if (faq) {
      return {
        intent: INTENTS.find(i => i.id === 'about_app') || _fallbackIntent(),
        confidence: 0.92,
        entities: extractEntities(query),
        corrections: fixes,
        faq,
      };
    }

    const entities = extractEntities(query);
    const candidates = [];

    const lexResult = this._lexicon.classify(query);
    if (lexResult) candidates.push({ ...lexResult, weight: 1.35 });

    const tfResult = this._tfidf.classify(query);
    candidates.push({ ...tfResult, weight: 1.0 });

    if (this._emb._ready) {
      const embResult = await this._emb.classifyQuery(query);
      if (embResult) candidates.push({ ...embResult, weight: 1.15 });
    }

    const fused = fuseResults(candidates, entities);

    if (fused.intent.id === 'search_salon' && entities.categories.length && !entities.cities.length) {
      fused.confidence = Math.min(1, fused.confidence + 0.08);
    }

    return { ...fused, corrections: fixes };
  }

  isEmbeddingReady() { return this._emb._ready; }
  isLexiconReady()  { return this._lexicon._ready; }
}

/* ─── Singleton ─────────────────────────────────────────────────── */

let _brain = null;

export function getBrain() {
  if (!_brain) {
    _brain = new BotBrain();
    _brain.init().catch(() => {});
  }
  return _brain;
}
