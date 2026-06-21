import { cachedSieve } from '../core/primes.js';
import { drawCellLabels } from '../core/labels.js';

// Walk the integers 1..count in an outward square spiral, filling a cell
// whenever the integer is prime. The primes famously cluster along diagonals.
//
// Drawn in world coordinates (1 unit = 1 cell, centered on the origin) so the
// camera can pan/zoom freely. Cells outside the visible rect are skipped.

// Once cells are at least this many screen pixels, label the prime squares.
const LABEL_MIN_SCALE = 26;

// The spiral has no cheap closed-form inverse, so cache a coordinate->integer
// lookup (built once per count) to answer hover queries in O(1).
let cachedIndex = null;
function spiralIndex(count) {
  if (cachedIndex && cachedIndex.count === count) return cachedIndex;
  const r = Math.ceil(Math.sqrt(count) / 2) + 2;
  const w = 2 * r + 1;
  const arr = new Int32Array(w * w); // 0 = empty (integers start at 1)
  let x = 0, y = 0, dx = 1, dy = 0, segLen = 1, segPassed = 0, turns = 0;
  for (let n = 1; n <= count; n++) {
    if (Math.abs(x) <= r && Math.abs(y) <= r) arr[(y + r) * w + (x + r)] = n;
    x += dx;
    y += dy;
    if (++segPassed === segLen) {
      segPassed = 0;
      const ndx = dy, ndy = -dx;
      dx = ndx;
      dy = ndy;
      if (++turns % 2 === 0) segLen++;
    }
  }
  cachedIndex = { count, r, w, arr };
  return cachedIndex;
}

export default {
  id: 'ulam-spiral',
  name: 'Ulam Spiral',
  description: 'Integers spiraled outward; primes highlighted. Watch the diagonal streaks emerge.',

  // Tweakable knob (no UI yet — edit and reload).
  count: 250000,

  bounds() {
    const r = Math.ceil(Math.sqrt(this.count) / 2) + 1;
    return { minX: -r, minY: -r, maxX: r, maxY: r };
  },

  // World position -> the integer in that cell (or null).
  at(wx, wy) {
    const x = Math.round(wx);
    const y = Math.round(wy);
    const idx = spiralIndex(this.count);
    if (Math.abs(x) > idx.r || Math.abs(y) > idx.r) return null;
    const n = idx.arr[(y + idx.r) * idx.w + (x + idx.r)];
    return n ? { n, x, y } : null;
  },

  draw(renderer, view) {
    const { ctx } = renderer;
    const count = this.count;
    const flags = cachedSieve(count);
    const m = 1; // cull margin (world units)
    const showLabels = view.scale >= LABEL_MIN_SCALE;
    const labels = showLabels ? [] : null;

    ctx.fillStyle = '#7fd1ff';

    // Spiral state in grid units.
    let x = 0, y = 0, dx = 1, dy = 0, segLen = 1, segPassed = 0, turns = 0;

    for (let n = 1; n <= count; n++) {
      if (flags[n] &&
          x >= view.minX - m && x <= view.maxX + m &&
          y >= view.minY - m && y <= view.maxY + m) {
        ctx.fillRect(x - 0.45, y - 0.45, 0.9, 0.9);
        if (labels) labels.push(n, x, y);
      }
      x += dx;
      y += dy;
      if (++segPassed === segLen) {
        segPassed = 0;
        const ndx = dy, ndy = -dx;
        dx = ndx;
        dy = ndy;
        if (++turns % 2 === 0) segLen++;
      }
    }

    if (labels && labels.length) drawCellLabels(ctx, renderer.dpr, view, labels);
  },
};
