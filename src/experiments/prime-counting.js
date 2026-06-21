import { sieve, primeCount } from '../core/primes.js';

// The prime-counting function π(x): how many primes are ≤ x. Rendered as the
// staircase it is, with simple axes.
export default {
  id: 'prime-counting',
  name: 'Prime Counting π(x)',
  description: 'π(x): how many primes are ≤ x. A staircase that climbs ever more slowly.',

  // Tweakable knob (no UI yet — edit and reload).
  maxX: 1000,

  draw(renderer) {
    const { ctx, width, height } = renderer;
    const maxX = this.maxX;
    const flags = sieve(maxX);
    const maxY = primeCount(maxX) || 1;

    const pad = 50;
    const plotW = width - pad * 2;
    const plotH = height - pad * 2;
    const sx = (x) => pad + (x / maxX) * plotW;
    const sy = (y) => height - pad - (y / maxY) * plotH;

    // Axes.
    ctx.strokeStyle = '#33405a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad); // x-axis
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(pad, pad);                  // y-axis
    ctx.stroke();

    // The π(x) step function: a horizontal run, then a unit step up at each prime.
    ctx.strokeStyle = '#7fd1ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(0));
    let count = 0;
    for (let x = 2; x <= maxX; x++) {
      if (flags[x]) {
        ctx.lineTo(sx(x), sy(count));
        count++;
        ctx.lineTo(sx(x), sy(count));
      }
    }
    ctx.lineTo(sx(maxX), sy(count));
    ctx.stroke();

    // Label.
    ctx.fillStyle = '#8aa0c0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`π(${maxX}) = ${maxY}`, pad + 10, pad + 4);
  },
};
