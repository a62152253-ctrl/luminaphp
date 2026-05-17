import { generateLink, ensureReferralCode, getStats, claimBonus } from '../modules/referral.js';
import { copyLink, shareNative, generateQRCode } from '../modules/share.js';

export async function initReferral() {
  const user = window.App?.user;
  if (!user) { window.location.href = '/luminaphp/?page=auth'; return; }

  await ensureReferralCode(user.uid);
  const link = generateLink(user.uid);
  document.getElementById('referralLink').value = link;
  generateQRCode(link, 'referralQR');

  const stats = await getStats(user.uid);
  document.getElementById('refClicks').textContent = stats.clicks || 0;
  document.getElementById('refSignups').textContent = stats.signups || 0;
  document.getElementById('refBonuses').textContent = stats.bonuses || 0;

  document.getElementById('copyReferralLink')?.addEventListener('click', () => copyLink(link));
  document.getElementById('shareReferral')?.addEventListener('click', () =>
    shareNative('Dołącz do Lumina', 'Zarezerwuj wizytę w salonie beauty', link)
  );
}
