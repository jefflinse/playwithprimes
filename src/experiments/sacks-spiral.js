import { primesUpTo } from '../core/primes.js';

// Sacks spiral: place integer n at polar (r = √n, θ = 2π√n). Perfect squares
// (n = k²) land on the positive-x ray, and primes trace smooth parabolic curves
// — most famously Euler's n² + n + 41. A continuous cousin of the Ulam spiral.
//
// A point cloud (like the polar plot), so no per-cell hover inverse.

let cached = null;
function primesFor(max) {
  if (!cached || cached.max !== max) cached = { max, list: primesUpTo(max) };
  return cached.list;
}

export default {
  id: 'sacks-spiral',
  name: 'Sacks Spiral',
  description: 'n at polar (r = √n, θ = 2π√n). Squares align on one ray; primes trace parabolas.',

  params: {
    count: { type: 'int', min: 1000, max: 10000000, step: 1000, scale: 'log', default: 1000000, label: 'Integers', expensive: true },
    palette: { type: 'enum', default: '#9ad1ff', label: 'Palette', options: [
      { value: '#9ad1ff', label: 'Ice' },
      { value: '#ffb86b', label: 'Ember' },
      { value: '#8affc1', label: 'Mint' },
      { value: '#cfd8e3', label: 'Mono' },
    ] },
    dotSize: { type: 'float', min: 0.8, max: 3, step: 0.1, default: 1.4, label: 'Dot size (px)' },
  },

  bounds(params) {
    const r = Math.sqrt(params.count);
    return { minX: -r, minY: -r, maxX: r, maxY: r };
  },

  draw(renderer, view, params) {
    const { ctx } = renderer;
    const primes = primesFor(params.count);
    const size = params.dotSize / view.scale;
    const half = size / 2;
    const TWO_PI = Math.PI * 2;

    ctx.fillStyle = params.palette;
    for (let i = 0; i < primes.length; i++) {
      const p = primes[i];
      const r = Math.sqrt(p);
      const theta = TWO_PI * r;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      if (x < view.minX - size || x > view.maxX + size ||
          y < view.minY - size || y > view.maxY + size) continue;
      ctx.fillRect(x - half, y - half, size, size);
    }
  },
};
