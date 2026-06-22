import { primesUpTo } from '../core/primes.js';

// Modular residue wheel: place each prime p at angle 2π·(p mod m)/m, with radius
// √p so successive primes spread outward. Primes only occupy residues coprime to
// m, so exactly φ(m) "spokes" light up (m = 6 → 2 spokes; m = 30 → 8; m = 210 → 48).
// The modulus is a live (cheap) knob — drag it and watch the spokes reshape.
//
// A point cloud, so no per-cell hover inverse.

let cached = null;
function primesFor(max) {
  if (!cached || cached.max !== max) cached = { max, list: primesUpTo(max) };
  return cached.list;
}

export default {
  id: 'modular-wheel',
  name: 'Modular Residue Wheel',
  description: 'Each prime p at angle (p mod m)/m, radius √p. Only the φ(m) coprime residues appear.',

  params: {
    modulus: { type: 'int', min: 2, max: 210, step: 1, default: 30, label: 'Modulus m' },
    maxPrime: { type: 'int', min: 1000, max: 10000000, step: 1000, scale: 'log', default: 1000000, label: 'Max prime', expensive: true },
    palette: { type: 'enum', default: '#9ad1ff', label: 'Palette', options: [
      { value: '#9ad1ff', label: 'Ice' },
      { value: '#ffb86b', label: 'Ember' },
      { value: '#8affc1', label: 'Mint' },
      { value: '#cfd8e3', label: 'Mono' },
    ] },
    dotSize: { type: 'float', min: 0.8, max: 3, step: 0.1, default: 1.4, label: 'Dot size (px)' },
  },

  bounds(params) {
    const r = Math.sqrt(params.maxPrime);
    return { minX: -r, minY: -r, maxX: r, maxY: r };
  },

  draw(renderer, view, params) {
    const { ctx } = renderer;
    const primes = primesFor(params.maxPrime);
    const m = params.modulus;
    const size = params.dotSize / view.scale;
    const half = size / 2;
    const TWO_PI = Math.PI * 2;

    ctx.fillStyle = params.palette;
    for (let i = 0; i < primes.length; i++) {
      const p = primes[i];
      const theta = TWO_PI * (p % m) / m;
      const r = Math.sqrt(p);
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      if (x < view.minX - size || x > view.maxX + size ||
          y < view.minY - size || y > view.maxY + size) continue;
      ctx.fillRect(x - half, y - half, size, size);
    }
  },
};
