# Experimath — Plan

> Concrete architecture and the first build milestone. Pairs with [REQUIREMENTS.md](./REQUIREMENTS.md).

**Status:** living document. The architecture here is deliberately minimal; it exists to
make the seed experiments easy and to keep future upgrades (WebGL, plugin contract,
parameter UI) additive.

---

## 1. Architecture overview

Zero-build, vanilla ES modules. No bundler. Open `index.html` via a static server
(`python3 -m http.server`) — ES modules need `http://`, not `file://`.

### Proposed layout

```
index.html              # Shell: experiment picker + <canvas>. Imports src/main.js as a module.
src/
  main.js               # Bootstrap: build picker from registry, mount renderer, run selection.
  core/
    registry.js         # The list of available experiments (import + array). Single place to add one.
    renderer.js         # Canvas 2D setup: sizing, devicePixelRatio scaling, clear. THE WEBGL SEAM.
    viewport.js         # Coordinate transforms: world↔screen, polar→cartesian, centering/scaling.
    primes.js           # Math utilities: sieve, isPrime, primesUpTo, nthPrime, primeCount (π).
  experiments/
    ulam-spiral.js      # Seed 1
    prime-polar.js      # Seed 2
    prime-counting.js   # Seed 3
    diagonal-bounce.js  # The originating idea (Cantor pairing grid)
docs/
  REQUIREMENTS.md
  PLAN.md
```

### Module responsibilities

- **`renderer.js` — the upgrade seam (N2).** Owns the canvas, handles `devicePixelRatio`
  for crisp output, exposes a cleared 2D context plus the canvas dimensions. Experiments
  receive their drawing surface *from here* rather than reaching for the DOM canvas
  directly. When/if we add WebGL, we add a second backend behind this same boundary;
  experiments that opt in use the new API, others keep working on Canvas 2D.
- **`viewport.js`** — pure coordinate math, no drawing. Centering the origin, scaling a
  world range to pixels, `polarToCartesian(r, θ)`. This is where the "different coordinate
  mappings" the three seeds need actually live, kept reusable and testable.
- **`primes.js`** — pure number theory, no rendering. Shared by all prime experiments.
- **`registry.js` + `main.js`** — the only glue. Adding an experiment = write the file,
  add one import + array entry in `registry.js`. (This is F5, satisfied informally.)

### Current (informal) experiment shape

Not a hard contract yet — just the consistent shape the seeds will follow. We formalize
it once a third experiment is copying the same boilerplate (see REQUIREMENTS §8).

```js
// src/experiments/example.js
export default {
  id: 'example',
  name: 'Human Readable Name',
  description: 'One line shown in the picker.',
  // Tweakable knobs as plain constants for now (no UI yet — REQUIREMENTS §6).
  draw(renderer) {
    const { ctx, width, height } = renderer;
    // ...draw using ctx + core helpers (viewport, primes)...
  },
};
```

## 2. Milestone 1 — scaffold + three seed experiments  ✅ complete

Goal: an openable page with a picker that renders each of the three seeds correctly.
*(Done; the Diagonal Bounce experiment was added immediately after.)*

1. **Scaffold the shell.** `index.html` (canvas + empty picker container) and `src/main.js`
   that mounts the renderer and wires the picker to the registry.
2. **Core: `renderer.js`.** Canvas sizing + DPI scaling + clear; hand experiments a ready
   2D context.
3. **Core: `primes.js`.** `primesUpTo(n)` (sieve), `isPrime(n)`, `nthPrime(k)`,
   `primeCount(x)`. Keep simple and correct; optimize only if a seed feels slow.
4. **Core: `viewport.js`.** Origin-centering, world→screen scaling, `polarToCartesian`.
5. **Seed: `ulam-spiral.js`.** Walk integers in an outward square spiral; fill a cell when
   the integer is prime. Verify the characteristic diagonal streaks appear.
6. **Seed: `prime-polar.js`.** For each prime `p`, plot at `(r=p, θ=p)` via `viewport`'s
   polar mapping; confirm the spiral-arm / ray patterns emerge.
7. **Seed: `prime-counting.js`.** Plot π(x) as a step function (and/or primes ticked on a
   number line) using world→screen scaling.
8. **Register all three** in `registry.js` and confirm the picker switches between them.

**Done when:** opening the page (via static server) shows the picker, and selecting each
seed renders the expected visualization without errors.

## 3. Backlog (post-milestone, unordered)

Future capabilities, gated on actual need rather than scheduled:

- **Parameter UI** — schema-driven control panel once experiments share a knob shape
  (REQUIREMENTS §6, §8).
- **WebGL backend** — second renderer behind the `renderer.js` seam when point counts or
  effects demand it.
- **Pan / zoom / hover** — interaction layer on `viewport.js`.
- **Formal experiment contract** — promote the informal shape to a documented interface.
- **More experiments** — X-Y scatter maps, complex-plane / Gaussian primes, divisor/totient
  colorings (REQUIREMENTS §7).
- **Image export / shareable state** — save a render or its config.

## 4. Notes for future sessions

- Keep `core/` rendering-agnostic where reasonable (`viewport`, `primes` are pure) so the
  WebGL upgrade stays cheap.
- Resist adding the parameter UI or a plugin framework until a concrete experiment forces
  it — that's the whole point of "start small, evolve deliberately."
