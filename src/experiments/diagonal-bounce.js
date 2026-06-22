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
// world coordinates; we iterate only the visible cells and invert the mapping
// per cell, so the count can run into the millions and stay smooth zoomed in.

// Once cells are at least this many screen pixels, draw the integer inside
// each visible prime square.
const LABEL_MIN_SCALE = 26;

// Cell (x, y) -> integer n, via the Cantor diagonal.
function cellN(x, y) {
  const d = x + y;
  const k = d % 2 === 1 ? d - x : x; // odd diagonals start on the x-axis
  return (d * (d + 1)) / 2 + k;
}

export default {
  id: 'diagonal-bounce',
  name: 'Diagonal Bounce',
  description: 'Integers fill bouncing anti-diagonals from the bottom-left corner; primes highlighted.',

  params: {
    count: { type: 'int', min: 1000, max: 10000000, step: 1000, scale: 'log', default: 3000000, label: 'Integers', expensive: true },
    color: { type: 'color', default: '#7fd1ff', label: 'Prime color' },
    showLabels: { type: 'bool', default: true, label: 'Labels when zoomed' },
  },

  bounds(params) {
    const dMax = Math.floor((Math.sqrt(8 * params.count + 1) - 1) / 2);
    return { minX: 0, minY: 0, maxX: dMax + 1, maxY: dMax + 1 };
  },

  // World position -> the integer in that cell (or null).
  at(wx, wy, params) {
    const x = Math.floor(wx);
    const y = Math.floor(wy);
    if (x < 0 || y < 0) return null;
    const n = cellN(x, y);
    return n <= params.count ? { n, x, y } : null;
  },

  draw(renderer, view, params) {
    const { ctx } = renderer;
    const count = params.count;
    const flags = cachedSieve(count);
    const b = this.bounds(params);

    // Iterate only the visible cells, clamped to the data extent.
    const x0 = Math.max(Math.floor(view.minX), 0);
    const x1 = Math.min(Math.ceil(view.maxX), b.maxX);
    const y0 = Math.max(Math.floor(view.minY), 0);
    const y1 = Math.min(Math.ceil(view.maxY), b.maxY);

    const labels = (params.showLabels && view.scale >= LABEL_MIN_SCALE) ? [] : null;
    ctx.fillStyle = params.color;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const n = cellN(x, y);
        if (n > count || !flags[n]) continue;
        ctx.fillRect(x + 0.05, y + 0.05, 0.9, 0.9);
        if (labels) labels.push(n, x + 0.5, y + 0.5);
      }
    }

    if (labels && labels.length) drawCellLabels(ctx, renderer.dpr, view, labels);
  },
};
