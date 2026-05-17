<?php /* Centrum powiadomień */ ?>
<div class="features-page container">
  <header class="features-hero">
    <h1>Powiadomienia</h1>
    <p>Wszystkie alerty i przypomnienia w jednym miejscu</p>
    <button id="clearAllNotifs" class="btn btn-ghost btn-sm">Wyczyść wszystko</button>
  </header>

  <div class="notif-filters">
    <button class="notif-filter active" data-filter="all">Wszystkie</button>
    <button class="notif-filter" data-filter="booking">Rezerwacje</button>
    <button class="notif-filter" data-filter="promo">Promocje</button>
    <button class="notif-filter" data-filter="system">System</button>
  </div>

  <div id="notificationsList" class="notifications-list"></div>
  <div id="notifPagination" class="pagination"></div>
</div>
