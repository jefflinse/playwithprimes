import { cachedSieve } from '../core/primes.js';
import { drawCellLabels } from '../core/labels.js';

// Walk the integers 1..count in an outward square spiral, filling a cell
// whenever the integer is prime. The primes famously cluster along diagonals.
//
// Drawn in world coordinates (1 unit = 1 cell, centered on the origin). Rather
// than walk every integer each frame, we iterate only the visible cells and
// invert the spiral per cell — so cost scales with what's on screen, letting
// the count run into the millions while staying smooth when zoomed in.

// Once cells are at least this many screen pixels, label the prime squares.
const LABEL_MIN_SCALE = 26;

// Closed-form inverse of the spiral: grid cell (x, y) -> integer n.
// (Verified exact against the forward walk.)
function spiralN(x, y) {
  if (x === 0 && y === 0) return 1;
  const r = Math.max(Math.abs(x), Math.abs(y));
  let offset;
  if (y === r) offset = 7 * r + x;        // top edge
  else if (x === r) offset = r - y;       // right edge
  else if (y === -r) offset = 3 * r - x;  // bottom edge
  else offset = 5 * r + y;                // left edge
  return (2 * r - 1) * (2 * r - 1) + offset;
}

export default {
  id: 'ulam-spiral',
  name: 'Ulam Spiral',
  description: 'Integers spiraled outward; primes highlighted. Watch the diagonal streaks emerge.',

  params: {
    count: { type: 'int', min: 1000, max: 10000000, step: 1000, scale: 'log', default: 3000000, label: 'Integers', expensive: true },
    color: { type: 'color', default: '#7fd1ff', label: 'Prime color' },
    showLabels: { type: 'bool', default: true, label: 'Labels when zoomed' },
  },

  bounds(params) {
    const r = Math.ceil(Math.sqrt(params.count) / 2) + 1;
    return { minX: -r, minY: -r, maxX: r, maxY: r };
  },

  // World position -> the integer in that cell (or null).
  at(wx, wy, params) {
    const x = Math.round(wx);
    const y = Math.round(wy);
    const n = spiralN(x, y);
    return n >= 1 && n <= params.count ? { n, x, y } : null;
  },

  draw(renderer, view, params) {
    const { ctx } = renderer;
    const count = params.count;
    const flags = cachedSieve(count);
    const b = this.bounds(params);

    // Iterate only the visible cells, clamped to the data extent.
    const x0 = Math.max(Math.floor(view.minX), b.minX);
    const x1 = Math.min(Math.ceil(view.maxX), b.maxX);
    const y0 = Math.max(Math.floor(view.minY), b.minY);
    const y1 = Math.min(Math.ceil(view.maxY), b.maxY);

    const labels = (params.showLabels && view.scale >= LABEL_MIN_SCALE) ? [] : null;
    ctx.fillStyle = params.color;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const n = spiralN(x, y);
        if (n > count || !flags[n]) continue;
        ctx.fillRect(x - 0.45, y - 0.45, 0.9, 0.9);
        if (labels) labels.push(n, x, y);
      }
    }

    if (labels && labels.length) drawCellLabels(ctx, renderer.dpr, view, labels);
  },
};
