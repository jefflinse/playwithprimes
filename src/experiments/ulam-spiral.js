import { cachedSieve } from '../core/primes.js';

// Walk the integers 1..count in an outward square spiral, filling a cell
// whenever the integer is prime. The primes famously cluster along diagonals.
//
// Drawn in world coordinates (1 unit = 1 cell, centered on the origin) so the
// camera can pan/zoom freely. Cells outside the visible rect are skipped.
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

  draw(renderer, view) {
    const { ctx } = renderer;
    const count = this.count;
    const flags = cachedSieve(count);
    const m = 1; // cull margin (world units)

    ctx.fillStyle = '#7fd1ff';

    // Spiral state in grid units.
    let x = 0;
    let y = 0;
    let dx = 1;
    let dy = 0;
    let segLen = 1;
    let segPassed = 0;
    let turns = 0;

    for (let n = 1; n <= count; n++) {
      if (flags[n] &&
          x >= view.minX - m && x <= view.maxX + m &&
          y >= view.minY - m && y <= view.maxY + m) {
        ctx.fillRect(x - 0.45, y - 0.45, 0.9, 0.9);
      }
      x += dx;
      y += dy;
      if (++segPassed === segLen) {
        segPassed = 0;
        const ndx = dy;
        const ndy = -dx;
        dx = ndx;
        dy = ndy;
        if (++turns % 2 === 0) segLen++;
      }
    }
  },
};
