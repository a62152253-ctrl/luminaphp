# LuminaPHP

Platforma do rezerwacji wizyt w salonach beauty — odpowiednik Booksy. Zbudowana w oparciu o PHP + Firebase + Vanilla JS ES Modules.

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Routing / Szablony | PHP 8 (XAMPP), Apache `.htaccess` |
| Baza danych | Firebase Firestore |
| Autoryzacja | Firebase Authentication (Google, Email/Password) |
| Pliki / Zdjęcia | Firebase Storage |
| Frontend | Vanilla JS ES Modules (bez frameworka) |
| Style | Custom CSS z design-systemem (zmienne CSS `--zinc-*`, `--accent`) |
| Ikony | Material Icons v140 — serwowane lokalnie (`fonts/material-icons.woff2`) |
| PWA | Service Worker (`sw.js`) + `manifest.json` |
| Push Notyfikacje | Firebase Cloud Messaging (FCM) |
| Deploy | Docker (`docker-compose.yml`) |
| Cloud Functions | Node.js (`functions/`) |

## Struktura projektu

```
luminaphp/
├── index.php               # Główny router (query param ?page=...)
├── bootstrap.php           # Inicjalizacja aplikacji
├── router.php              # Logika routingu
├── sw.js                   # Service Worker (PWA)
├── manifest.json           # PWA manifest
├── firebase.json           # Konfiguracja Firebase
├── firestore.rules         # Reguły bezpieczeństwa Firestore
├── firestore.indexes.json  # Indeksy Firestore
├── docker-compose.yml
│
├── pages/                  # Szablony PHP (12 stron)
│   ├── home.php            # Strona główna (hero, kategorie, polecane, promocje)
│   ├── explore.php         # Wyszukiwarka salonów z filtrami
│   ├── business.php        # Profil salonu (usługi, opinie, rezerwacja)
│   ├── booking.php         # Wizard rezerwacji (4 kroki)
│   ├── dashboard.php       # Panel klienta (moje wizyty)
│   ├── admin.php           # Panel właściciela salonu
│   ├── auth.php            # Logowanie / rejestracja
│   ├── setup.php           # Konfiguracja salonu (pierwsze uruchomienie)
│   ├── choice.php          # Wybór roli (klient vs właściciel)
│   ├── services.php        # Zarządzanie usługami
│   ├── employees.php       # Zarządzanie pracownikami
│   └── gallery.php         # Galeria zdjęć salonu
│
├── js/
│   ├── app.js              # Boot aplikacji, auth listener, window.App
│   ├── firebase-config.js  # Konfiguracja Firebase + re-eksport SDK
│   ├── modules/            # Logika wielokrotnego użytku
│   │   ├── utils.js        # toast(), confirmAction(), formatDatePl(), localStore()
│   │   ├── businesses.js   # Ładowanie salonów, cache (5 min TTL)
│   │   ├── booking-mgr.js  # Rezerwacje, anulowanie, eksport do kalendarza (.ics)
│   │   ├── auth-state.js   # Nasłuchiwanie stanu auth
│   │   ├── favorites.js    # Ulubione salony
│   │   ├── profile-mgr.js  # Edycja profilu użytkownika
│   │   ├── notifications-mgr.js
│   │   ├── fcm-push.js     # Firebase Cloud Messaging
│   │   ├── gallery-mgr.js
│   │   ├── map-view.js
│   │   ├── week-view.js    # Widok tygodniowy kalendarza
│   │   ├── chart-render.js # Wykresy w panelu raportów
│   │   ├── kpi-widgets.js
│   │   ├── mobile-nav.js
│   │   ├── reclaim-mgr.js  # Wykrywanie proxy/VPN
│   │   ├── geo.js
│   │   ├── csv-export.js
│   │   ├── review-admin.js
│   │   └── business-profile.js
│   ├── pages/              # Logika poszczególnych stron
│   │   ├── home-page.js
│   │   ├── explore-page.js
│   │   ├── business-page.js
│   │   ├── booking-page.js
│   │   ├── dashboard-page.js
│   │   ├── admin-page.js
│   │   ├── auth-page.js
│   │   ├── setup-page.js
│   │   ├── services-page.js
│   │   ├── employees-page.js
│   │   └── gallery-page.js
│   └── admin/              # Moduły panelu właściciela
│       ├── dashboard.js    # KPI, wykresy
│       ├── calendar.js     # Kalendarz wizyt
│       ├── clients.js
│       ├── services.js
│       ├── staff.js
│       ├── offers.js       # Promocje / oferty
│       ├── portfolio.js
│       ├── reviews.js
│       ├── reports.js
│       └── settings.js
│
├── css/
│   ├── style.css           # Główny arkusz (design system, komponenty)
│   ├── admin.css
│   ├── admin-enhanced.css
│   ├── auth.css
│   ├── business.css
│   ├── dashboard.css
│   ├── premium.css
│   └── material-icons.css  # Lokalne Material Icons (@font-face)
│
├── fonts/
│   └── material-icons.woff2  # Material Icons v140 (serwowane lokalnie)
│
├── functions/              # Firebase Cloud Functions (Node.js)
├── config/                 # Konfiguracja PHP (app, cache, db, firebase, mail, security)
├── storage/                # Runtime: cache, logi, uploady
└── img/                    # Statyczne zasoby graficzne
```

## Role użytkowników

| Rola | Opis | Panel |
|---|---|---|
| **Klient** | Przeglądanie salonów, rezerwacje, ulubione | `/dashboard` |
| **Właściciel** | Zarządzanie salonem, usługami, pracownikami, kalendarzem | `/admin` |

Nowy użytkownik jest kierowany na stronę `/choice` w celu wyboru roli. Właściciel bez skonfigurowanego salonu ląduje najpierw na `/setup`.

## Kolekcje Firestore

| Kolekcja | Zawartość |
|---|---|
| `users` | Profil użytkownika (rola, displayName, photoURL) |
| `businesses` | Dane salonu (nazwa, kategoria, miasto, status, ocena) |
| `services` | Usługi salonu (podkolekcja lub `businessId`) |
| `staff` | Pracownicy salonu |
| `appointments` | Wizyty (userId, businessId, staffId, date, time, status) |
| `promotions` | Oferty/promocje (active, discountPrice, originalPrice) |
| `reviews` | Opinie klientów |
| `favorites` | Ulubione salony |
| `notifications` | Powiadomienia użytkownika |

## Uruchomienie lokalne

1. Skopiuj projekt do katalogu `htdocs` w XAMPP.
2. Uruchom Apache w XAMPP.
3. Otwórz `http://localhost/luminaphp/`.

> Firebase działa bezpośrednio z przeglądarki (SDK v9 — modular). Nie jest potrzebny backend PHP do komunikacji z Firestore.

## Uruchomienie przez Docker

```bash
docker-compose up --build
```

## Wymagania

- PHP 8.0+
- Apache z `mod_rewrite`
- Projekt Firebase (Firestore, Auth, Storage, FCM)
- Node.js (tylko do Firebase Cloud Functions)

## Kluczowe szczegóły implementacji

- **Material Icons** — serwowane lokalnie z `fonts/material-icons.woff2`, nie z Google CDN (działa offline).
- **Potwierdzenia akcji** — `confirmAction()` z `utils.js` zastępuje natywny `window.confirm()` własnym dialogiem.
- **Toasty** — klikalne, z animacją znikania i przyciskiem zamknięcia.
- **Rezerwacja** — 4-krokowy wizard z persist stanem w `sessionStorage`.
- **Cache salonów** — in-memory + localStorage, TTL 5 minut.
- **Daty** — `formatDatePl()` wymusza godzinę 12:00 aby uniknąć przesunięcia strefy UTC.
- **Firebase Storage** — graceful fallback przy błędzie uploadu zdjęcia (zapisuje profil bez zmiany avatara).
- **Dark mode** — przełącznik zapisywany w localStorage, obsługiwany przez `[data-theme="dark"]` na `<html>`.
- **Offline banner** — wyświetlany automatycznie przy utracie połączenia.
