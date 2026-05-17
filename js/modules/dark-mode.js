const STORAGE_KEY = 'lumina_theme';

export function detectSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;
  return detectSystemPreference() ? 'dark' : 'light';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  });
}

export function persistChoice(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  persistChoice(next);
  return next;
}

export function initDarkMode() {
  applyTheme(getTheme());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });
}
