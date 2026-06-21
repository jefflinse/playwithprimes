import { cachedSieve } from '../core/primes.js';
import { drawCellLabels } from '../core/labels.js';

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

// Once labels are at least this many screen pixels tall, draw the integer
// inside each visible prime square.
const LABEL_MIN_SCALE = 26;

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

  // World position -> the integer in that cell (or null). Inverse of the
  // forward mapping below; closed-form via the Cantor diagonal.
  at(wx, wy) {
    const x = Math.floor(wx);
    const y = Math.floor(wy);
    if (x < 0 || y < 0) return null;
    const d = x + y;
    const triangular = (d * (d + 1)) / 2;
    const k = d % 2 === 1 ? d - x : x; // odd diagonals start on the x-axis
    const n = triangular + k;
    if (n > this.count) return null;
    return { n, x, y };
  },

  draw(renderer, view) {
    const { ctx } = renderer;
    const count = this.count;
    const flags = cachedSieve(count);
    const m = 1; // cull margin (world units)
    const showLabels = view.scale >= LABEL_MIN_SCALE;
    const labels = showLabels ? [] : null;

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
        if (labels) labels.push(n, x + 0.5, y + 0.5);
      }
    }

    if (labels && labels.length) drawCellLabels(ctx, renderer.dpr, view, labels);
  },
};
