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
// This is the Cantor pairing enumeration. Primes are highlighted.
export default {
  id: 'diagonal-bounce',
  name: 'Diagonal Bounce',
  description: 'Integers fill bouncing anti-diagonals from the bottom-left corner; primes highlighted.',

  // Tweakable knob (no UI yet — edit and reload).
  count: 200000,

  draw(renderer) {
    const { ctx, width, height } = renderer;
    const count = this.count;

    // Cells span the triangle x + y <= dMax, so the grid is (dMax+1) on a side.
    const dMax = Math.floor((Math.sqrt(8 * count + 1) - 1) / 2);
    const side = dMax + 1;
    const pad = 8;
    const cell = Math.max(1, Math.floor((Math.min(width, height) - pad * 2) / side));
    const drawSize = cell > 2 ? cell - 1 : cell;

    // Root at the bottom-left: x grows rightward, y grows upward (flip screen y).
    const ox = pad;
    const oy = height - pad;

    const flags = cachedSieve(count);
    ctx.fillStyle = '#7fd1ff';

    let n = 0;
    for (let d = 0; n <= count; d++) {
      const fromXAxis = d % 2 === 1; // odd diagonals start on the x-axis
      for (let k = 0; k <= d && n <= count; k++, n++) {
        if (!flags[n]) continue;
        const x = fromXAxis ? d - k : k;
        const y = fromXAxis ? k : d - k;
        const px = ox + x * cell;
        const py = oy - (y + 1) * cell;
        ctx.fillRect(px, py, drawSize, drawSize);
      }
    }
  },
};
