// Haversine distance in km
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R  = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dN = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2
           + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
           * Math.sin(dN/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Attach _distance to each business and sort ascending
export function sortByDistance(businesses, lat, lng) {
  return businesses
    .map(b => ({
      ...b,
      _distance: (b.lat != null && b.lng != null)
        ? calcDistance(lat, lng, b.lat, b.lng)
        : Infinity,
    }))
    .sort((a, b) => a._distance - b._distance);
}

// Promisified geolocation — resolves null if denied / unavailable
export function getUserLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()   => resolve(null),
      { timeout: 8000, maximumAge: 300_000 }
    );
  });
}

const NOMINATIM_HEADERS = {
  'Accept-Language': 'pl',
  'User-Agent': 'Lumina/1.0 (luminaphp-88b38.firebaseapp.com)',
};

// Nominatim reverse geocoding — coords → address fields
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18`,
      { headers: NOMINATIM_HEADERS }
    );
    const data = await res.json();
    const a = data.address || {};
    const city   = a.city || a.town || a.village || a.municipality || '';
    const road   = a.road || a.pedestrian || a.footway || '';
    const postal = a.postcode || '';
    // Intentionally omit house_number — GPS accuracy (±10m) makes it unreliable
    return { city, address: road.trim(), postal };
  } catch {
    return null;
  }
}

// Nominatim geocoding — free, no API key needed
export async function geocodeAddress(city, address) {
  const q = encodeURIComponent(`${address}, ${city}, Polska`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=pl`,
      { headers: NOMINATIM_HEADERS }
    );
    const data = await res.json();
    if (data.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* sieć lub brak wyniku */ }
  return null;
}
