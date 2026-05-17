const DAYS_SHORT_PL = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];

export function renderBarChart(containerId, labels, values, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const { color = '#f43f5e', height = 180 } = options;
  const max = Math.max(...values, 1);
  const n   = labels.length;
  const W = 400, H = height, PAD = { top: 24, right: 8, bottom: 28, left: 8 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const bw = innerW / n;

  const bars = labels.map((l, i) => {
    const bh  = (values[i] / max) * innerH;
    const x   = PAD.left + i * bw + bw * 0.15;
    const bww = bw * 0.7;
    const y   = PAD.top + innerH - bh;
    return `
      <rect x="${x}" y="${y}" width="${bww}" height="${Math.max(bh, 2)}"
        fill="${color}" rx="4" opacity="${values[i] > 0 ? 0.9 : 0.18}"/>
      ${values[i] > 0 ? `<text x="${x + bww/2}" y="${y - 4}"
        text-anchor="middle" font-size="8" fill="#71717a" font-weight="900"
        font-family="Inter,sans-serif">${values[i]}</text>` : ''}
      <text x="${x + bww/2}" y="${H - 4}"
        text-anchor="middle" font-size="8" fill="#a1a1aa" font-weight="700"
        font-family="Inter,sans-serif">${l}</text>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"
    style="display:block;overflow:visible">${bars}</svg>`;
}

export function renderLineChart(containerId, labels, values, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const { color = '#f43f5e', height = 180 } = options;
  const max = Math.max(...values, 1);
  const n   = labels.length;
  if (n < 2) { el.innerHTML = ''; return; }

  const W = 420, H = height;
  const PAD = { top: 28, right: 16, bottom: 28, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const pts = values.map((v, i) => ({
    x: PAD.left + (i / (n - 1)) * innerW,
    y: PAD.top  + innerH - (v / max) * innerH,
  }));

  // smooth curve
  const smooth = pts.map((p, i, a) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = a[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.5;
    const cpx2 = p.x  - (p.x - prev.x) * 0.5;
    return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }).join(' ');

  const areaClose = ` L${pts[n-1].x},${PAD.top+innerH} L${pts[0].x},${PAD.top+innerH} Z`;
  const gradId = `lg_${containerId}`;

  // Y-axis labels (3 ticks)
  const yTicks = [0, 0.5, 1].map(t => {
    const yy = PAD.top + innerH - t * innerH;
    const val = Math.round(t * max);
    return `<text x="${PAD.left - 6}" y="${yy}" text-anchor="end" dominant-baseline="middle"
      font-size="8" fill="#d4d4d8" font-family="Inter,sans-serif">${val}</text>
      <line x1="${PAD.left}" y1="${yy}" x2="${W - PAD.right}" y2="${yy}"
      stroke="#f4f4f5" stroke-width="1"/>`;
  }).join('');

  const xLabels = labels.map((l, i) => {
    const x = PAD.left + (i / (n-1)) * innerW;
    return `<text x="${x}" y="${H - 4}" text-anchor="middle"
      font-size="8" fill="#a1a1aa" font-weight="700" font-family="Inter,sans-serif">${l}</text>`;
  }).join('');

  const dots = pts.map((p, i) => `
    <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="${p.x}" y="${p.y - 9}" text-anchor="middle"
      font-size="8" fill="#71717a" font-weight="900" font-family="Inter,sans-serif"
    >${values[i]}</text>`).join('');

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="display:block;overflow:visible">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${color}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${yTicks}
      <path d="${smooth}${areaClose}" fill="url(#${gradId})"/>
      <path d="${smooth}" stroke="${color}" stroke-width="2.5" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${xLabels}
    </svg>`;
}

export function revenueChartData(appointments) {
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const now = new Date();
  const months = Array.from({length: 6}, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: m.toLocaleDateString('pl', { month: 'short' }),
      value: confirmed.filter(a => {
        if (!a.date) return false;
        const d = new Date(a.date + 'T00:00:00');
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).reduce((s, a) => s + (a.price || 0), 0),
    };
  });
  return { labels: months.map(m => m.label), values: months.map(m => m.value) };
}

export function bookingsByDayData(appointments) {
  const counts = Array(7).fill(0);
  appointments.forEach(a => {
    if (a.date) {
      const d = new Date(a.date + 'T00:00:00');
      counts[d.getDay()]++;
    }
  });
  return { labels: DAYS_SHORT_PL, values: counts };
}
