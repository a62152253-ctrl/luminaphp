/* ===================================================================
   LUMINA BOT — App Actions
   Translates intent decisions into in-app navigation & interactions
   =================================================================== */

const BASE = '/luminaphp/';

function go(url) { window.location.href = url; }

export const ACTIONS = {

  navigate_home() {
    go(BASE);
  },

  navigate_explore(entities) {
    let url = BASE + '?page=explore';
    if (entities?.cities?.length)      url += '&city=' + encodeURIComponent(entities.cities[0]);
    if (entities?.categories?.length) {
      const catMap = { barber: 'Barber', nails: 'Paznokcie', hair: 'Fryzjer',
        massage: 'Masaż', beauty: 'Kosmetyczka', brows: 'Brwi i Rzęsy',
        physio: 'Fizjoterapia', tattoo: 'Tatuaż' };
      const cat = catMap[entities.categories[0]];
      if (cat) url += '&cat=' + encodeURIComponent(cat);
    }
    go(url);
  },

  search_category(categoryName, entities) {
    let url = BASE + '?page=explore&cat=' + encodeURIComponent(categoryName);
    if (entities?.cities?.length) url += '&city=' + encodeURIComponent(entities.cities[0]);
    go(url);
  },

  search_query(query, entities) {
    let url = BASE + '?page=explore&q=' + encodeURIComponent(query);
    if (entities?.cities?.length) url += '&city=' + encodeURIComponent(entities.cities[0]);
    go(url);
  },

  navigate_map(entities) {
    let url = BASE + '?page=map';
    if (entities?.cities?.length) url += '#city=' + encodeURIComponent(entities.cities[0]);
    go(url);
  },

  navigate_dashboard() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=dashboard');
  },

  navigate_admin() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=admin');
  },

  navigate_loyalty() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=loyalty');
  },

  navigate_favorites() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=favorites');
  },

  navigate_offers() {
    go(BASE + '?page=offers');
  },

  navigate_auth() {
    go(BASE + '?page=auth');
  },

  navigate_notifications() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=notifications');
  },

  navigate_profile() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=profile');
  },

  navigate_referral() {
    if (!window.App?.user) { go(BASE + '?page=auth'); return; }
    go(BASE + '?page=referral');
  },

  navigate_business() {
    go(BASE + '?page=business');
  },

  navigate_reviews() {
    go(BASE + '?page=reviews');
  },

  focus_search() {
    const el = document.getElementById('homeSearchService')
      || document.getElementById('exploreSearch')
      || document.querySelector('[type=search]');
    if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  },
};

const ACTION_LABELS = {
  search_salon: 'Otwieram wyszukiwanie salonów',
  show_map: 'Otwieram mapę',
  show_promotions: 'Otwieram promocje',
  my_bookings: 'Przechodzę do Twoich wizyt',
  book_appointment: 'Otwieram rezerwację',
  cancel_booking: 'Panel wizyt',
  navigate_home: 'Strona główna',
  navigate_explore: 'Eksploruj salony',
  navigate_admin: 'Panel właściciela',
  navigate_loyalty: 'Program lojalnościowy',
  navigate_favorites: 'Ulubione salony',
  navigate_notifications: 'Powiadomienia',
  navigate_profile: 'Mój profil',
  navigate_referral: 'Zaproś znajomego',
  show_business: 'Dla właścicieli salonów',
  pricing_query: 'Sprawdzam ceny',
  auth_login: 'Logowanie',
  auth_register: 'Rejestracja',
  rating_reviews: 'Opinie',
  category_barber: 'Barberzy',
  category_nails: 'Manicure / paznokcie',
  category_hair: 'Fryzjerzy',
  category_massage: 'Masaż & SPA',
  category_beauty: 'Kosmetyczki',
  category_brows: 'Brwi i rzęsy',
  category_physio: 'Fizjoterapia',
  category_tattoo: 'Tatuaż',
};

export function getActionLabel(intentId) {
  if (intentId.startsWith('category_')) {
    return ACTION_LABELS[intentId] || 'Szukam salonów';
  }
  return ACTION_LABELS[intentId] || 'Wykonuję akcję';
}

export function executeAction(intent, entities) {
  const id = intent.id;
  const param = intent.actionParam;

  if (id === 'search_salon')       return ACTIONS.navigate_explore(entities);
  if (id === 'show_map')           return ACTIONS.navigate_map(entities);
  if (id === 'show_promotions')    return ACTIONS.navigate_offers();
  if (id === 'my_bookings')        return ACTIONS.navigate_dashboard();
  if (id === 'book_appointment')   return ACTIONS.navigate_explore(entities);
  if (id === 'cancel_booking')     return ACTIONS.navigate_dashboard();
  if (id === 'navigate_home')      return ACTIONS.navigate_home();
  if (id === 'navigate_explore')   return ACTIONS.navigate_explore(entities);
  if (id === 'navigate_admin')     return ACTIONS.navigate_admin();
  if (id === 'navigate_loyalty')   return ACTIONS.navigate_loyalty();
  if (id === 'navigate_favorites') return ACTIONS.navigate_favorites();
  if (id === 'auth_login')              return ACTIONS.navigate_auth();
  if (id === 'auth_register')           return ACTIONS.navigate_auth();
  if (id === 'navigate_notifications')  return ACTIONS.navigate_notifications();
  if (id === 'navigate_profile')        return ACTIONS.navigate_profile();
  if (id === 'navigate_referral')       return ACTIONS.navigate_referral();
  if (id === 'show_business')           return ACTIONS.navigate_business();
  if (id === 'rating_reviews')          return ACTIONS.navigate_reviews();
  if (id === 'about_app')               return go(BASE + '?page=choice');

  if (id.startsWith('category_') && param) {
    return ACTIONS.search_category(param, entities);
  }
}
