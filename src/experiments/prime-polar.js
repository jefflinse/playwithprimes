import { primesUpTo } from '../core/primes.js';
import { polarToCartesian } from '../core/viewport.js';

// Plot each prime p at polar coordinates (r = p, θ = p radians). The
// rational approximations of 2π carve the points into spiral arms and rays.
export default {
  id: 'prime-polar',
  name: 'Prime Polar Plot',
  description: 'Each prime p placed at polar (r = p, θ = p). Spiral arms and rays appear.',

  // Tweakable knob (no UI yet — edit and reload).
  maxPrime: 200000,

  draw(renderer) {
    const { ctx, width, height } = renderer;
    const primes = primesUpTo(this.maxPrime);

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(width, height) / 2 - 12;
    const scale = maxR / this.maxPrime; // map r = p into the viewport radius

    ctx.fillStyle = '#9ad1ff';
    for (const p of primes) {
      const { x, y } = polarToCartesian(p * scale, p);
      ctx.fillRect(cx + x - 0.75, cy - y - 0.75, 1.5, 1.5); // flip y for screen
    }
  },
};
