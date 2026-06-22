import { cachedSieve } from '../core/primes.js';

// Goldbach's comet: for each even n ≥ 4, count the partitions n = p + q into two
// primes (p ≤ q). Plotting that count against n produces the famous comet — a
// widening fan split into bands by the residue class of n. Screen-space function
// plot (no pan/zoom), like π(x).

// Cache the (expensive) partition counts by maxN.
let cached = null;
function cometFor(maxN) {
  if (cached && cached.maxN === maxN) return cached;
  const flags = cachedSieve(maxN);
  const primes = [];
  for (let i = 2; i <= maxN; i++) if (flags[i]) primes.push(i);

  const pts = [];
  let maxG = 1;
  for (let n = 4; n <= maxN; n += 2) {
    let g = 0;
    for (let j = 0; j < primes.length && primes[j] <= n / 2; j++) {
      if (flags[n - primes[j]]) g++;
    }
    pts.push(n, g);
    if (g > maxG) maxG = g;
  }
  cached = { maxN, pts, maxG };
  return cached;
}

export default {
  id: 'goldbach-comet',
  name: "Goldbach's Comet",
  description: 'For each even n, the number of ways n = p + q (primes). The comet fans out in bands.',

  // Screen-space function plot: fixed axes, no pan/zoom.
  camera: false,

  params: {
    maxN: { type: 'int', min: 100, max: 50000, step: 100, scale: 'log', default: 10000, label: 'Even n ≤', expensive: true },
    color: { type: 'color', default: '#7fd1ff', label: 'Point color' },
  },

  draw(renderer, view, params) {
    const { ctx, width, height } = renderer;
    const { pts, maxG, maxN } = cometFor(params.maxN);

    const pad = 50;
    const plotW = width - pad * 2;
    const plotH = height - pad * 2;
    const sx = (n) => pad + (n / maxN) * plotW;
    const sy = (g) => height - pad - (g / maxG) * plotH;

    // Axes.
    ctx.strokeStyle = '#33405a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(pad, pad);
    ctx.stroke();

    // The comet points.
    ctx.fillStyle = params.color;
    for (let i = 0; i < pts.length; i += 2) {
      ctx.fillRect(sx(pts[i]) - 0.75, sy(pts[i + 1]) - 0.75, 1.5, 1.5);
    }

    // Label.
    ctx.fillStyle = '#8aa0c0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Goldbach partitions of even n ≤ ${maxN}  (peak ${maxG})`, pad + 10, pad + 4);
  },
};
