import { db, addDoc, collection, serverTimestamp } from '../firebase-config.js';

export async function shareNative(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      trackShare('native', url);
      return true;
    } catch { return false; }
  }
  return copyLink(url);
}

export async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  }
}

export function generateQRCode(url, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  // Use quickchart.io — allowed by CSP img-src https:
  const encoded = encodeURIComponent(url);
  el.innerHTML = `<img src="https://quickchart.io/qr?text=${encoded}&size=200" alt="QR Code" width="200" height="200" loading="lazy">`;
}

export async function trackShare(method, url) {
  try {
    await addDoc(collection(db, 'share_events'), {
      method,
      url,
      userId: window.App?.user?.uid || null,
      createdAt: serverTimestamp(),
    });
  } catch { /* non-critical */ }
}
