<?php /* Panel Salonu — Business Dashboard */ ?>

<div class="biz-layout" role="main">

  <!-- ===== SIDEBAR ===== -->
  <aside class="biz-sidebar" id="bizSidebar" aria-label="Nawigacja panelu salonu">

    <button class="biz-sidebar-collapse" id="sidebarCollapseBtn"
      title="Zwiń panel" aria-label="Zwiń panel boczny">
      <span class="material-icons">chevron_left</span>
    </button>

    <div class="biz-sidebar-brand">
      <div class="biz-sidebar-icon"><span class="material-icons">storefront</span></div>
      <div class="biz-sidebar-brand-text">
        <div id="adminBizName" class="biz-sidebar-name">Mój Salon</div>
        <div id="adminBizCategory" class="biz-sidebar-badge">—</div>
      </div>
    </div>

    <div class="biz-sidebar-owner">
      <img id="adminUserAvatar" src="" alt="Avatar właściciela" class="biz-sidebar-avatar">
      <div class="biz-sidebar-owner-text">
        <div id="adminUserName" class="biz-sidebar-owner-name">Użytkownik</div>
        <div class="biz-sidebar-owner-role">Administrator</div>
      </div>
    </div>

    <nav class="biz-nav" aria-label="Menu panelu salonu">
      <a href="#" class="biz-nav-link" data-btab="home">
        <span class="material-icons">dashboard</span>
        <span class="biz-nav-text">Panel główny</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="calendar">
        <span class="material-icons">calendar_today</span>
        <span class="biz-nav-text">Kalendarz</span>
        <span class="biz-nav-badge hidden" id="pendingBadge" aria-label="oczekujących rezerwacji">0</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="clients">
        <span class="material-icons">people</span>
        <span class="biz-nav-text">Klienci</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="services">
        <span class="material-icons">content_cut</span>
        <span class="biz-nav-text">Usługi</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="staff">
        <span class="material-icons">badge</span>
        <span class="biz-nav-text">Pracownicy</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="waitlist">
        <span class="material-icons">queue</span>
        <span class="biz-nav-text">Lista oczekujących</span>
        <span class="biz-nav-badge hidden" id="waitlistBadge" aria-label="wpisów na liście oczekujących">0</span>
      </a>

      <div class="biz-nav-separator"></div>

      <a href="#" class="biz-nav-link" data-btab="reports">
        <span class="material-icons">bar_chart</span>
        <span class="biz-nav-text">Raporty</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="offers">
        <span class="material-icons">local_offer</span>
        <span class="biz-nav-text">Oferty</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="bizreviews">
        <span class="material-icons">star_half</span>
        <span class="biz-nav-text">Opinie</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="portfolio">
        <span class="material-icons">photo_library</span>
        <span class="biz-nav-text">Portfolio</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="marketing">
        <span class="material-icons">campaign</span>
        <span class="biz-nav-text">Marketing</span>
      </a>
      <a href="#" class="biz-nav-link" data-btab="widget">
        <span class="material-icons">code</span>
        <span class="biz-nav-text">Widget rezerwacji</span>
      </a>

      <div class="biz-nav-separator"></div>

      <a href="#" class="biz-nav-link" data-btab="settings">
        <span class="material-icons">settings</span>
        <span class="biz-nav-text">Ustawienia</span>
      </a>
      <a href="#" class="biz-nav-link" onclick="logout();return false" style="color:var(--zinc-400)">
        <span class="material-icons">logout</span>
        <span class="biz-nav-text">Wyloguj</span>
      </a>
    </nav>
  </aside>

  <!-- ===== MAIN ===== -->
  <main class="biz-main" id="adminContent" aria-label="Treść panelu salonu">

    <!-- ===== TOP STATS BAR ===== -->
    <div class="biz-stats-bar" role="region" aria-label="Statystyki salonu">
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
      <button class="btn btn-ghost btn-sm biz-export-btn" onclick="window.exportAppts?.()"
        aria-label="Eksportuj wizyty do pliku CSV">
        <span class="material-icons" aria-hidden="true">download</span> CSV
      </button>
    </div>

    <!-- ===== TAB: HOME ===== -->
    <div class="biz-tab hidden" data-btab="home">

      <!-- Hero -->
      <div class="dash-hero">
        <div class="dash-hero-text">
          <h2 class="dash-greeting" id="overviewGreeting">Dzień dobry!</h2>
          <p class="dash-hero-date" id="dashHeroDate"></p>
        </div>
        <div id="dashNextApptBanner"></div>
      </div>

      <!-- KPI row -->
      <div class="dash-kpi-row">
        <div class="dash-kpi-card">
          <div class="dash-kpi-icon dash-kpi-icon--indigo"><span class="material-icons">today</span></div>
          <div class="dash-kpi-body">
            <div class="dash-kpi-val" id="hStatToday">—</div>
            <div class="dash-kpi-label">Wizyty dziś</div>
          </div>
          <div class="dash-kpi-trend" id="dashTrendToday"></div>
        </div>
        <div class="dash-kpi-card">
          <div class="dash-kpi-icon dash-kpi-icon--amber"><span class="material-icons">pending_actions</span></div>
          <div class="dash-kpi-body">
            <div class="dash-kpi-val" id="hStatPending">—</div>
            <div class="dash-kpi-label">Oczekujące</div>
          </div>
          <div class="dash-kpi-trend" id="dashTrendPending"></div>
        </div>
        <div class="dash-kpi-card">
          <div class="dash-kpi-icon dash-kpi-icon--green"><span class="material-icons">payments</span></div>
          <div class="dash-kpi-body">
            <div class="dash-kpi-val" id="hStatRevenue">—</div>
            <div class="dash-kpi-label">Przychód dziś</div>
          </div>
          <div class="dash-kpi-trend" id="dashTrendRevenue"></div>
        </div>
        <div class="dash-kpi-card">
          <div class="dash-kpi-icon dash-kpi-icon--rose"><span class="material-icons">bar_chart</span></div>
          <div class="dash-kpi-body">
            <div class="dash-kpi-val" id="hStatTotal">—</div>
            <div class="dash-kpi-label">Łącznie wizyt</div>
          </div>
          <div class="dash-kpi-trend" id="dashTrendTotal"></div>
        </div>
      </div>

      <!-- Body grid: left main + right side -->
      <div class="dash-body-grid">

        <!-- Left column -->
        <div class="dash-body-main">

          <!-- Today's schedule timeline -->
          <div class="dash-panel">
            <div class="dash-panel-hdr">
              <div class="dash-panel-hdr-left">
                <div class="dash-panel-dot" style="background:#6366f1"></div>
                <h3>Harmonogram dziś</h3>
              </div>
              <button class="dash-panel-link" onclick="window.adminSwitchTab?.('calendar')">
                Kalendarz <span class="material-icons">east</span>
              </button>
            </div>
            <div id="dashTodayTimeline"><div class="spinner" style="margin:2rem auto"></div></div>
          </div>

          <!-- Upcoming appointments -->
          <div class="dash-panel" style="margin-top:1.25rem">
            <div class="dash-panel-hdr">
              <div class="dash-panel-hdr-left">
                <div class="dash-panel-dot" style="background:#f59e0b"></div>
                <h3>Nadchodzące wizyty</h3>
              </div>
              <span class="dash-count-chip" id="dashUpcomingCount"></span>
            </div>
            <div id="hUpcomingList"><div class="spinner" style="margin:2rem auto"></div></div>
          </div>
        </div>

        <!-- Right column -->
        <div class="dash-body-side">

          <!-- Quick actions 2×3 grid -->
          <div class="dash-panel">
            <div class="dash-panel-hdr" style="margin-bottom:.875rem">
              <div class="dash-panel-hdr-left">
                <div class="dash-panel-dot" style="background:#22c55e"></div>
                <h3>Szybkie akcje</h3>
              </div>
            </div>
            <div id="hQuickActions"></div>
          </div>

          <!-- Revenue sparkline — last 7 days -->
          <div class="dash-panel" style="margin-top:1.25rem">
            <div class="dash-panel-hdr" style="margin-bottom:1rem">
              <div class="dash-panel-hdr-left">
                <div class="dash-panel-dot" style="background:#a855f7"></div>
                <h3>Przychód — 7 dni</h3>
              </div>
              <strong id="dashRevTotal" class="dash-rev-total-lbl"></strong>
            </div>
            <div id="dashRevChart"></div>
          </div>

          <!-- Staff on duty -->
          <div class="dash-panel" style="margin-top:1.25rem">
            <div class="dash-panel-hdr" style="margin-bottom:.875rem">
              <div class="dash-panel-hdr-left">
                <div class="dash-panel-dot" style="background:#0ea5e9"></div>
                <h3>Pracownicy dziś</h3>
              </div>
            </div>
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
        <button class="btn btn-ghost biz-add-btn" id="birthdayFilterBtn" onclick="clientToggleBirthday()">
          <span class="material-icons">cake</span> Urodziny w tym miesiącu
        </button>
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
        <h2 id="staffTabTitle">Pracownicy</h2>
        <button class="btn btn-accent biz-add-btn" id="staffAddBtn" onclick="bizOpenStaffModal()">
          <span class="material-icons">person_add</span> Dodaj pracownika
        </button>
      </div>
      <div class="biz-sub-tabs" id="staffSubTabs">
        <button class="biz-sub-tab active" data-stab="staff-list">Pracownicy</button>
        <button class="biz-sub-tab" data-stab="schedule">Grafik zmian</button>
        <button class="biz-sub-tab" data-stab="commissions">Prowizje</button>
        <button class="biz-sub-tab" data-stab="kpi">Cele (KPI)</button>
      </div>
      <div id="staffListPanel">
        <div id="staffList"><div class="spinner" style="margin:3rem auto"></div></div>
      </div>
      <div id="schedulePanel" class="hidden">
        <div id="scheduleView"></div>
      </div>
      <div id="commissionsPanel" class="hidden">
        <div id="commissionsView"></div>
      </div>
      <div id="kpiPanel" class="hidden">
        <div id="kpiView"></div>
      </div>
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
        <h2>Oferty i Marketplace</h2>
        <button class="btn btn-accent biz-add-btn" onclick="bizOpenAddModal()">
          <span class="material-icons">add</span> Dodaj
        </button>
      </div>
      <div class="biz-sub-tabs" id="offersSubTabs">
        <button class="biz-sub-tab active" data-ostab="promos">Promocje</button>
        <button class="biz-sub-tab" data-ostab="flash">
          <span class="material-icons" style="font-size:1rem;vertical-align:middle">bolt</span> Flash Deals
        </button>
        <button class="biz-sub-tab" data-ostab="bundles">
          <span class="material-icons" style="font-size:1rem;vertical-align:middle">inventory_2</span> Pakiety
        </button>
        <button class="biz-sub-tab" data-ostab="subs">
          <span class="material-icons" style="font-size:1rem;vertical-align:middle">autorenew</span> Subskrypcje
        </button>
      </div>
      <div id="offersPromoPanel"><div id="promosList"></div></div>
      <div id="offersFlashPanel"   class="hidden"><div id="flashDealsList"></div></div>
      <div id="offersBundlesPanel" class="hidden"><div id="bundlesList"></div></div>
      <div id="offersSubsPanel"    class="hidden"><div id="subsList"></div></div>
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

    <!-- ===== TAB: WAITLIST ===== -->
    <div class="biz-tab hidden" data-btab="waitlist">
      <div class="biz-tab-header">
        <h2>Lista oczekujących</h2>
        <span class="biz-wl-count" id="waitlistCountBadge">0 wpisów</span>
      </div>
      <p class="biz-tab-hint">Klienci, którzy poprosili o powiadomienie gdy zwolni się termin.</p>
      <div id="waitlistEntries"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>

    <!-- ===== TAB: MARKETING ===== -->
    <div class="biz-tab hidden" data-btab="marketing">
      <div class="biz-tab-header">
        <h2>Marketing</h2>
        <button class="btn btn-accent biz-add-btn" onclick="bizNewCampaign()">
          <span class="material-icons">add</span> Nowa kampania
        </button>
      </div>
      <div class="mkt-templates-row">
        <button class="mkt-template-btn" onclick="bizNewCampaign('birthday')">
          <span class="material-icons">cake</span>
          <span>Życzenia urodzinowe</span>
          <small>Klienci z urodzinami w tym miesiącu</small>
        </button>
        <button class="mkt-template-btn" onclick="bizNewCampaign('lastminute')">
          <span class="material-icons">bolt</span>
          <span>Promocja last minute</span>
          <small>Wolny termin — wyślij szybką ofertę</small>
        </button>
        <button class="mkt-template-btn" onclick="bizNewCampaign('promo')">
          <span class="material-icons">local_offer</span>
          <span>Promocja ogólna</span>
          <small>Wyślij ofertę do wszystkich klientów</small>
        </button>
        <button class="mkt-template-btn" onclick="bizNewCampaign('rebook')">
          <span class="material-icons">replay</span>
          <span>Zaproszenie do powrotu</span>
          <small>Klienci nieaktywni od 4+ tygodni</small>
        </button>
      </div>
      <div id="campaignHistory" class="mkt-history"></div>
    </div>

    <!-- ===== TAB: WIDGET ===== -->
    <div class="biz-tab hidden" data-btab="widget">
      <div class="biz-tab-header"><h2>Widget rezerwacji</h2></div>
      <div id="widgetContent"></div>
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
<div class="biz-modal-overlay hidden" id="serviceModal"
  role="dialog" aria-modal="true" aria-labelledby="serviceModalTitle">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="serviceModalTitle">Dodaj usługę</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('serviceModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
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
<div class="biz-modal-overlay hidden" id="staffModal"
  role="dialog" aria-modal="true" aria-labelledby="staffModalTitle">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="staffModalTitle">Dodaj pracownika</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('staffModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
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
        <div class="auth-field"><label>Prowizja (%)</label>
          <input id="staffCommission" type="number" class="auth-input" placeholder="0" min="0" max="100" step="1"></div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="document.getElementById('staffModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSaveStaff()">Zapisz</button>
    </div>
  </div>
</div>

<!-- Promo modal -->
<div class="biz-modal-overlay hidden" id="promoModal"
  role="dialog" aria-modal="true" aria-labelledby="promoModalTitle">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="promoModalTitle">Nowa oferta</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('promoModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
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
<div class="biz-modal-overlay hidden" id="calApptModal"
  role="dialog" aria-modal="true" aria-labelledby="calApptModalTitle">
  <div class="biz-modal" style="max-width:32rem">
    <div class="biz-modal-header">
      <h3 id="calApptModalTitle">Nowa wizyta</h3>
      <button class="biz-modal-close" aria-label="Zamknij" onclick="calCloseApptModal()">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
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
<div class="biz-modal-overlay hidden" id="calStatusModal"
  role="dialog" aria-modal="true" aria-labelledby="calStatusModalTitle">
  <div class="biz-modal" style="max-width:22rem">
    <div class="biz-modal-header">
      <h3 id="calStatusModalTitle">Zmień status wizyty</h3>
      <button class="biz-modal-close" aria-label="Zamknij" onclick="calCloseStatusModal()">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
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

<!-- Shift modal -->
<div class="biz-modal-overlay hidden" id="shiftModal"
  role="dialog" aria-modal="true" aria-labelledby="shiftModalTitle">
  <div class="biz-modal" style="max-width:26rem">
    <div class="biz-modal-header">
      <h3 id="shiftModalTitle">Dodaj zmianę</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('shiftModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="biz-modal-body">
      <div class="auth-fields">
        <div class="auth-field"><label>Pracownik *</label>
          <select id="shiftStaff" class="auth-input"><option value="">— Wybierz —</option></select></div>
        <div class="auth-field"><label>Data *</label>
          <input id="shiftDate" type="date" class="auth-input"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Od</label>
            <input id="shiftFrom" type="time" class="auth-input" value="09:00"></div>
          <div class="auth-field"><label>Do</label>
            <input id="shiftTo" type="time" class="auth-input" value="17:00"></div>
        </div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="document.getElementById('shiftModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="scheduleSaveShift()">Zapisz zmianę</button>
    </div>
  </div>
</div>

<!-- Vacation modal -->
<div class="biz-modal-overlay hidden" id="vacationModal"
  role="dialog" aria-modal="true" aria-labelledby="vacModalTitle">
  <div class="biz-modal" style="max-width:26rem">
    <div class="biz-modal-header">
      <h3 id="vacModalTitle">Zarejestruj urlop</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('vacationModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="biz-modal-body">
      <div class="auth-fields">
        <div class="auth-field"><label>Pracownik *</label>
          <select id="vacStaff" class="auth-input"><option value="">— Wybierz —</option></select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Od *</label>
            <input id="vacStart" type="date" class="auth-input"></div>
          <div class="auth-field"><label>Do *</label>
            <input id="vacEnd" type="date" class="auth-input"></div>
        </div>
        <div class="auth-field"><label>Uwagi (opcjonalnie)</label>
          <input id="vacNote" type="text" class="auth-input" placeholder="np. urlop wypoczynkowy" maxlength="80"></div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="document.getElementById('vacationModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="scheduleSaveVacation()">Zapisz urlop</button>
    </div>
  </div>
</div>

<!-- Marketing campaign modal -->
<div class="biz-modal-overlay hidden" id="mktCampaignModal"
  role="dialog" aria-modal="true" aria-labelledby="mktModalTitle">
  <div class="biz-modal" style="max-width:36rem">
    <div class="biz-modal-header">
      <h3 id="mktModalTitle">Nowa kampania</h3>
      <button class="biz-modal-close" aria-label="Zamknij" onclick="mktCloseCampaign()">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="mktCampaignType" value="custom">
      <div class="auth-fields">
        <div class="auth-field"><label>Kanał</label>
          <select id="mktChannel" class="auth-input">
            <option value="email">E-mail</option>
            <option value="sms">SMS</option>
            <option value="push">Powiadomienie push</option>
          </select></div>
        <div class="auth-field"><label>Temat *</label>
          <input id="mktSubject" type="text" class="auth-input" placeholder="Temat wiadomości" maxlength="100"></div>
        <div class="auth-field"><label>Treść *</label>
          <textarea id="mktBody" class="auth-input" rows="5" placeholder="Treść kampanii…" maxlength="1000"></textarea></div>
        <div class="auth-field">
          <label>Odbiorcy: <span id="mktRecipientCount" style="color:var(--accent);font-weight:700">0</span></label>
          <div id="mktRecipientsList" class="mkt-recipients-preview"></div>
        </div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary" onclick="mktCloseCampaign()">Anuluj</button>
      <button class="btn btn-accent" onclick="mktSendCampaign()">
        <span class="material-icons">send</span> Wyślij kampanię
      </button>
    </div>
  </div>
</div>

<!-- Flash Deal modal -->
<div class="biz-modal-overlay hidden" id="flashDealModal"
  role="dialog" aria-modal="true" aria-labelledby="flashDealModalTitle">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="flashDealModalTitle">Nowy Flash Deal</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('flashDealModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="flashEditId">
      <div class="auth-fields">
        <div class="auth-field"><label>Usługa *</label>
          <select id="flashService" class="auth-input" onchange="bizFlashRecalcPrice()">
            <option value="">— Wybierz usługę —</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Rabat (%)</label>
            <input id="flashDiscount" type="number" class="auth-input" value="30" min="1" max="90"
              oninput="bizFlashRecalcPrice()"></div>
          <div class="auth-field"><label>Cena po rabacie (zł)</label>
            <input id="flashPrice" type="number" class="auth-input" placeholder="auto" min="0" readonly
              style="background:var(--zinc-50);cursor:default"></div>
        </div>
        <div class="auth-field"><label>Ważna do *</label>
          <input id="flashExpires" type="datetime-local" class="auth-input"></div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary"
        onclick="document.getElementById('flashDealModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSaveFlashDeal()">
        <span class="material-icons">bolt</span> Opublikuj Flash Deal
      </button>
    </div>
  </div>
</div>

<!-- Bundle modal -->
<div class="biz-modal-overlay hidden" id="bundleModal"
  role="dialog" aria-modal="true" aria-labelledby="bundleModalTitle">
  <div class="biz-modal" style="max-width:32rem">
    <div class="biz-modal-header">
      <h3 id="bundleModalTitle">Nowy pakiet</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('bundleModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="bundleEditId">
      <div class="auth-fields">
        <div class="auth-field"><label>Nazwa pakietu *</label>
          <input id="bundleName" type="text" class="auth-input" placeholder="np. Dzień spa"></div>
        <div class="auth-field"><label>Opis</label>
          <input id="bundleDesc" type="text" class="auth-input" placeholder="Krótki opis pakietu"></div>
        <div class="auth-field"><label>Usługi w pakiecie *</label>
          <div id="bundleServicesCheckboxes" class="biz-checkbox-list"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Łączna wartość (zł)</label>
            <input id="bundleTotalValue" type="number" class="auth-input" readonly
              style="background:var(--zinc-50);cursor:default" placeholder="0"></div>
          <div class="auth-field"><label>Cena pakietu (zł) *</label>
            <input id="bundlePrice" type="number" class="auth-input" placeholder="np. 200" min="1"></div>
        </div>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary"
        onclick="document.getElementById('bundleModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSaveBundle()">
        <span class="material-icons">inventory_2</span> Zapisz pakiet
      </button>
    </div>
  </div>
</div>

<!-- Subscription plan modal -->
<div class="biz-modal-overlay hidden" id="subModal"
  role="dialog" aria-modal="true" aria-labelledby="subModalTitle">
  <div class="biz-modal">
    <div class="biz-modal-header">
      <h3 id="subModalTitle">Nowy plan subskrypcji</h3>
      <button class="biz-modal-close" aria-label="Zamknij"
        onclick="document.getElementById('subModal').classList.add('hidden')">
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="biz-modal-body">
      <input type="hidden" id="subEditId">
      <div class="auth-fields">
        <div class="auth-field"><label>Nazwa planu *</label>
          <input id="subName" type="text" class="auth-input" placeholder="np. Basic, Premium"></div>
        <div class="auth-field"><label>Opis</label>
          <input id="subDesc" type="text" class="auth-input" placeholder="Krótki opis planu"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="auth-field"><label>Cena miesięczna (zł) *</label>
            <input id="subPrice" type="number" class="auth-input" placeholder="99" min="1"></div>
          <div class="auth-field"><label>Wizyt w miesiącu *</label>
            <input id="subVisits" type="number" class="auth-input" placeholder="4" min="1"></div>
        </div>
        <div class="auth-field"><label>Korzyści (każda w nowej linii)</label>
          <textarea id="subFeatures" class="auth-input" rows="3"
            placeholder="Bezpłatna konsultacja&#10;Priorytet w rezerwacji&#10;Rabat 10% na produkty"></textarea>
        </div>
        <label class="notif-toggle-row" style="margin-top:.5rem">
          <span class="notif-toggle-desc">
            <span class="notif-toggle-title">Oznacz jako "Najpopularniejszy"</span>
          </span>
          <input type="checkbox" id="subPopular" class="notif-toggle-input">
          <span class="notif-toggle-track"></span>
        </label>
      </div>
    </div>
    <div class="biz-modal-footer">
      <button class="btn btn-secondary"
        onclick="document.getElementById('subModal').classList.add('hidden')">Anuluj</button>
      <button class="btn btn-accent" onclick="bizSaveSub()">
        <span class="material-icons">autorenew</span> Zapisz plan
      </button>
    </div>
  </div>
</div>

<!-- Close modals on backdrop click -->
<script>
document.addEventListener('click', e => {
  ['serviceModal','staffModal','promoModal','calApptModal','calStatusModal',
   'shiftModal','vacationModal','mktCampaignModal',
   'flashDealModal','bundleModal','subModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el && e.target === el) el.classList.add('hidden');
  });
});
</script>
