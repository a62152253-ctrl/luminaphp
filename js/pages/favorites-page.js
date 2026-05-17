import { loadFavoriteIds, renderFavoritesGrid } from '../modules/favorites.js';
import { loadBusinesses } from '../modules/businesses.js';

export async function initFavorites() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }
  const favorites = await loadFavoriteIds(user.uid);
  const businesses = await loadBusinesses();
  window.App.favorites = favorites;
  renderFavoritesGrid(favorites, businesses, 'favoritesGrid');
}
