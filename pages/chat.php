<?php /* Skrzynka wiadomości */ ?>
<div class="features-page chat-page">
  <div class="chat-layout">
    <aside class="chat-sidebar">
      <header class="chat-sidebar-head">
        <h2>Wiadomości</h2>
        <button id="newChatBtn" class="btn-icon" title="Nowa rozmowa"><span class="material-icons">add</span></button>
      </header>
      <div id="chatConversations" class="chat-conversations"></div>
    </aside>
    <main class="chat-main">
      <div id="chatEmpty" class="chat-empty">
        <span class="material-icons">chat</span>
        <p>Wybierz konwersację lub rozpocznij nową</p>
      </div>
      <div id="chatWindow" class="chat-window hidden">
        <header class="chat-window-head">
          <h3 id="chatPartnerName">Salon</h3>
        </header>
        <div id="chatMessages" class="chat-messages"></div>
        <form id="chatForm" class="chat-form">
          <label for="chatInput" class="sr-only">Wpisz wiadomość</label>
          <input type="text" id="chatInput" placeholder="Napisz wiadomość…" autocomplete="off" aria-label="Wpisz wiadomość">
          <button type="submit" class="btn btn-accent"><span class="material-icons">send</span></button>
        </form>
      </div>
    </main>
  </div>
</div>
