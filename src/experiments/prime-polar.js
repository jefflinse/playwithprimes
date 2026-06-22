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

  params: {
    maxPrime: { type: 'int', min: 1000, max: 10000000, step: 1000, scale: 'log', default: 3000000, label: 'Max prime', expensive: true },
    palette: { type: 'enum', default: '#9ad1ff', label: 'Palette', options: [
      { value: '#9ad1ff', label: 'Ice' },
      { value: '#ffb86b', label: 'Ember' },
      { value: '#8affc1', label: 'Mint' },
      { value: '#cfd8e3', label: 'Mono' },
    ] },
    dotSize: { type: 'float', min: 0.8, max: 3, step: 0.1, default: 1.6, label: 'Dot size (px)' },
  },

  bounds(params) {
    const r = params.maxPrime;
    return { minX: -r, minY: -r, maxX: r, maxY: r };
  },

  draw(renderer, view, params) {
    const { ctx } = renderer;
    const primes = primesFor(params.maxPrime);
    const size = params.dotSize / view.scale; // ~constant px on screen
    const half = size / 2;

    ctx.fillStyle = params.palette;
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
