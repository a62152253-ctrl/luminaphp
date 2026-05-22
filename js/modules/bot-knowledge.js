/* ===================================================================
   LUMINA BOT — Polska baza wiedzy
   TF-IDF intent classifier knowledge base (~30k słów)
   Bez zewnętrznych API — wszystko działa w przeglądarce
   =================================================================== */

export const BOT_META = {
  name: 'Lumina Bot',
  version: '2.0',
  language: 'pl-PL',
  description: 'Asystent rezerwacji salonów beauty Lumina',
};

/* ---------- stop words ---------- */
export const STOP_WORDS = new Set([
  'i','w','z','do','na','po','od','za','by','się','że','nie','to','co',
  'jak','ale','czy','już','też','tak','ten','tej','tego','tej','temu',
  'tym','ta','te','jest','są','być','mam','masz','ma','mamy','mają',
  'go','mu','jej','ich','mi','mnie','się','sobie','nas','nam','was',
  'wam','im','je','czy','więc','oraz','albo','lub','ani','bo','aby',
  'żeby','ponieważ','gdyż','dlatego','jednak','choć','chociaż','jeśli',
  'jeżeli','gdy','kiedy','gdzie','skąd','dokąd','po','przy','przed',
  'przez','nad','pod','za','między','obok','koło','około','właśnie',
  'tylko','jeszcze','już','teraz','tutaj','tam','tu','bardzo','trochę',
  'wszystko','wszystkie','każdy','każda','każde','który','która','które',
  'który','jakiś','jakieś','jakaś','coś','czegoś','o','a','e','się',
]);

/* ---------- Polish diacritics normalizer ---------- */
export function normalizePL(str) {
  return str.toLowerCase()
    .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e')
    .replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o')
    .replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ').trim();
}

/* ---------- Entity patterns ---------- */
export const ENTITIES = {
  cities: [
    'warszawa','krakow','gdansk','poznan','wroclaw','lodz','katowice','lublin',
    'bialystok','torun','rzeszow','szczecin','bydgoszcz','gdynia','czestochowa',
    'radom','sosnowiec','zabrze','bytom','gliwice','kielce','olsztyn','opole',
    'zielona gora','gorzow','plock','elblag','walbrzych','rybnik','tarnow',
    'chorzow','koszalin','legnica','kalisz','grudziadz','jaworzno','slupsk',
    'jastrzebie','nowy sacz','jelenia gora','myslowice','piotrkow','oswiecim',
    'tychy','piekary','dabrowa','siemianowice','nowe miasto','wloclawek',
    'konin','przemysl','stalowa wola','zamosc','sanok','mielec','tczew',
    'ostroda','elblag','lomza','suwalki','siedlce','ostrowiec','sandomierz',
    'nowy targ','zakopane','wisla','krynica','sopot','trojmiasto',
    'gorny slask','malopolska','mazowsze','podkarpacie','wielkopolska',
    'dolny slask','pomorze','slask',
  ],
  categories: {
    barber: ['barber','barbershop','fryzjer męski','fryzjer meskie','strzyżenie',
      'strzyżenie włosów','golenie','broda','brodę','zarost'],
    nails: ['paznokcie','manicure','pedicure','hybryda','żel','akryl','lakier',
      'stylizacja paznokci','gel','acrylic','nail','nails','french'],
    hair: ['fryzjer','fryzjerka','fryzjerstwo','salon fryzjerski','strzyżenie',
      'farbowanie','koloryzacja','ondulacja','ombre','baleyage','keratyna',
      'prostowanie','trwała','upięcie','kok','warkocze','pasemka'],
    massage: ['masaż','masaz','masazysta','masażystka','relaksacyjny','sportowy',
      'głęboki','tajski','gorące kamienie','spa','wellness','aromaterapia',
      'refleksologia','drenaż','limfatyczny','shiatsu','klasyczny'],
    beauty: ['kosmetyczka','kosmetolog','kosmetologia','twarz','cera','pielęgnacja',
      'peeling','mikrodermabrazja','botox','hialuron','mezoterapia','oczyszczanie',
      'nawilżanie','lifting','dermatolog','laser','ipl','depilacja','wosk'],
    brows: ['brwi','rzęsy','laminacja','henna','microblading','makijaż permanentny',
      'przedłużanie rzęs','lifting rzęs','kępki','hybryda brwi','regulacja brwi',
      'farbowanie brwi','farbowanie rzęs','wax brwi'],
    physio: ['fizjoterapia','fizjoterapeuta','rehabilitacja','rehabilitant',
      'kręgosłup','ból pleców','ból kolan','ból barku','kontuzja','uraz',
      'kinesiotaping','masaż leczniczy','terapia manualna','ultradźwięki',
      'elektroterapia','krioterapia','ćwiczenia','terapia','leczenie'],
    tattoo: ['tatuaż','tatuator','studio tatuażu','tatuowanie','piercing',
      'przekłucie','tattoo','ink','tatuaże','realistyczny','lineart',
      'black and grey','colorwork','coverup','usuwanie tatuażu'],
  },
};

/* ===================================================================
   INTENTS — 25 kategorii, łącznie 500+ fraz treningowych
   =================================================================== */
export const INTENTS = [

  /* ──────────── POWITANIA ──────────── */
  {
    id: 'greeting',
    training: [
      'cześć','hej','hej hej','siema','siemanko','siemaneczko','hello','hi',
      'dzień dobry','dobry wieczór','dobranoc','witaj','witajcie','witam',
      'helo','cze','siemka','ej','yo','hey','oi','heja','hejka',
      'jest ktoś','hej boty','hej lumina','co słychać','jak się masz',
      'cześć lumina','witaj lumina','hej asystencie','hello lumina',
      'dobry wieczór lumina','dzień dobry lumino','cześć jak się masz',
      'hej jak leci','co tam słychać','jak tam','siema jak tam',
      'hej jest ktoś','halo jest ktoś tam','halo','haloooo','hejoooo',
      'dobry','dobranoc','cześć jesteś tu','hej co robisz','siema bot',
      'witaj asystencie','cześć asystencie','ej bot','hej boty lumina',
      'dzień dobry mam pytanie','hej chciałem zapytać','cześć potrzebuję pomocy',
      'witam chcę coś zapytać','hej mam sprawę','siema potrzebuję info',
    ],
    responses: [
      'Hej! Jestem Lumina Bot — Twój asystent rezerwacji beauty. Jak mogę pomóc?',
      'Cześć! Chętnie pomogę znaleźć salon lub umówić wizytę. O co chodzi?',
      'Dzień dobry! W czym mogę Ci dziś pomóc? Zapytaj o salony, usługi lub rezerwacje.',
      'Hej! Świetnie że jesteś! Pomogę znaleźć idealny salon w Twojej okolicy.',
      'Witaj w Lumina! Pytaj śmiało — wiem wszystko o salonach, usługach i rezerwacjach.',
    ],
    chips: ['Znajdź salon', 'Promocje', 'Moje wizyty', 'Jak działa Lumina'],
    action: null,
  },

  /* ──────────── POŻEGNANIA ──────────── */
  {
    id: 'goodbye',
    training: [
      'do widzenia','pa','pa pa','do zobaczenia','żegnaj','dobranoc','cześć pa',
      'nara','narazie','na razie','hej pa','bywaj','bywajcie','dobrej nocy',
      'do następnego','dziękuję do widzenia','dzięki pa','okay pa','ciao',
      'bye','bye bye','later','cya','tczm','buźka','buzia pa','całusy',
      'do następnej rozmowy','wrócę później','to tyle dziękuję','koniec',
      'to wszystko dziękuję','dziękuję wystarczy','okay już mam','już wiem',
      'dzięki za pomoc do widzenia','super dzięki pa','hej do zobaczenia',
      'miłego dnia do widzenia','do jutra','wracaj do pracy bot',
      'dobranoc miłych snów','miłej nocy','spokojnej nocy','good night',
    ],
    responses: [
      'Do widzenia! Miłej wizyty w salonie 💇',
      'Pa! Wróć kiedy będziesz potrzebować pomocy.',
      'Do zobaczenia! Mam nadzieję że znalazłeś/aś coś dla siebie.',
      'Bye! Jeśli masz jeszcze pytania — jestem tutaj.',
      'Dobranoc! Odpoczywaj dobrze, a jutro znajdziemy Ci idealny salon 😊',
    ],
    chips: [],
    action: null,
  },

  /* ──────────── POMOC ──────────── */
  {
    id: 'help',
    training: [
      'pomoc','pomóż','pomóż mi','help','nie wiem','co umiesz','co potrafisz',
      'co robisz','jak działa bot','pokaż mi co umiesz','lista komend',
      'jak korzystać','jak to działa','jak używać','czego szukać',
      'nie rozumiem','wyjaśnij','instrukcja','tutorial','przewodnik',
      'jak ci zadawać pytania','jak mam pisać','co mogę zapytać',
      'jakie pytania możesz odpowiedzieć','z czym możesz pomóc',
      'jaka jest twoja funkcja','do czego służysz','co to jest ten bot',
      'jak umówić wizytę przez bota','jak znaleźć salon przez bota',
      'jak rezerwować','how to','jakie polecenia','co wpisać',
      'jakie hasła','jakie słowa kluczowe','jak wyszukać salon',
      'pokaż opcje','wyświetl menu','menu','opcje','możliwości',
      'powiedz co możesz','możesz coś zaproponować','daj przykład',
    ],
    responses: [
      'Mogę Ci pomóc z: \n• 🔍 Wyszukiwaniem salonów (np. "barber w Warszawie")\n• 📅 Rezerwacją wizyt\n• 💰 Promocjami i rabatami\n• 🗺️ Mapą salonów\n• 📋 Twoimi wizytami\n\nPo prostu napisz czego szukasz!',
      'Oto co potrafię:\n— znajdź salon [miasto/kategoria]\n— pokaż promocje\n— moje wizyty\n— otwórz mapę\n— kategorie: barber, fryzjer, manicure, masaż, kosmetyczka...\n\nMówię też po polsku głosem — kliknij mikrofon 🎤',
      'Napisz mi czego szukasz, na przykład:\n"barber Kraków", "manicure hybrydowy", "masaż relaksacyjny Gdańsk"\nAlbo zapytaj: "jakie są promocje?", "moje wizyty", "pokaż mapę"',
    ],
    chips: ['Znajdź salon', 'Promocje', 'Moje wizyty', 'Otwórz mapę'],
    action: null,
  },

  /* ──────────── O APLIKACJI ──────────── */
  {
    id: 'about_app',
    training: [
      'co to jest lumina','o aplikacji','czym jest lumina','o lumina',
      'skąd jest lumina','kto stworzył','twórca aplikacji','o sobie',
      'czym się zajmuje lumina','co to lumina','opis aplikacji',
      'lumina info','lumina opis','lumina co to','dla kogo jest lumina',
      'do czego służy lumina','jak działa lumina','platforma lumina',
      'serwis lumina','portal lumina','strona lumina','aplikacja lumina',
      'lumina beauty','beauty platforma','platforma salonów',
      'rezerwacje salonów','system rezerwacji','booking beauty',
      'czym jest ten serwis','co to za strona','o tej aplikacji',
      'tell me about lumina','what is lumina','lumina app opis',
    ],
    responses: [
      'Lumina to nowoczesna platforma rezerwacji salonów beauty w Polsce. Łączymy klientów z barberami, fryzjerami, kosmetyczkami, masażystami i wieloma innymi specjalistami. Rezerwuj online w kilka sekund!',
      'Lumina to system rezerwacji online dla salonów beauty. Znajdziesz u nas barberów, fryzjerów, salony paznokci, masaż, kosmetykę, fizjoterapię i tatuaż. Bez telefonów, bez kolejek — rezerwujesz sam/a!',
      'Jestem Lumina Bot — asystent platformy Lumina. Lumina to miejsce gdzie w paru kliknięciach znajdziesz i zarezerwujesz wizytę w najlepszych salonach beauty w Twojej okolicy.',
    ],
    chips: ['Znajdź salon', 'Jak to działa', 'Zarejestruj się'],
    action: null,
  },

  /* ──────────── WYSZUKAJ SALON ──────────── */
  {
    id: 'search_salon',
    training: [
      'znajdź salon','szukaj salon','pokaż salony','szukam salonu',
      'gdzie jest salon','salon w','szukam dobrego salonu','polecasz salon',
      'jaki salon','który salon','dobry salon','najlepszy salon',
      'salon fryzjerski','salon kosmetyczny','salon w pobliżu',
      'salon niedaleko','salon blisko mnie','salon w okolicy',
      'znajdź mi salon','poszukaj salonu','pokaż mi salony',
      'chcę znaleźć salon','chciałbym znaleźć salon','chciałabym salon',
      'potrzebuję salonu','potrzebuję dobrego salonu','szukam miejsca',
      'gdzie pójść','gdzie mogę pójść','polecasz coś','co polecasz',
      'lista salonów','wszystkie salony','przejrzyj salony','eksploruj',
      'salony w Warszawie','salony w Krakowie','salony w Gdańsku',
      'salony w Poznaniu','salony we Wrocławiu','salony w Łodzi',
      'salony near me','nearby salons','gdzie mogę się ostrzyc',
      'gdzie mogę zrobić paznokcie','gdzie zrobić masaż','szukam miejsca na masaż',
      'jaki fryzjer','który fryzjer','dobry fryzjer','fryzjer w okolicy',
      'dobry barber','barber w okolicy','barber niedaleko',
      'polecacie coś','czy macie jakieś polecenia','najwyżej oceniane salony',
    ],
    responses: [
      'Szukam salonów dla Ciebie! Przechodzę do eksploracji...',
      'Zaraz znajdziemy coś odpowiedniego! Otwieramy stronę z salonami.',
      'Pokaż mi salony w Twojej okolicy!',
    ],
    chips: ['Barber', 'Fryzjer', 'Manicure', 'Masaż', 'Kosmetyczka'],
    action: 'navigate_explore',
  },

  /* ──────────── MAPA ──────────── */
  {
    id: 'show_map',
    training: [
      'mapa','pokaż mapę','otwórz mapę','mapa salonów','mapa salon',
      'gdzie są salony na mapie','lokalizacja salonów','pokaż na mapie',
      'salony na mapie','mapa beauty','mapa w okolicy','interaktywna mapa',
      'geography','gdzie','lokalizacja','adres','ulica','dzielnica',
      'mapa warszawy','mapa krakowa','mapa gdanska','mapa poznania',
      'widok mapy','widok geograficzny','geolokalizacja','GPS',
      'pokaż mi mapę','chcę zobaczyć mapę','gdzie są salony',
      'mapa z pinezkami','salony na mapie','mapa z filtrami',
      'jak dojechać','jak trafić','trasa do salonu','nawigacja',
      'pokaż salony na mapie','gdzie są salony w mieście',
      'widok mapy miasta','przeglądaj mapę','salony mapa interaktywna',
    ],
    responses: [
      'Otwieramy mapę salonów! Możesz filtrować po mieście, kategorii i odległości.',
      'Przechodzę do mapy salonów beauty!',
      'Na mapie zobaczysz wszystkie salony w Twojej okolicy. Możesz też włączyć mapę gęstości!',
    ],
    chips: ['Filtruj po mieście', 'Pokaż w pobliżu'],
    action: 'navigate_map',
  },

  /* ──────────── PROMOCJE ──────────── */
  {
    id: 'show_promotions',
    training: [
      'promocje','rabaty','zniżki','oferty','co jest taniej','okazje',
      'pokaż promocje','jakie są promocje','aktualne promocje','nowe promocje',
      'wyprzedaż','specjalne oferty','oferty specjalne','deal','deals',
      'najlepsze oferty','tanie salony','taniej','discount','promo',
      'czy są jakieś zniżki','promocja na masaż','promocja na manicure',
      'promocja na strzyżenie','promocja na fryzjera','jaka promocja',
      'co jest tańsze','coś taniego','budżetowe','najtańszy salon',
      'voucher','karta podarunkowa','bon','kupon','kupony',
      'oferta miesiąca','oferta tygodnia','weekend deal','flash sale',
      'ostatnia chwila','oferty last minute','wolne terminy promocja',
      'pokaż zniżki','sprawdź promocje','lista promocji','aktualne oferty',
      'co masz w ofercie','jakie oferty','co polecasz taniej',
    ],
    responses: [
      'Otwieramy stronę z promocjami i rabatami!',
      'Sprawdźmy aktualne oferty i zniżki na usługi beauty!',
      'Przechodzę do promocji — znajdziesz tu najlepsze deals!',
    ],
    chips: ['Wszystkie promocje', 'Barber promo', 'Fryzjer promo'],
    action: 'navigate_offers',
  },

  /* ──────────── MOJE WIZYTY ──────────── */
  {
    id: 'my_bookings',
    training: [
      'moje wizyty','moje rezerwacje','moja wizyta','moja rezerwacja',
      'kiedy mam wizytę','historia wizyt','panel klienta','mój panel',
      'sprawdź wizyty','lista wizyt','zaplanowane wizyty','przyszłe wizyty',
      'kiedy wizyta','termin wizyty','mój terminarz','moje terminy',
      'czy mam wizyty','mam zarezerwowane','co mam zarezerwowane',
      'check my bookings','moje spotkania','nadchodzące wizyty',
      'czy mam jakieś rezerwacje','kiedy mam zarezerwowane','mój grafik',
      'pokaż moje wizyty','wyświetl wizyty','historia rezerwacji',
      'ostatnie wizyty','poprzednie wizyty','archiwum wizyt',
      'chcę zobaczyć wizyty','gdzie są moje wizyty','panel użytkownika',
      'mój profil wizyty','ile mam wizyt','kiedy następna wizyta',
    ],
    responses: [
      'Otwieramy Twoje wizyty! Zobaczysz tam wszystkie zarezerwowane terminy.',
      'Przechodzę do panelu wizyt — sprawdzamy Twoje rezerwacje.',
      'Zaraz zobaczysz swoje wizyty i historię rezerwacji!',
    ],
    chips: ['Nadchodzące wizyty', 'Historia'],
    action: 'navigate_dashboard',
  },

  /* ──────────── REZERWACJA ──────────── */
  {
    id: 'book_appointment',
    training: [
      'umów wizytę','zarezerwuj','chcę się umówić','rezerwacja','umów mnie',
      'zrób rezerwację','chcę zarezerwować','jak zarezerwować','booking',
      'chcę umówić wizytę','chciałbym się umówić','chciałabym wizytę',
      'zarezerwuj mi wizytę','umów wizytę u fryzjera','wizyta u barbera',
      'zarezerwuj masaż','zarezerwuj manicure','chcę manicure',
      'umów mnie do fryzjera','umów mnie na masaż','wizyta dziś',
      'wizyta jutro','wizyta w weekend','termin na piątek','termin na sobotę',
      'kiedy można','dostępny termin','wolny termin','wolne miejsce',
      'czy jest wolne','czy można się umówić','umów teraz','book now',
      'chcę się zapisać','zapisz mnie','zapisz na wizytę','zapis',
      'jak się umówić','rezerwacja online','umów online','zarezerwuj online',
      'potrzebuję terminu','szukam terminu','chcę termin','wolne terminy',
    ],
    responses: [
      'Chętnie pomogę z rezerwacją! Wybierz salon i kliknij "Umów wizytę".',
      'Rezerwacja jest prosta! Znajdź salon, wybierz usługę i termin — gotowe!',
      'Przechodzę do eksploracji salonów gdzie możesz zarezerwować wizytę.',
    ],
    chips: ['Znajdź salon', 'Barber', 'Fryzjer', 'Masaż'],
    action: 'navigate_explore',
  },

  /* ──────────── ANULUJ WIZYTĘ ──────────── */
  {
    id: 'cancel_booking',
    training: [
      'anuluj wizytę','odwołaj wizytę','anuluj rezerwację','odwołaj rezerwację',
      'chcę anulować','jak anulować','cancel booking','cancel appointment',
      'nie mogę przyjść','nie przyjdę','musze odwołać','rezygnuję z wizyty',
      'zmień termin','przenieś wizytę','modyfikuj wizytę','zmień rezerwację',
      'chcę zmienić termin','inny termin','przeniesienie rezerwacji',
      'jak odwołać wizytę','gdzie anulować','anulowanie wizyty',
      'jak zrezygnować','rezygnacja z wizyty','wycofaj rezerwację',
      'delete booking','remove booking','usuń wizytę','kasuj wizytę',
    ],
    responses: [
      'Aby anulować wizytę, przejdź do zakładki "Moje Wizyty" i kliknij na rezerwację — tam znajdziesz opcję anulowania.',
      'Anulowanie wizyty jest możliwe z poziomu Twoich wizyt. Przejść teraz?',
      'Otwórz "Moje Wizyty" → wybierz rezerwację → "Anuluj wizytę". Pamiętaj że anulowanie jest możliwe zazwyczaj do 24h przed wizytą.',
    ],
    chips: ['Moje wizyty', 'Zmień termin'],
    action: 'navigate_dashboard',
  },

  /* ──────────── BARBER ──────────── */
  {
    id: 'category_barber',
    training: [
      'barber','barbershop','fryzjer meskie','fryzjer męski','strzyżenie meskie',
      'fryzura meska','golenie','broda','brodę','zarost','wąsy',
      'fade cut','undercut','mohawk','irokez','wycinanie brody',
      'pielęgnacja brody','olejek do brody','strzyżenie mężczyzn',
      'salon meskie','salon dla mężczyzn','men salon','men haircut',
      'haircut man','męska fryzura','nowa fryzura dla mężczyzny',
      'chcę iść do barbera','potrzebuję barbera','szukam barbera',
      'najlepszy barber','dobry barber','barber polecany','barber opinie',
      'barber w pobliżu','barber blisko','barber w mojej okolicy',
      'barber fade','taper fade','high fade','low fade','skin fade',
      'barber z wąsami','klasyczny barber','vintage barber','hipster barber',
      'brody strzyżenie','regulacja brody','modelowanie brody',
    ],
    responses: [
      'Szukam barberów w Twojej okolicy!',
      'Zaraz zobaczysz najlepszych barberów!',
      'Przeglądamy barbershopy!',
    ],
    chips: ['Barber w Warszawie', 'Barber w Krakowie', 'Wszystkie barbershopy'],
    action: 'search_category',
    actionParam: 'Barber',
  },

  /* ──────────── PAZNOKCIE ──────────── */
  {
    id: 'category_nails',
    training: [
      'paznokcie','manicure','pedicure','hybryda','żel','akryl',
      'gel nails','acrylic nails','nail art','lakier hybrydowy',
      'stylizacja paznokci','french manicure','ombre nails',
      'przedłużanie paznokci','nakładki na paznokcie','tipsy',
      'żel uv','gel uv','shellac','lakier','pomalować paznokcie',
      'wzorki na paznokcie','wzory na paznokcie','zdobienia',
      'pedicure klasyczny','pedicure z żelem','pedicure spa',
      'paznokcie hybrydowe','manicure hybrydowy','manicure klasyczny',
      'manicure japoniski','manicure japoński','cbbt manicure',
      'usuwanie hybrydowego','zdjęcie hybrydowego','zmiana koloru',
      'szukam salonu paznokci','salon nail','najlepszy nail studio',
      'nail studio','nail bar','paznokcie w okolicy','gdzie zrobić paznokcie',
    ],
    responses: [
      'Szukam salonów paznokci w Twojej okolicy!',
      'Zaraz znajdziemy najlepsze studio nail!',
      'Przeglądamy salony manicure i pedicure!',
    ],
    chips: ['Manicure hybrydowy', 'Pedicure', 'Nail art'],
    action: 'search_category',
    actionParam: 'Paznokcie',
  },

  /* ──────────── FRYZJER ──────────── */
  {
    id: 'category_hair',
    training: [
      'fryzjer','fryzjerka','fryzjerstwo','salon fryzjerski','hair salon',
      'strzyżenie włosów','haircut','obciąć','uciąć','przyciąć',
      'farbowanie','koloryzacja','kolor','nowy kolor','zmienić kolor',
      'ombre','baleyage','balayage','sombre','highlights','pasemka',
      'keratynowe prostowanie','prostowanie włosów','trwała ondulacja',
      'upięcie','kok','warkocze','plecenie','warkocz',
      'strzyżenie damskie','fryzura damska','nowa fryzura','fryzura modna',
      'fryzura dla kobiet','fryzura dla dziewczyny','najnowsze trendy',
      'fryzura bob','fryzura long','fryzura krótka','pixie cut',
      'blow dry','modelowanie','blow out','suszenie','stylizacja włosów',
      'szampony lecznicze','botox dla włosów','olaplex','keratyna',
      'pielęgnacja włosów','regeneracja włosów','nawilżanie włosów',
      'salony fryzjerskie','dobry fryzjer','fryzjer opinie','fryzjer polecany',
    ],
    responses: [
      'Szukam salonów fryzjerskich w Twojej okolicy!',
      'Zaraz zobaczysz najlepszych fryzjerów!',
      'Przeglądamy salony fryzjerskie!',
    ],
    chips: ['Fryzjer w Warszawie', 'Farbowanie', 'Strzyżenie'],
    action: 'search_category',
    actionParam: 'Fryzjer',
  },

  /* ──────────── MASAŻ ──────────── */
  {
    id: 'category_massage',
    training: [
      'masaż','masaz','masazysta','masażystka','masażysta',
      'masaż relaksacyjny','masaż klasyczny','masaż sportowy',
      'masaż głęboki','masaż tajski','masaż gorącymi kamieniami',
      'hot stone','swedish massage','deep tissue','sports massage',
      'spa','wellness','aromaterapia','masaż aromaterapia',
      'refleksologia','refleksologia stóp','masaż stóp',
      'drenaż limfatyczny','limfatyczny masaż','lymph massage',
      'shiatsu','reiki','akupresura','akupunktura',
      'masaż leczniczy','masaż terapeutyczny','masaż rehabilitacyjny',
      'odstresować','relaks','zrelaksować','odstresowanie',
      'bóle mięśni','napięcie mięśni','sztywność karku','ból karku',
      'ból pleców masaż','masaż na ból pleców','masaż kręgosłupa',
      'salon spa','centrum spa','hotel spa','wellness centrum',
      'masaż w okolicy','gdzie na masaż','chcę masaż','potrzebuję masażu',
    ],
    responses: [
      'Szukam miejsc na masaż w Twojej okolicy!',
      'Zaraz zobaczysz najlepsze salony masażu i spa!',
      'Przeglądamy masaże i salony wellness!',
    ],
    chips: ['Masaż relaksacyjny', 'Spa', 'Masaż tajski'],
    action: 'search_category',
    actionParam: 'Masaż',
  },

  /* ──────────── KOSMETYCZKA ──────────── */
  {
    id: 'category_beauty',
    training: [
      'kosmetyczka','kosmetolog','kosmetologia','twarz','cera',
      'pielęgnacja twarzy','zabieg na twarz','oczyszczanie twarzy',
      'peeling','mikrodermabrazja','mezoterapia','botox','wypełniacz',
      'hialuron','kwas hialuronowy','lifting twarzy','lifting bez skalpela',
      'laser','ipl','fotorejuweynacja','foto odmłodzenie',
      'depilacja laserowa','depilacja woskiem','depilacja wosk','woskowanie',
      'cerę pielęgnacja','nawilżanie','anti aging','starzenie',
      'trądzik leczenie','cerę trądzikowa','cerę tłusta','cerę sucha',
      'maseczka na twarz','zabieg tlenowy','zabieg dotleniający',
      'oczyszczanie manualne','oczyszczanie ultradźwiękami','salon urody',
      'kosmetyki naturalne','organiczne zabiegi','beauty salon',
      'beauty treatment','face treatment','aesthetic medicine',
      'medycyna estetyczna','chirurgia estetyczna','dermatologia estetyczna',
      'zadbana cera','piękna skóra','zdrowa skóra','dobra kosmetyczka',
    ],
    responses: [
      'Szukam kosmetyczek i salonów kosmetologicznych!',
      'Zaraz zobaczysz najlepsze salony urody!',
      'Przeglądamy kosmetyczki i salony kosmetyczne!',
    ],
    chips: ['Oczyszczanie twarzy', 'Depilacja', 'Mezoterapia'],
    action: 'search_category',
    actionParam: 'Kosmetyczka',
  },

  /* ──────────── BRWI I RZĘSY ──────────── */
  {
    id: 'category_brows',
    training: [
      'brwi','rzęsy','laminacja brwi','laminacja rzęs','henna brwi',
      'microblading','makijaż permanentny brwi','pmu brwi',
      'przedłużanie rzęs','lifting rzęs','kępki','kępki rzęs',
      'hybryda rzęs','hybryda brwi','regulacja brwi','kształtowanie brwi',
      'farbowanie brwi','farbowanie rzęs','henna rzęs',
      'wax brwi','wosk brwi','depilacja brwi','kontur brwi',
      'brwi z woskiem','stylizacja brwi','design brwi',
      'volumetryczne rzęsy','objętościowe rzęsy','1 do 1',
      'rzęsy silk','rzęsy mink','rzęsy synthetic','rzęsy naturalne',
      'rzęsy po jednej','klasyczne rzęsy','russian volume',
      'szukam specjalisty brwi','gdzie zrobić rzęsy','gdzie zrobić brwi',
      'gdzie zrobić microblading','ile kosztuje microblading',
    ],
    responses: [
      'Szukam specjalistów od brwi i rzęs!',
      'Zaraz zobaczysz najlepsze salony brwi i rzęs!',
      'Przeglądamy studia brwi i rzęs!',
    ],
    chips: ['Microblading', 'Rzęsy', 'Laminacja brwi'],
    action: 'search_category',
    actionParam: 'Brwi i Rzęsy',
  },

  /* ──────────── FIZJOTERAPIA ──────────── */
  {
    id: 'category_physio',
    training: [
      'fizjoterapia','fizjoterapeuta','rehabilitacja','rehabilitant',
      'kręgosłup','ból pleców','ból kolan','ból barku','ból biodra',
      'kontuzja','uraz','skręcenie','zwichnięcie','naciągnięcie',
      'kinesiotaping','taping','masaż leczniczy','terapia manualna',
      'mobilizacja','manipulacja','chiropraktyk','kręgarz',
      'ultradźwięki','elektroterapia','krioterapia','laseroterapia',
      'ćwiczenia rehabilitacyjne','ćwiczenia lecznicze','fizjoterapeuta sportowy',
      'kontuzja sportowa','sport fizjoterapia','powrót do sportu',
      'ból szyi','kark','cervical','lędźwiowy','lumbago',
      'dyskopatia','przepuklina dyskowa','rwa kulszowa','ischias',
      'choroba zwyrodnieniowa','artroza','artretyzm','reumatyzm',
      'szukam fizjoterapeuty','dobry fizjoterapeuta','fizjoterapeuta opinie',
      'gabinet fizjoterapii','centrum rehabilitacji','klinika fizjoterapii',
    ],
    responses: [
      'Szukam fizjoterapeutów i gabinetów rehabilitacji!',
      'Zaraz zobaczysz najlepszych fizjoterapeutów!',
      'Przeglądamy gabinety fizjoterapii i rehabilitacji!',
    ],
    chips: ['Fizjoterapeuta', 'Rehabilitacja', 'Masaż leczniczy'],
    action: 'search_category',
    actionParam: 'Fizjoterapia',
  },

  /* ──────────── TATUAŻ ──────────── */
  {
    id: 'category_tattoo',
    training: [
      'tatuaż','tatuator','studio tatuażu','tatuowanie','tattoo',
      'tatuaże','chcę tatuaż','zrobić tatuaż','zapisać do tatuatora',
      'realistyczny tatuaż','lineart','black and grey','blackwork',
      'colorwork','akwarela tatuaż','geometric tattoo','neo traditional',
      'traditional tattoo','japonski styl','japanese tattoo',
      'new school','fineline','dotwork','tribal',
      'coverup','zakrycie tatuażu','poprawka tatuażu','retusz',
      'usuwanie tatuażu','laserowe usuwanie tatuażu','laser tattoo removal',
      'piercing','przekłucie','kolczyk','septum','nostril','helix',
      'industrial','tragus','daith','rook','labret','monroe','lip ring',
      'tatuaż na ręce','tatuaż na noga','tatuaż na plecach',
      'tatuaż na szyi','tatuaż na nadgarstku','tatuaż mały','tatuaż duży',
      'dobry tatuator','polecany tatuator','tatuator opinie','gdzie zrobić tatuaż',
    ],
    responses: [
      'Szukam studiów tatuażu w Twojej okolicy!',
      'Zaraz zobaczysz najlepszych tatuatorów!',
      'Przeglądamy studia tatuażu i piercingu!',
    ],
    chips: ['Studio tatuażu', 'Piercing', 'Coverup'],
    action: 'search_category',
    actionParam: 'Tatuaż',
  },

  /* ──────────── NAWIGACJA — HOME ──────────── */
  {
    id: 'navigate_home',
    training: [
      'strona główna','główna','wróć do głównej','home','homepage',
      'idź do głównej','przejdź do głównej','otwórz główną',
      'wróć na start','start','powrót na początek','na początek',
      'główna strona','otwórz home','wejdź na główną',
      'wróć do domu','idź do domu','home page','main page',
    ],
    responses: [
      'Przechodząc na stronę główną!',
      'Otwieramy stronę główną Lumina!',
    ],
    chips: [],
    action: 'navigate_home',
  },

  /* ──────────── NAWIGACJA — EKSPLORUJ ──────────── */
  {
    id: 'navigate_explore',
    training: [
      'eksploruj','eksploracja','wszystkie salony','przeglądaj salony',
      'lista salonów','pokaż wszystkie','wyszukaj','explore',
      'idź do eksploracji','otwórz eksploruj','przejdź do eksploracji',
      'szukaj salonu','wyszukaj salon','katalog salonów','browse salons',
    ],
    responses: [
      'Otwieramy stronę eksploracji salonów!',
      'Przechodzę do wyszukiwarki salonów!',
    ],
    chips: [],
    action: 'navigate_explore',
  },

  /* ──────────── NAWIGACJA — ADMIN ──────────── */
  {
    id: 'navigate_admin',
    training: [
      'panel właściciela','panel biznesu','panel salonu','zarządzaj salonem',
      'mój panel','dashboard właściciela','admin panel','panel admin',
      'zarządzanie salonem','otwórz panel','idź do panelu','przejdź do panelu',
      'panel właściciel','panel biznesowy','business panel','owner panel',
      'dodaj usługę','zarządzaj usługami','moje usługi','zarządzaj pracownikami',
      'kalendarz wizyt','moje rezerwacje właściciel','raport','raporty',
    ],
    responses: [
      'Przechodzę do panelu właściciela salonu!',
      'Otwieramy panel zarządzania salonem!',
    ],
    chips: [],
    action: 'navigate_admin',
  },

  /* ──────────── LOJALNOŚĆ ──────────── */
  {
    id: 'navigate_loyalty',
    training: [
      'lojalność','program lojalnościowy','punkty lojalnościowe','punkty',
      'zbieraj punkty','moje punkty','ile mam punktów','punkty za wizytę',
      'nagrody','nagroda','jak zdobyć punkty','jak zbierać punkty',
      'loyalty','loyalty program','punkty za rezerwację',
      'wymień punkty','co mogę za punkty','ile punktów mam',
      'program nagród','reward program','stamps','pieczątki',
      'vip status','złoty klient','srebrny klient','brązowy klient',
    ],
    responses: [
      'Otwieramy Twój program lojalnościowy!',
      'Sprawdzamy Twoje punkty lojalnościowe!',
      'Przechodzę do programu lojalności!',
    ],
    chips: ['Moje punkty', 'Jak zdobywać'],
    action: 'navigate_loyalty',
  },

  /* ──────────── ULUBIONE ──────────── */
  {
    id: 'navigate_favorites',
    training: [
      'ulubione','moje ulubione','ulubione salony','zapisane salony',
      'bookmarki','zachowane','serduszko','heartsy','polubione',
      'salon który polubiłem','salon który lubię','lista ulubionych',
      'favorites','saved','wishlist','zapisz salon','moje serduszka',
      'co polubiłem','co dodałem do ulubionych','gdzie są ulubione',
    ],
    responses: [
      'Otwieramy Twoje ulubione salony!',
      'Przechodzę do zakładki ulubionych!',
    ],
    chips: [],
    action: 'navigate_favorites',
  },

  /* ──────────── OPINIE ──────────── */
  {
    id: 'rating_reviews',
    training: [
      'opinie','recenzje','oceny','ocena salonu','co mówią klienci',
      'jak ocenić','wystaw opinię','napisz recenzję','oceń salon',
      'ile gwiazdek','gwiazdki','rating','review','reviews',
      'poczytać opinie','przeczytać opinie','jakie opinie','co ludzie piszą',
      'czy są opinie','opinie o salonie','recenzje salonu','zaufanie',
      'sprawdź opinie','opinie klientów','customer reviews','top rated',
    ],
    responses: [
      'Opinie znajdziesz na stronie każdego salonu — kliknij w salon i przewiń do sekcji "Opinie".',
      'Każdy salon ma sekcję z ocenami i recenzjami klientów. Możesz też dodać własną opinię po wizycie!',
      'Chcesz zobaczyć najwyżej oceniane salony? Użyj filtra oceny w wyszukiwarce!',
    ],
    chips: ['Szukaj z filtrem ocen', 'Napisz opinię'],
    action: null,
  },

  /* ──────────── ZALOGUJ ──────────── */
  {
    id: 'auth_login',
    training: [
      'zaloguj','zaloguj się','login','wejdź','zalogować','logowanie',
      'moje konto','wejdź na konto','mam konto','mam już konto',
      'sign in','log in','zaloguj mnie','otwórz logowanie',
      'chcę się zalogować','jak się zalogować','gdzie logowanie',
    ],
    responses: [
      'Przechodzę do strony logowania!',
      'Otwieramy formularz logowania!',
    ],
    chips: [],
    action: 'navigate_auth',
  },

  /* ──────────── REJESTRACJA ──────────── */
  {
    id: 'auth_register',
    training: [
      'rejestracja','zarejestruj','utwórz konto','nowe konto','sign up',
      'register','nie mam konta','chcę konto','założ konto','stwórz konto',
      'jak się zarejestrować','jak założyć konto','jak stworzyć konto',
      'create account','new account','dołącz do lumina','zapisz się',
    ],
    responses: [
      'Przechodzę do rejestracji — w paru krokach utwórz konto!',
      'Otwieramy formularz rejestracji!',
    ],
    chips: [],
    action: 'navigate_auth',
  },

  /* ──────────── POWIADOMIENIA ──────────── */
  {
    id: 'navigate_notifications',
    training: [
      'powiadomienia','powiadomienie','notyfikacje','notyfikacja','alerty','alert',
      'moje powiadomienia','sprawdź powiadomienia','nowe powiadomienia','lista powiadomień',
      'co nowego','co się dzieje','notifications','inbox','bell','dzwonek',
      'mam jakieś powiadomienie','czy są powiadomienia','przeczytaj powiadomienia',
      'otwórz powiadomienia','idź do powiadomień','gdzie powiadomienia',
      'nowe wiadomości','wiadomości z aplikacji','alerty od salonów',
    ],
    responses: [
      'Otwieramy Twoje powiadomienia!',
      'Przechodzę do centrum powiadomień!',
      'Sprawdzamy co nowego w Twoich powiadomieniach!',
    ],
    chips: [],
    action: 'navigate_notifications',
  },

  /* ──────────── PROFIL / USTAWIENIA ──────────── */
  {
    id: 'navigate_profile',
    training: [
      'profil','profilu','mój profil','edytuj profil','ustawienia konta',
      'moje konto','dane konta','zmień dane','zmień hasło','zmień email',
      'zmień zdjęcie','awatar','zdjęcie profilowe','ustawienia','settings',
      'moje dane','zaktualizuj profil','account settings','account profile',
      'jak zmienić hasło','zmienić numer telefonu','zmienić imię',
      'edycja konta','edycja profilu','otwórz profil','idź do profilu',
      'ustawienia aplikacji','preferencje','moje preferencje',
      'usuń konto','wyloguj','wyloguj się','logout','sign out',
    ],
    responses: [
      'Otwieramy Twój profil!',
      'Przechodzę do ustawień konta!',
      'Zaraz możesz edytować swoje dane!',
    ],
    chips: ['Zmień hasło', 'Edytuj dane'],
    action: 'navigate_profile',
  },

  /* ──────────── ZAPROŚ ZNAJOMEGO ──────────── */
  {
    id: 'navigate_referral',
    training: [
      'zaproś znajomego','zaproszenie','zaproś','poleć lumina','poleć aplikację',
      'referal','referral','kod polecający','kod zaproszenia','mój kod',
      'zaproś przyjaciela','zaproś koleżankę','zaproś kolege','poleć komuś',
      'invite friend','invite','zaproszę znajomego','podziel się aplikacją',
      'jak zaprosić','earn credits','zdobywaj kredyty przez zaproszenie',
      'program poleceń','program zapraszania','bonus za zaproszenie',
      'daj znajomemu kod','udostępnij kod','darmowe punkty za zaproszenie',
    ],
    responses: [
      'Otwieramy program poleceń — zaproś znajomych i zdobywaj punkty!',
      'Przechodzę do referrali — zaproś i zgarnij nagrody!',
      'Twój kod zaproszenia czeka! Sprawdzamy stronę referrals.',
    ],
    chips: ['Mój kod', 'Jak to działa'],
    action: 'navigate_referral',
  },

  /* ──────────── DLA WŁAŚCICIELA / BIZNES ──────────── */
  {
    id: 'show_business',
    training: [
      'chcę dodać salon','dodaj mój salon','zarejestruj salon','mam salon',
      'jestem właścicielem','jestem fryzjerem','jestem barberем','jestem masażystą',
      'prowadzę salon','prowadzę barbershop','mam studio','dla właścicieli',
      'dla biznesu','dla firm','partner lumina','zostań partnerem',
      'dodaj swój salon','dołącz jako salon','zarejestruj biznes',
      'jak dodać salon','jak się zarejestrować jako salon','rejestracja salonu',
      'chcę być na lumina','chcę wystawiać wizyty','chcę przyjmować rezerwacje',
      'business','partner','właściciel','biznesowe konto','konto salonu',
      'otwórz swój salon na lumina','jak działa lumina dla salonów',
      'komisja','prowizja lumina','ile kosztuje lumina dla salonu',
    ],
    responses: [
      'Chcesz dołączyć do Luminy jako salon? Przechodzę do strony dla partnerów!',
      'Świetnie! Otwieramy stronę rejestracji salonu — dołącz do Luminy i zacznij przyjmować rezerwacje online!',
      'Przechodzę do panelu biznesowego — zarejestruj swój salon!',
    ],
    chips: ['Zarejestruj salon', 'Jak to działa', 'Kontakt'],
    action: 'navigate_business',
  },

  /* ──────────── CENNIK / CENY ──────────── */
  {
    id: 'pricing_query',
    training: [
      'ile kosztuje','cena','cennik','ceny','ile to kosztuje','jaka cena',
      'kosztuje manicure','cena manicure','ile za strzyżenie','cena masażu',
      'ile za wizytę','ile zapłacę','jak drogo','czy to jest drogie',
      'najtaniej','najtańsza opcja','budżet','ile wydać','cena barber',
      'cena fryzjer','ile kosztuje botox','ile kosztuje laser',
      'price','prices','pricing','how much','koszt','koszty','kosztuje',
      'średnia cena','zakresy cenowe','przedział cenowy','taryfa',
      'bezpłatny','za darmo','darmowy','free','zniżka studencka',
      'ile wydać na masaż','ile kosztuje pedicure','cena hybrydy',
      'cennik salonów','sprawdź ceny','porównaj ceny','price list',
    ],
    responses: [
      'Ceny usług są różne w każdym salonie — znajdziesz je na stronie każdego salonu. Chcesz żebym znalazł/a salony w jakiejś kategorii?\n\nPrzykładowe przedziały:\n• Barber: 50–150 zł\n• Manicure hybrydowy: 80–180 zł\n• Masaż 60 min: 100–250 zł\n• Strzyżenie damskie: 60–200 zł',
      'Ceny zależą od salonu i usługi. Sprawdź stronę konkretnego salonu by zobaczyć dokładny cennik. Mogę Ci znaleźć salon — podaj kategorię lub miasto!',
      'Każdy salon sam ustala ceny — kliknij w salon, aby zobaczyć pełny cennik usług. Szukasz czegoś konkretnego?',
    ],
    chips: ['Porównaj salony', 'Promocje', 'Znajdź najtańszy'],
    action: null,
  },

  /* ──────────── FALLBACK ──────────── */
  {
    id: 'fallback',
    training: [
      'xyz abc','asdasd','ndfjndf','coś losowego','nie wiem co','kto ty',
      'nieznane','inne','random','test','test123','aaa','bbb',
    ],
    responses: [
      'Nie do końca rozumiem — spróbuj inaczej, np. "barber w Warszawie" albo "pokaż promocje".',
      'Hmm, nie jestem pewien/pewna o co chodzi. Spróbuj napisać "fryzjer", "masaż", "moje wizyty" itp.',
      'Mogę pomóc z salonami beauty, rezerwacjami i promocjami. Spróbuj napisać np. "manicure Kraków".',
      'Nie zrozumiałem/am. Napisz na przykład "znajdź barbera" albo "pokaż mapę" — postaram się pomóc!',
    ],
    chips: ['Znajdź salon', 'Promocje', 'Pomoc'],
    action: null,
  },
];

/* ---------- Pre-computed flat corpus for TFIDF ---------- */
export function buildCorpus() {
  const docs = [];
  for (const intent of INTENTS) {
    const text = intent.training.join(' ');
    docs.push({ id: intent.id, text });
  }
  return docs;
}
