import { cachedSieve, isPrime } from '../core/primes.js';

// Gaussian primes: the primes of the Gaussian integers ℤ[i], plotted as lattice
// points a + bi in the complex plane. A point is a Gaussian prime iff:
//   - one coordinate is 0 and the other is ±p with p a rational prime ≡ 3 (mod 4)
//   - both coordinates are nonzero and a² + b² is a rational prime
// The result is a fourfold-symmetric field laced with prime-free "moats".

function isGaussianPrime(a, b) {
  if (a === 0 && b === 0) return false;
  if (a === 0) { const n = Math.abs(b); return isPrime(n) && n % 4 === 3; }
  if (b === 0) { const n = Math.abs(a); return isPrime(n) && n % 4 === 3; }
  return isPrime(a * a + b * b);
}

// Cache a boolean grid by extent N. Uses a sieve up to 2N² (the largest norm)
// so building stays fast even for large N.
let grid = null;
function buildGrid(N) {
  if (grid && grid.N === N) return grid;
  const flags = cachedSieve(2 * N * N);
  const w = 2 * N + 1;
  const arr = new Uint8Array(w * w);
  for (let b = -N; b <= N; b++) {
    for (let a = -N; a <= N; a++) {
      let gp = 0;
      if (a === 0 && b === 0) gp = 0;
      else if (a === 0) { const n = Math.abs(b); gp = flags[n] && n % 4 === 3 ? 1 : 0; }
      else if (b === 0) { const n = Math.abs(a); gp = flags[n] && n % 4 === 3 ? 1 : 0; }
      else gp = flags[a * a + b * b] ? 1 : 0;
      if (gp) arr[(b + N) * w + (a + N)] = 1;
    }
  }
  grid = { N, w, arr };
  return grid;
}

export default {
  id: 'gaussian-primes',
  name: 'Gaussian Primes',
  description: 'Primes of the Gaussian integers ℤ[i] in the complex plane — fourfold symmetric, with moats.',

  params: {
    radius: { type: 'int', min: 20, max: 1500, step: 10, default: 300, label: 'Extent (±)', expensive: true },
    color: { type: 'color', default: '#7fd1ff', label: 'Prime color' },
    showAxes: { type: 'bool', default: true, label: 'Show axes' },
  },

  bounds(params) {
    const N = params.radius;
    return { minX: -N, minY: -N, maxX: N, maxY: N };
  },

  // World position -> the Gaussian integer there, with a custom label.
  at(wx, wy, params) {
    const a = Math.round(wx);
    const b = Math.round(wy);
    const N = params.radius;
    if (Math.abs(a) > N || Math.abs(b) > N) return null;
    const label = `${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}i`;
    return { x: a, y: b, label, prime: isGaussianPrime(a, b) };
  },

  draw(renderer, view, params) {
    const { ctx } = renderer;
    const N = params.radius;
    const g = buildGrid(N);

    const x0 = Math.max(Math.floor(view.minX), -N);
    const x1 = Math.min(Math.ceil(view.maxX), N);
    const y0 = Math.max(Math.floor(view.minY), -N);
    const y1 = Math.min(Math.ceil(view.maxY), N);

    if (params.showAxes) {
      ctx.strokeStyle = 'rgba(120,140,180,0.25)';
      ctx.lineWidth = 1 / view.scale;
      ctx.beginPath();
      ctx.moveTo(-N, 0); ctx.lineTo(N, 0);
      ctx.moveTo(0, -N); ctx.lineTo(0, N);
      ctx.stroke();
    }

    ctx.fillStyle = params.color;
    for (let b = y0; b <= y1; b++) {
      for (let a = x0; a <= x1; a++) {
        if (g.arr[(b + g.N) * g.w + (a + g.N)]) ctx.fillRect(a - 0.45, b - 0.45, 0.9, 0.9);
      }
    }
  },
};
