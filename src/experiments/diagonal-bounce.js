import { cachedSieve } from '../core/primes.js';

// Lay the integers out on a grid rooted at the bottom-left, filling
// anti-diagonals (cells where x + y = d) and bouncing direction each
// diagonal — off the x-axis, across to the y-axis, and back:
//
//   9
//   3 8
//   2 4 7
//   0 1 5 6
//
// This is the Cantor pairing enumeration. Primes are highlighted. Drawn in
// world coordinates (1 unit = 1 cell, origin at bottom-left) for the camera.
export default {
  id: 'diagonal-bounce',
  name: 'Diagonal Bounce',
  description: 'Integers fill bouncing anti-diagonals from the bottom-left corner; primes highlighted.',

  // Tweakable knob (no UI yet — edit and reload).
  count: 200000,

  bounds() {
    const dMax = Math.floor((Math.sqrt(8 * this.count + 1) - 1) / 2);
    return { minX: 0, minY: 0, maxX: dMax + 1, maxY: dMax + 1 };
  },

  draw(renderer, view) {
    const { ctx } = renderer;
    const count = this.count;
    const flags = cachedSieve(count);
    const m = 1; // cull margin (world units)

    ctx.fillStyle = '#7fd1ff';

    let n = 0;
    for (let d = 0; n <= count; d++) {
      const fromXAxis = d % 2 === 1; // odd diagonals start on the x-axis
      for (let k = 0; k <= d && n <= count; k++, n++) {
        if (!flags[n]) continue;
        const x = fromXAxis ? d - k : k;
        const y = fromXAxis ? k : d - k;
        if (x < view.minX - m || x > view.maxX + m ||
            y < view.minY - m || y > view.maxY + m) continue;
        ctx.fillRect(x + 0.05, y + 0.05, 0.9, 0.9);
      }
    }
  },
};
