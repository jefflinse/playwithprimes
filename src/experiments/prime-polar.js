import { primesUpTo } from '../core/primes.js';

// Plot each prime p at polar coordinates (r = p, θ = p radians). The
// rational approximations of 2π carve the points into spiral arms and rays.
//
// Drawn in world coordinates (1 unit = 1 in r) so the camera can pan/zoom.
// Dots are sized in screen pixels (divided by scale) so they stay crisp.

// Cache the prime list so it isn't rebuilt on every frame.
let cached = null;
function primesFor(max) {
  if (!cached || cached.max !== max) cached = { max, list: primesUpTo(max) };
  return cached.list;
}

export default {
  id: 'prime-polar',
  name: 'Prime Polar Plot',
  description: 'Each prime p placed at polar (r = p, θ = p). Spiral arms and rays appear.',

  // Tweakable knob (no UI yet — edit and reload).
  maxPrime: 3000000,

  bounds() {
    const r = this.maxPrime;
    return { minX: -r, minY: -r, maxX: r, maxY: r };
  },

  draw(renderer, view) {
    const { ctx } = renderer;
    const primes = primesFor(this.maxPrime);
    const size = 1.6 / view.scale; // ~constant 1.6px on screen
    const half = size / 2;

    ctx.fillStyle = '#9ad1ff';
    for (let i = 0; i < primes.length; i++) {
      const p = primes[i];
      const x = p * Math.cos(p);
      const y = p * Math.sin(p);
      if (x < view.minX - size || x > view.maxX + size ||
          y < view.minY - size || y > view.maxY + size) continue;
      ctx.fillRect(x - half, y - half, size, size);
    }
  },
};
