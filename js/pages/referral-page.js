import { generateLink, ensureReferralCode, getStats } from '../modules/referral.js';
import { copyLink, shareNative, generateQRCode } from '../modules/share.js';
import { toast } from '../modules/utils.js';

export async function initReferral() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  const link = generateLink(user.uid);

  // Show link immediately — don't wait for Firestore
  const input = document.getElementById('referralLink');
  if (input) input.value = link;
  generateQRCode(link, 'referralQR');

  document.getElementById('copyReferralLink')?.addEventListener('click', async () => {
    await copyLink(link);
    toast('Link skopiowany!', 'success');
  });
  document.getElementById('shareReferral')?.addEventListener('click', () =>
    shareNative('Dołącz do Lumina', 'Zarezerwuj wizytę w salonie beauty', link)
  );

  // Firestore operations — non-blocking, fail silently on permission errors
  try {
    await ensureReferralCode(user.uid);
  } catch (_) {}

  try {
    const stats = await getStats(user.uid);
    document.getElementById('refClicks').textContent  = stats.clicks  || 0;
    document.getElementById('refSignups').textContent = stats.signups || 0;
    document.getElementById('refBonuses').textContent = stats.bonuses || 0;
  } catch (_) {}
}
