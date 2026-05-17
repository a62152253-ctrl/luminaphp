<?php /* Panel Salonu — Business Dashboard */ ?>

<div class="biz-layout">

  <!-- ===== SIDEBAR ===== -->
  <aside class="biz-sidebar">
    <div class="biz-sidebar-brand">
      <div class="biz-sidebar-icon"><span class="material-icons">storefront</span></div>
      <div>
        <div id="adminBizName" class="biz-sidebar-name">Mój Salon</div>
        <div id="adminBizCategory" class="biz-sidebar-badge">—</div>
      </div>
    </div>

    <div class="biz-sidebar-owner">
      <img id="adminUserAvatar" src="" alt="Avatar właściciela" class="biz-sidebar-avatar">
      <div>
        <div id="adminUserName" class="biz-sidebar-owner-name">Użytkownik</div>
        <div class="biz-sidebar-owner-role">Administrator</div>
      </div>
    </div>

    <nav class="biz-nav">
      <a href="#" class="biz-nav-link" data-btab="home">
        <span class="material-icons">dashboard</span> Panel główny
      </a>
      <a href="#" class="biz-nav-link" data-btab="calendar">
        <span class="material-icons">calendar_today</span> Kalendarz
        <span class="biz-nav-badge hidden" id="pendingBadge">0</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="clients">
        <span class="material-icons">people</span> Klienci
      </a>
      <a href="#" class="biz-nav-link" data-btab="services">
        <span class="material-icons">content_cut</span> Usługi
      </a>
      <a href="#" class="biz-nav-link" data-btab="staff">
        <span class="material-icons">badge</span> Pracownicy
      </a>

      <div class="biz-nav-separator"></div>

      <a href="#" class="biz-nav-link" data-btab="reports">
        <span class="material-icons">bar_chart</span> Raporty
      </a>
      <a href="#" class="biz-nav-link" data-btab="offers">
        <span class="material-icons">local_offer</span> Oferty
      </a>
      <a href="#" class="biz-nav-link" data-btab="bizreviews">
        <span class="material-icons">star_half</span> Opinie
      </a>
      <a href="#" class="biz-nav-link" data-btab="portfolio">
        <span class="material-icons">photo_library</span> Portfolio
      </a>

      <div class="biz-nav-separator"></div>

      <a href="#" class="biz-nav-link" data-btab="settings">
        <span class="material-icons">settings</span> Ustawienia
      </a>
      <a href="#" class="biz-nav-link" onclick="logout();return false" style="color:var(--zinc-400)">
        <span class="material-icons">logout</span> Wyloguj
      </a>
    </nav>
  </aside>

  <!-- ===== MAIN ===== -->
  <main class="biz-main" id="adminContent">

    <!-- ===== TOP STATS BAR ===== -->
    <div class="biz-stats-bar">
      <div class="biz-stat">
        <div class="biz-stat-icon"><span class="material-icons">today</span></div>
        <div><div class="biz-stat-val" id="adminStatToday">0</div><div class="biz-stat-label">Dziś</div></div>
      </div>
      <div class="biz-stat">
        <div class="biz-stat-icon"><span class="material-icons">payments</span></div>
        <div><div class="biz-stat-val" id="adminStatRevenue">0 zł</div><div class="biz-stat-label">Przychód</div></div>
      </div>
      <div class="biz-stat">
        <div class="biz-stat-icon"><span class="material-icons">pending_actions</span></div>
        <div><div class="biz-stat-val" id="adminStatPending">0</div><div class="biz-stat-label">Oczekujące</div></div>
      </div>
      <div class="biz-stat">
        <div class="biz-stat-icon"><span class="material-icons">event_available</span></div>
        <div><div class="biz-stat-val" id="adminStatTotal">0</div><div class="biz-stat-label">Łącznie</div></div>
      </div>
      <button class="biz-export-btn" onclick="window.exportAppts?.()">
        <span class="material-icons">download</span> CSV
      </button>
    </div>

    <!-- ===== TAB: HOME ===== -->
    <div class="biz-tab hidden" data-btab="home">
      <div class="biz-tab-header">
        <h2 id="overviewGreeting">Dzień dobry!</h2>
      </div>
      <div class="home-grid">
        <div class="home-main">
          <div class="stats-grid" style="margin-bottom:2rem">
            <div class="stat-card">
              <div class="stat-card-icon" style="background:rgba(99,102,241,.1);color:#6366f1"><span class="material-icons">calendar_today</span></div>
              <div class="stat-card-val" id="hStatToday">—</div>
              <div class="stat-card-label">Wizyty dziś</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background:rgba(245,158,11,.1);color:#d97706"><span class="material-icons">pending_actions</span></div>
              <div class="stat-card-val" id="hStatPending">—</div>
              <div class="stat-card-label">Oczekujące</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background:rgba(34,197,94,.1);color:#16a34a"><span class="material-icons">payments</span></div>
              <div class="stat-card-val" id="hStatRevenue">—</div>
              <div class="stat-card-label">Przychód dziś</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background:rgba(244,63,94,.1);color:var(--accent)"><span class="material-icons">event_note</span></div>
              <div class="stat-card-val" id="hStatTotal">—</div>
              <div class="stat-card-label">Łącznie wizyt</div>
            </div>
          </div>

          <div class="bookings-list">
            <div class="bookings-list-header">
              <h3>Nadchodzące wizyty</h3>
            </div>
            <div id="hUpcomingList"><div class="spinner" style="margin:2rem auto"></div></div>
          </div>
        </div>
        <div class="home-side">
          <div class="home-widget">
            <h4>Szybkie akcje</h4>
            <div id="hQuickActions"></div>
          </div>
          <div class="home-widget" style="margin-top:1.5rem">
            <div id="hStaffOccupancy"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== TAB: CALENDAR ===== -->
    <div class="biz-tab hidden" data-btab="calendar">
      <div class="biz-tab-header">
        <h2>Kalendarz</h2>
        <div class="biz-view-toggle">
          <button class="biz-view-btn active" id="viewDayBtn">
            <span class="material-icons">view_day</span> Dzień
          </button>
          <button class="biz-view-btn" id="viewWeekBtn">
            <span class="material-icons">view_week</span> Tydzień
          </button>
        </div>
        <div class="biz-cal-nav">
          <button class="biz-cal-btn" id="calPrev"><span class="material-icons">chevron_left</span></button>
          <span class="biz-cal-date" id="calDateLabel"></span>
          <button class="biz-cal-btn" id="calNext"><span class="material-icons">chevron_right</span></button>
          <button class="biz-cal-btn biz-cal-today" id="calToday">Dziś</button>
        </div>
        <button class="btn btn-accent biz-add-btn" onclick="window.calEditAppt?.()">
          <span class="material-icons">add</span> Nowa wizyta
        </button>
      </div>

      <div class="biz-appts-filters">
        <button class="biz-filter-btn active" data-fstatus="">Wszystkie</button>
        <button class="biz-filter-btn" data-fstatus="zaplanowana">Zaplanowane</button>
        <button class="biz-filter-btn" data-fstatus="potwierdzona">Potwierdzone</button>
        <button class="biz-filter-btn" data-fstatus="w trakcie">W trakcie</button>
        <button class="biz-filter-btn" data-fstatus="zakończona">Zakończone</button>
        <button class="biz-filter-btn" data-fstatus="nie przyszedł">No-show</button>
      </div>

      <div id="calDayView"></div>
      <div id="calWeekView" class="hidden"></div>
    </div>

    <!-- ===== TAB: CLIENTS ===== -->
    <div class="biz-tab hidden" data-btab="clients">
      <div class="biz-tab-header">
        <h2>Klienci</h2>
        <input type="search" id="clientSearch" class="settings-input"
          placeholder="Szukaj po imieniu lub telefonie…"
          style="max-width:18rem;padding:.5rem 1rem;font-size:.875rem">
      </div>
      <div id="clientsList"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- ===== TAB: SERVICES ===== -->
    <div class="biz-tab hidden" data-btab="services">
      <div class="biz-tab-header">
        <h2>Usługi</h2>
        <button class="btn btn-accent biz-add-btn" onclick="bizOpenServiceModal()">
          <span class="material-icons">add</span> Dodaj usługę
        </button>
      </div>
      <div id="servicesList"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- ===== TAB: STAFF ===== -->
    <div class="biz-tab hidden" data-btab="staff">
      <div class="biz-tab-header">
        <h2>Pracownicy</h2>
        <button class="btn btn-accent biz-add-btn" onclick="bizOpenStaffModal()">
          <span class="material-icons">person_add</span> Dodaj pracownika
        </button>
      </div>
      <div id="staffList"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- ===== TAB: REPORTS ===== -->
    <div class="biz-tab hidden" data-btab="reports">
      <div class="biz-tab-header"><h2>Raporty</h2></div>
      <div id="reportsKPI"></div>
      <div class="biz-stats-two-col" style="margin-top:2rem">
        <div class="biz-chart-area">
          <div class="biz-chart-header">
            <div class="biz-chart-title">Przychód (ostatnie 6 mies.)</div>
            <div class="biz-chart-subtitle" id="reportsRevTotal"></div>
          </div>
          <div id="reportsRevenueChart"></div>
        </div>
        <div class="biz-chart-area">
          <div id="reportsNoShow" style="display:flex;align-items:center;justify-content:center;height:100%"></div>
        </div>
      </div>
      <div class="biz-stats-two-col" style="margin-top:2rem">
        <div class="biz-chart-area">
          <h3 class="report-section-title">Popularne usługi</h3>
          <div id="reportsPopularSvcs"></div>
        </div>
        <div class="biz-chart-area">
          <div id="reportsStaffStats"></div>
        </div>
      </div>
      <div class="biz-chart-area" style="margin-top:2rem">
        <div id="reportsBusiestHours"></div>
      </div>
    </div>

    <!-- ===== TAB: OFFERS ===== -->
    <div class="biz-tab hidden" data-btab="offers">
      <div class="biz-tab-header">
        <h2>Oferty i Promocje</h2>
        <button class="btn btn-accent biz-add-btn" onclick="bizOpenPromoModal()">
          <span class="material-icons">add</span> Nowa oferta
        </button>
      </div>
      <div id="promosList"></div>
    </div>

    <!-- ===== TAB: REVIEWS ===== -->
    <div class="biz-tab hidden" data-btab="bizreviews">
      <div class="biz-tab-header"><h2>Opinie klientów</h2></div>
      <div id="bizReviewsList"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- ===== TAB: PORTFOLIO ===== -->
    <div class="biz-tab hidden" data-btab="portfolio">
      <div class="biz-tab-header"><h2>Portfolio</h2></div>
      <div id="portfolioContent"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- ===== TAB: SETTINGS ===== -->
    <div class="biz-tab hidden" data-btab="settings">
      <div class="biz-tab-header"><h2>Ustawienia Salonu</h2></div>
      <div class="biz-settings-card">
        <div class="biz-settings-section">
          <h3>Informacje podstawowe</h3>
          <div class="biz-settings-grid">
            <div class="settings-field">
              <label>Nazwa salonu</label>
              <input id="bizSettingName" type="text" class="settings-input" placeholder="Nazwa salonu">
            </div>
            <div class="settings-field">
              <label>Branża</label>
              <select id="bizSettingCategory" class="settings-input">
                <option>Barber</option><option>Fryzjer</option><option>Paznokcie</option>
                <option>Masaż</option><option>Kosmetyczka</option><option>Brwi i Rzęsy</option>
                <option>Fizjoterapia</option><option>Inne</option>
              </select>
            </div>
            <div class="settings-field">
              <label>Miasto</label>
              <input id="bizSettingCity" type="text" class="settings-input" placeholder="Warszawa">
            </div>
            <div class="settings-field">
              <label>Adres</label>
              <input id="bizSettingAddress" type="text" class="settings-input" placeholder="ul. Marszałkowska 10">
            </div>
            <div class="settings-field">
              <label>Telefon</label>
              <input id="bizSettingPhone" type="tel" class="settings-input" placeholder="+48 600 000 000">
            </div>
            <div class="settings-field">
              <label>Strona www</label>
              <input id="bizSettingWebsite" type="url" class="settings-input" placeholder="https://twojsalon.pl">
            </div>
          </div>
          <div class="settings-field" style="margin-top:1rem">
            <label>Opis salonu</label>
            <textarea id="bizSettingDesc" class="settings-input" rows="3"
              placeholder="Kilka słów o Twoim salonie..."></textarea>
          </div>
        </div>
        <div class="biz-settings-section">
          <h3>Godziny otwarcia</h3>
          <div id="bizHoursGrid"></div>
        </div>
        <div class="biz-settings-section">
          <h3>Powiadomienia</h3>
          <div class="notif-settings-grid">
            <div class="notif-settings-group">
              <p class="notif-settings-group-label">Email</p>
              <label class="notif-toggle-row">
                <span class="notif-toggle-desc">
                  <span class="notif-toggle-title">Nowa rezerwacja → właściciel</span>
                  <span class="notif-toggle-sub">Email gdy klient złoży rezerwację</span>
                </span>
                <input type="checkbox" id="notifEmailOwner" class="notif-toggle-input">
                <span class="notif-toggle-track"></span>
              </label>
              <label class="notif-toggle-row">
                <span class="notif-toggle-desc">
                  <span class="notif-toggle-title">Nowa rezerwacja → klient</span>
                  <span class="notif-toggle-sub">Email potwierdzający złożenie</span>
                </span>
                <input type="checkbox" id="notifEmailClientNew" class="notif-toggle-input">
                <span class="notif-toggle-track"></span>
              </label>
              <label class="notif-toggle-row">
                <span class="notif-toggle-desc">
                  <span class="notif-toggle-title">Zmiana statusu → klient</span>
                  <span class="notif-toggle-sub">Email przy potwierdzeniu lub anulowaniu</span>
                </span>
                <input type="checkbox" id="notifEmailClientStatus" class="notif-toggle-input">
                <span class="notif-toggle-track"></span>
              </label>
            </div>
            <div class="notif-settings-group">
              <p class="notif-settings-group-label">In-app</p>
              <label class="notif-toggle-row">
                <span class="notif-toggle-desc">
                  <span class="notif-toggle-title">Powiadomienia dla właściciela</span>
                  <span class="notif-toggle-sub">Dzwonek w panelu admina</span>
                </span>
                <input type="checkbox" id="notifInAppOwner" class="notif-toggle-input">
                <span class="notif-toggle-track"></span>
              </label>
              <label class="notif-toggle-row">
                <span class="notif-toggle-desc">
                  <span class="notif-toggle-title">Powiadomienia dla klienta</span>
                  <span class="notif-toggle-sub">Dzwonek w dashboardzie klienta</span>
                </span>
                <input type="checkbox" id="notifInAppClient" class="notif-toggle-input">
                <span class="notif-toggle-track"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="biz-settings-section" style="border:none">
          <button class="btn btn-accent" onclick="bizSaveSettings()">
            <span class="material-icons">save</span> Zapisz zmiany
          </button>
        </div>
      </div>
    </div>

  </main>
</div>

<!-- ===== MODALS ===== -->

<!-- Service modal -->
<div class="biz-modal-overlay hidden" id="serviceModal">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="serviceModalTitle">Dodaj usługę</h3>
      <button class="biz-modal-close" onclick="document.getElementById('serviceModal').classList.add('hidden')"><span class="material-icons">close</span></button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="serviceEditId">
      <div class="auth-fields">
        <div class="auth-field"><label>Nazwa usługi *</label>
          <input id="svcName" type="text" class="auth-input" placeholder="np. Strzyżenie damskie"></div>
        <div class="auth-field"><label>Kategoria</label>
          <input id="svcCategory" type="text" class="auth-input" placeholder="np. Strzyżenie"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Czas (min) *</label>
            <input id="svcDuration" type="number" class="auth-input" placeholder="45" min="5"></div>
          <div class="auth-field"><label>Cena (zł) *</label>
            <input id="svcPrice" type="number" class="auth-input" placeholder="100" min="0"></div>
        </div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="document.getElementById('serviceModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSaveService()">Zapisz</button>
    </div>
  </div>
</div>

<!-- Staff modal -->
<div class="biz-modal-overlay hidden" id="staffModal">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="staffModalTitle">Dodaj pracownika</h3>
      <button class="biz-modal-close" onclick="document.getElementById('staffModal').classList.add('hidden')"><span class="material-icons">close</span></button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="staffEditId">
      <div class="auth-fields">
        <div class="auth-field"><label>Imię i nazwisko *</label>
          <input id="staffName" type="text" class="auth-input" placeholder="Anna Kowalska"></div>
        <div class="auth-field"><label>Stanowisko</label>
          <input id="staffTitle" type="text" class="auth-input" placeholder="Senior Barber"></div>
        <div class="auth-field"><label>Rola</label>
          <select id="staffRole" class="auth-input">
            <option value="pracownik">Pracownik</option>
            <option value="recepcja">Recepcja</option>
            <option value="admin">Administrator</option>
          </select></div>
        <div class="auth-field"><label>Kolor w kalendarzu</label>
          <div id="staffColor" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.25rem"></div></div>
        <div class="auth-field"><label>URL zdjęcia (opcjonalnie)</label>
          <input id="staffPhoto" type="url" class="auth-input" placeholder="https://..."></div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="document.getElementById('staffModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSaveStaff()">Zapisz</button>
    </div>
  </div>
</div>

<!-- Promo modal -->
<div class="biz-modal-overlay hidden" id="promoModal">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="promoModalTitle">Nowa oferta</h3>
      <button class="biz-modal-close" onclick="document.getElementById('promoModal').classList.add('hidden')"><span class="material-icons">close</span></button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="promoEditId">
      <div class="auth-fields">
        <div class="auth-field"><label>Tytuł oferty *</label>
          <input id="promoTitle" type="text" class="auth-input" placeholder="np. Strzyżenie + broda"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Cena regularna (zł) *</label>
            <input id="promoOriginalPrice" type="number" class="auth-input" placeholder="120" min="1"></div>
          <div class="auth-field"><label>Cena promocyjna (zł) *</label>
            <input id="promoDiscountPrice" type="number" class="auth-input" placeholder="90" min="0"></div>
        </div>
        <div class="auth-field"><label>URL zdjęcia (opcjonalnie)</label>
          <input id="promoPhoto" type="url" class="auth-input" placeholder="https://..."></div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="document.getElementById('promoModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSavePromo()">Zapisz</button>
    </div>
  </div>
</div>

<!-- Appointment modal (calendar) -->
<div class="biz-modal-overlay hidden" id="calApptModal">
  <div class="biz-modal" style="max-width:32rem">
    <div class="biz-modal-header">
      <h3 id="calApptModalTitle">Nowa wizyta</h3>
      <button class="biz-modal-close" onclick="calCloseApptModal()"><span class="material-icons">close</span></button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="calApptId">
      <div class="auth-fields">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Imię klienta *</label>
            <input id="calApptClient" type="text" class="auth-input" placeholder="Jan Kowalski"></div>
          <div class="auth-field"><label>Telefon</label>
            <input id="calApptPhone" type="tel" class="auth-input" placeholder="+48 600 000 000"></div>
        </div>
        <div class="auth-field"><label>Usługa</label>
          <select id="calApptService" class="auth-input">
            <option value="">— Wybierz usługę —</option>
          </select></div>
        <div class="auth-field"><label>Pracownik</label>
          <select id="calApptStaff" class="auth-input">
            <option value="">— Dowolny —</option>
          </select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Data *</label>
            <input id="calApptDate" type="date" class="auth-input"></div>
          <div class="auth-field"><label>Godzina *</label>
            <input id="calApptTime" type="time" class="auth-input" step="1800"></div>
        </div>
        <div class="auth-field"><label>Status</label>
          <select id="calApptStatus" class="auth-input">
            <option value="zaplanowana">Zaplanowana</option>
            <option value="potwierdzona">Potwierdzona</option>
            <option value="w trakcie">W trakcie</option>
            <option value="zakończona">Zakończona</option>
            <option value="nie przyszedł">Klient nie przyszedł</option>
            <option value="anulowana">Anulowana</option>
          </select></div>
        <div class="auth-field"><label>Notatki</label>
          <textarea id="calApptNotes" class="auth-input" rows="2" placeholder="Dodatkowe informacje..."></textarea></div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button id="calDeleteApptBtn" class="btn btn-secondary" style="color:#e11d48;display:none"
        onclick="calDeleteAppt()"><span class="material-icons">delete</span> Usuń</button>
      <button class="btn btn-secondary" onclick="calCloseApptModal()">Anuluj</button>
      <button class="btn btn-accent" onclick="calSaveAppt()">Zapisz wizytę</button>
    </div>
  </div>
</div>

<!-- Status change modal -->
<div class="biz-modal-overlay hidden" id="calStatusModal">
  <div class="biz-modal" style="max-width:22rem">
    <div class="biz-modal-header">
      <h3>Zmień status wizyty</h3>
      <button class="biz-modal-close" onclick="calCloseStatusModal()"><span class="material-icons">close</span></button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="calStatusApptId">
      <p style="font-size:.875rem;color:var(--zinc-500);margin-bottom:1rem">
        Aktualny: <strong id="calStatusCurrent"></strong>
      </p>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        <button class="status-pick-btn" style="border-color:#6366f1;color:#4338ca" onclick="calSetStatus('zaplanowana')">Zaplanowana</button>
        <button class="status-pick-btn" style="border-color:#22c55e;color:#15803d" onclick="calSetStatus('potwierdzona')">Potwierdzona</button>
        <button class="status-pick-btn" style="border-color:#f59e0b;color:#b45309" onclick="calSetStatus('w trakcie')">W trakcie</button>
        <button class="status-pick-btn" style="border-color:#a1a1aa;color:#52525b" onclick="calSetStatus('zakończona')">Zakończona</button>
        <button class="status-pick-btn" style="border-color:#ef4444;color:#dc2626" onclick="calSetStatus('nie przyszedł')">Klient nie przyszedł</button>
        <button class="status-pick-btn" style="border-color:#94a3b8;color:#64748b" onclick="calSetStatus('anulowana')">Anulowana</button>
      </div>
    </div>
  </div>
</div>

<!-- Close modals on backdrop click -->
<script>
document.addEventListener('click', e => {
  ['serviceModal','staffModal','promoModal','calApptModal','calStatusModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el && e.target === el) el.classList.add('hidden');
  });
});
</script>
