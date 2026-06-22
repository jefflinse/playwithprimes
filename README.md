# Play With Primes

A simple, flexible sandbox for **visualizing mathematical ideas in the browser** — starting
with the primes. Pan, zoom, and tweak live parameters to explore classic prime patterns.

**Live:** https://playwithprimes.com

## Experiments

| | |
|---|---|
| **Ulam Spiral** | integers spiraled outward; primes cluster on diagonals |
| **Sacks Spiral** | `r = √n, θ = 2π√n`; primes trace parabolas (Euler's `n²+n+41`) |
| **Diagonal Bounce** | the Cantor-pairing grid; prime-rich `2u²−K` diagonals |
| **Prime Polar Plot** | `(r = p, θ = p)`; spiral arms and rays |
| **Modular Residue Wheel** | primes by `n mod m` → exactly φ(m) spokes (live `m` slider) |
| **Gaussian Primes** | primes of ℤ[i] in the complex plane; fourfold symmetry |
| **Prime Counting π(x)** | the prime-counting staircase |
| **Goldbach's Comet** | ways to write even `n` as `p + q` |

**Controls:** drag to pan · scroll to zoom · double-click to reset · hover to read off the
integer under the cursor · tweak parameters in the sidebar.

## Run locally

Zero build step — it's vanilla JS + ES modules. Just serve the folder over HTTP
(ES modules need `http://`, not `file://`):

```sh
python3 -m http.server 8123
```

Then open <http://localhost:8123/>.

## How it works

Vanilla JavaScript ES modules, Canvas 2D, no bundler. The core is small:

- `core/renderer.js` — canvas + DPI scaling (the seam for a future WebGL backend)
- `core/camera.js` — world↔screen pan/zoom
- `core/params.js` — schema-driven control panel
- `core/primes.js` — sieve / primality utilities
- `experiments/*.js` — one self-contained file per visualization

See [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) and [`docs/PLAN.md`](docs/PLAN.md) for the
design, and [`docs/FINDINGS.md`](docs/FINDINGS.md) for mathematical observations.

## Adding an experiment

Write one file in `src/experiments/` exporting `{ id, name, description, params, draw }`
(plus optional `bounds` / `at` for camera + hover), then register it in
`src/core/registry.js`. That's it.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`
(it syntax-checks the JS, then publishes the repo root).
