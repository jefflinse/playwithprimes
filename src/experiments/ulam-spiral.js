import { cachedSieve } from '../core/primes.js';

// Walk the integers 1..count in an outward square spiral, filling a cell
// whenever the integer is prime. The primes famously cluster along diagonals.
export default {
  id: 'ulam-spiral',
  name: 'Ulam Spiral',
  description: 'Integers spiraled outward; primes highlighted. Watch the diagonal streaks emerge.',

  // Tweakable knob (no UI yet — edit and reload).
  count: 250000,

  draw(renderer) {
    const { ctx, width, height } = renderer;
    const count = this.count;

    // Grid roughly sqrt(count) on a side; size cells to fit the viewport.
    const side = Math.ceil(Math.sqrt(count));
    const cell = Math.max(1, Math.floor(Math.min(width, height) / (side + 2)));
    const cx = width / 2;
    const cy = height / 2;
    const drawSize = cell > 2 ? cell - 1 : cell;

    const flags = cachedSieve(count);

    // Spiral state: position (x,y) in grid units, current step direction,
    // and segment bookkeeping (segment length grows every two turns).
    let x = 0;
    let y = 0;
    let dx = 1;
    let dy = 0;
    let segLen = 1;
    let segPassed = 0;
    let turns = 0;

    ctx.fillStyle = '#7fd1ff';
    for (let n = 1; n <= count; n++) {
      if (flags[n]) {
        const px = cx + x * cell - drawSize / 2;
        const py = cy - y * cell - drawSize / 2; // flip y: math up = screen up
        ctx.fillRect(px, py, drawSize, drawSize);
      }

      x += dx;
      y += dy;
      if (++segPassed === segLen) {
        segPassed = 0;
        const ndx = dy;       // rotate the heading 90°
        const ndy = -dx;
        dx = ndx;
        dy = ndy;
        if (++turns % 2 === 0) segLen++;
      }
    }
  },
};
