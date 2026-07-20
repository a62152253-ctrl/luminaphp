from pathlib import Path

pages_dir = Path('pages')
marker = 'lumina-mini-upgrade-shell'

for path in sorted(pages_dir.glob('*.php')):
    text = path.read_text(encoding='utf-8')
    if marker in text:
        continue

    page_name = path.name
    label = page_name.replace('.php', '').replace('_', ' ')
    label_map = {
        'admin': 'Panel administracyjny',
        'auth': 'Logowanie i rejestracja',
        'booking': 'Rezerwacje',
        'business': 'Profil salonu',
        'chat': 'Wiadomości',
        'choice': 'Wybór ścieżki',
        'dashboard': 'Panel klienta',
        'employees': 'Pracownicy',
        'explore': 'Eksploruj salony',
        'favorites': 'Ulubione',
        'gallery': 'Galeria',
        'home': 'Strona główna',
        'invoice': 'Faktury',
        'loyalty': 'Program lojalnościowy',
        'map': 'Mapa salonów',
        'marketplace': 'Marketplace',
        'notifications': 'Powiadomienia',
        'offers': 'Oferty',
        'profile': 'Profil',
        'referral': 'Polecenia',
        'reviews': 'Opinie',
        'services': 'Usługi',
        'setup': 'Konfiguracja',
        'superadmin': 'Superadmin',
    }
    label = label_map.get(label, label.title())

    block = f"""\n\n<!-- {marker} -->\n<section class=\"lumina-mini-upgrade-shell\" id=\"luminaUpgradeShell-{page_name.replace('.php', '')}\" data-page=\"{page_name}\">\n  <div class=\"lumina-upgrade-card\">\n    <div class=\"lumina-upgrade-top\">\n      <span class=\"lumina-upgrade-pill\">⚡ Mini UX</span>\n      <button type=\"button\" class=\"lumina-upgrade-link\" data-action=\"tip\">Pokaż tip</button>\n    </div>\n    <div class=\"lumina-upgrade-grid\">\n      <div>\n        <h3>Lepsze przejście po stronie</h3>\n        <p>Ta warstwa dodaje płynne akcje, szybkie podpowiedzi i wygodne przyciski, które pomagają skupić się na najważniejszych zadaniach.</p>\n      </div>\n      <div class=\"lumina-upgrade-actions\">\n        <button type=\"button\" class=\"lumina-upgrade-btn primary\" data-action=\"copy\">Kopiuj link</button>\n        <button type=\"button\" class=\"lumina-upgrade-btn\" data-action=\"scroll\">Do góry</button>\n        <button type=\"button\" class=\"lumina-upgrade-btn\" data-action=\"save\">Zapisz stan</button>\n      </div>\n    </div>\n    <div class=\"lumina-upgrade-meta\">\n      <span>Strona: {label}</span>\n      <span>Tryb: szybki</span>\n      <span>Wspomaganie: 1 klik</span>\n    </div>\n    <div class=\"lumina-upgrade-progress\" aria-hidden=\"true\">\n      <div class=\"lumina-upgrade-progress-bar\"></div>\n    </div>\n  </div>\n  <div class=\"lumina-upgrade-toast\" role=\"status\" aria-live=\"polite\"></div>\n</section>\n\n<style>\n.lumina-mini-upgrade-shell {{ margin: 1.4rem 0 1rem; }}\n.lumina-upgrade-card {{ background: linear-gradient(135deg, rgba(99,102,241,.10), rgba(16,185,129,.08)); border: 1px solid rgba(99,102,241,.16); border-radius: 1.1rem; padding: 1rem 1.1rem; box-shadow: 0 10px 30px rgba(15,23,42,.06); }}\n.lumina-upgrade-top {{ display: flex; justify-content: space-between; align-items: center; gap: .75rem; margin-bottom: .75rem; flex-wrap: wrap; }}\n.lumina-upgrade-pill {{ display: inline-flex; align-items: center; gap: .35rem; border-radius: 999px; background: rgba(255,255,255,.8); color: #4338ca; font-size: .75rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: .35rem .65rem; }}\n.lumina-upgrade-link {{ background: rgba(255,255,255,.8); border: 0; border-radius: 999px; color: #374151; font-weight: 700; padding: .5rem .8rem; cursor: pointer; }}\n.lumina-upgrade-grid {{ display: grid; gap: .85rem; grid-template-columns: 1.5fr 1fr; align-items: center; }}\n.lumina-upgrade-grid h3 {{ margin: 0 0 .25rem; font-size: 1rem; color: #111827; }}\n.lumina-upgrade-grid p {{ margin: 0; color: #52525b; font-size: .95rem; line-height: 1.55; }}\n.lumina-upgrade-actions {{ display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .55rem; }}\n.lumina-upgrade-btn {{ border: 0; border-radius: 999px; padding: .6rem .85rem; background: rgba(255,255,255,.95); color: #374151; font-weight: 700; cursor: pointer; }}\n.lumina-upgrade-btn.primary {{ background: linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6); color: #fff; }}\n.lumina-upgrade-meta {{ display: flex; flex-wrap: wrap; gap: .55rem; margin-top: .75rem; color: #4b5563; font-size: .84rem; }}\n.lumina-upgrade-meta span {{ padding: .3rem .6rem; border-radius: 999px; background: rgba(255,255,255,.76); }}\n.lumina-upgrade-progress {{ height: .4rem; border-radius: 999px; background: rgba(255,255,255,.7); margin-top: .8rem; overflow: hidden; }}\n.lumina-upgrade-progress-bar {{ width: 0; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #10b981); transition: width .2s ease; }}\n.lumina-upgrade-toast {{ position: fixed; right: 1rem; bottom: 1rem; max-width: min(90vw, 320px); padding: .8rem 1rem; border-radius: .9rem; background: rgba(17,24,39,.95); color: #fff; box-shadow: 0 16px 36px rgba(0,0,0,.24); opacity: 0; transform: translateY(8px); pointer-events: none; transition: all .2s ease; z-index: 9999; }}\n.lumina-upgrade-toast.show {{ opacity: 1; transform: translateY(0); }}\n@media (max-width: 760px) {{ .lumina-upgrade-grid {{ grid-template-columns: 1fr; }} .lumina-upgrade-actions {{ justify-content: flex-start; }} }}\n</style>\n\n<script>\n(function(){\n  var shell = document.getElementById('luminaUpgradeShell-{page_name.replace('.php', '')}');\n  if (!shell) return;\n  var toast = shell.querySelector('.lumina-upgrade-toast');\n  var progressBar = shell.querySelector('.lumina-upgrade-progress-bar');\n  var buttons = shell.querySelectorAll('.lumina-upgrade-btn, .lumina-upgrade-link');\n  var pageName = shell.getAttribute('data-page') || 'page';\n  var tips = [\n    'Szybkie przyciski skracają drogę do najważniejszych zadań.',\n    'Zapisany stan strony ułatwia szybkie powroty do poprzedniego miejsca.',\n    'Płynne akcje sprawiają, że nawigacja jest przyjemniejsza na telefonie.'\n  ];\n  function showToast(message) {{\n    if (!toast) return;\n    toast.textContent = message;\n    toast.classList.add('show');\n    clearTimeout(showToast.timer);\n    showToast.timer = setTimeout(function() {{ toast.classList.remove('show'); }}, 1800);\n  }}\n  function updateProgress() {{\n    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;\n    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);\n    var ratio = Math.min(100, Math.round((scrollTop / maxScroll) * 100));\n    if (progressBar) progressBar.style.width = ratio + '%';\n  }}\n  buttons.forEach(function(button) {{\n    button.addEventListener('click', function() {{\n      var action = button.getAttribute('data-action');\n      if (action === 'copy') {{\n        if (navigator.clipboard && navigator.clipboard.writeText) {{\n          navigator.clipboard.writeText(window.location.href).then(function() {{ showToast('Link skopiowany'); }}).catch(function() {{ showToast('Skopiowano link do schowka'); }});\n        }} else {{\n          showToast('Link gotowy do skopiowania');\n        }}\n      }} else if (action === 'scroll') {{\n        window.scrollTo({{ top: 0, behavior: 'smooth' }});\n        showToast('Przewinięto do góry');\n      }} else if (action === 'save') {{\n        try {{\n          var saved = JSON.parse(localStorage.getItem('lumina-page-state') || '{}');\n          saved[pageName] = document.title || 'Strona';\n          localStorage.setItem('lumina-page-state', JSON.stringify(saved));\n          showToast('Stan zapisany');\n        }} catch (e) {{\n          showToast('Nie udało się zapisać stanu');\n        }}\n      }} else {{\n        showToast(tips[Math.floor(Math.random() * tips.length)]);\n      }}\n    }});\n  }});\n  window.addEventListener('scroll', updateProgress, {{ passive: true }});\n  window.addEventListener('load', updateProgress);\n  updateProgress();\n  try {{\n    var stored = JSON.parse(localStorage.getItem('lumina-page-state') || '{}');\n    if (stored[pageName]) {{\n      showToast('Wrócono do: ' + stored[pageName]);\n    }}\n  }} catch (e) {{}}\n  window.addEventListener('keydown', function(event) {{\n    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {{\n      event.preventDefault();\n      var focusTarget = document.querySelector('input, textarea, select');\n      if (focusTarget) focusTarget.focus();\n      showToast('Szybkie wyszukiwanie gotowe');\n    }}\n  }});\n})();\n</script>\n"""

    path.write_text(text + block, encoding='utf-8')

print('Updated page files with mini UX upgrades.')
