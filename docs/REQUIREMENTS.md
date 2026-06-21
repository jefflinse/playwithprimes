# Experimath — Requirements

> A simple, flexible sandbox for playing with mathematical ideas visually in the browser.

**Status:** living document. Update as understanding evolves. Each decision carries a
status (`accepted` / `provisional` / `deferred`) so we can see what's firm vs. open.

---

## 1. Vision

A personal experimentation sandbox for visualizing mathematical ideas — starting with
prime numbers — across many different representations: Cartesian (X-Y) planes, polar
planes, grid tilings, the complex plane, number lines, and whatever comes next.

The system should make it cheap to spin up a new "experiment," see it rendered, and
iterate. It starts small with a few concrete examples and is expected to **grow in
complexity over time**. Architecture choices favor that gradual evolution over
premature generality.

**Originating idea (now built):** a grid rooted at the bottom-left where the integers
fill anti-diagonals, bouncing direction between the X and Y axes each diagonal (the
Cantor pairing enumeration), with primes highlighted. This is the "Diagonal Bounce"
experiment (F8) and the spark for the whole project.

## 2. Guiding principles

- **Start small, evolve deliberately.** Build the few concrete experiments we actually
  want now. Extract abstractions only once real patterns repeat — not before.
- **Low friction to add an experiment.** Adding experiment N+1 should mean writing one
  focused file, not touching scaffolding.
- **Keep the door open.** Early simple choices (Canvas 2D, hand-wired files) must not
  paint us into a corner. Upgrades (WebGL, a formal plugin contract, a parameter UI)
  should be additive, not rewrites.
- **Simplicity first.** Prefer the least machinery that does the job. No tooling we don't
  need yet.

## 3. Functional requirements

| # | Requirement | Status |
|---|-------------|--------|
| F1 | Runs entirely in the browser. | accepted |
| F2 | A user can choose which experiment to view from a list. | accepted |
| F3 | Each experiment renders a visualization to a drawing surface. | accepted |
| F4 | Ships with seed experiments: **Ulam spiral**, **prime polar plot**, **prime-counting / number line**. | accepted |
| F5 | New experiments can be added by writing a single self-contained file and registering it. | accepted |
| F6 | Core provides reusable math utilities (prime generation/testing) shared across experiments. | accepted |
| F7 | Core provides coordinate-mapping helpers (world↔screen, polar↔cartesian). | accepted |
| F8 | Ships the **Diagonal Bounce** experiment (the originating idea): integers on a bottom-left-rooted grid filling bouncing anti-diagonals, primes highlighted. | done |

## 4. Non-functional requirements

| # | Requirement | Status |
|---|-------------|--------|
| N1 | **Zero build step.** Plain HTML + vanilla JS (ES modules), openable directly / via a static server. No npm/bundler required to run. | accepted |
| N2 | Rendering via **Canvas 2D** initially, behind a thin seam so a WebGL/GPU backend can be introduced later without rewriting experiments wholesale. | accepted |
| N3 | Smooth enough for thousands of plotted points (primes) without noticeable lag. | accepted |
| N4 | Code stays readable and approachable — this is a thinking tool, not a product. | accepted |

## 5. Tech decisions (with rationale)

- **Browser, zero-build vanilla JS + ES modules** — *accepted.* Maximum simplicity and
  immediacy; no toolchain between idea and pixels. Trade-off accepted: no TypeScript, no
  bundler conveniences. Revisit if the project outgrows it.
- **Canvas 2D rendering** — *accepted.* All three seed experiments are point/cell/line
  plots that Canvas 2D handles trivially. WebGL deferred until an experiment actually
  needs millions of points or shader effects (see N2 seam).
- **Hand-wired experiment files, contract formalized later** — *accepted.* Begin with a
  couple of concrete files and a minimal shared shape; promote to a formal plugin
  interface once the real shape stabilizes across 3+ experiments.

## 6. Explicitly out of scope (for now)

These are deferred, **not rejected** — likely future work, intentionally excluded from
the first milestone to keep it small.

- **Configurable-parameter UI** — *deferred.* Premature. Experiments expose tweakables as
  in-code constants for now. A schema-driven control panel is a strong future candidate
  once experiments share a parameter shape.
- **WebGL / GPU rendering** — *deferred.* See N2; introduced behind the renderer seam when
  needed.
- **Pan / zoom / interaction** — *done.* Spatial experiments render in a world coordinate
  space; a shared camera (`core/camera.js`) provides drag-to-pan, scroll-to-zoom, and
  double-click-to-reset. Because experiments redraw in world coords each frame, zooming
  reveals crisp detail rather than magnifying pixels — this also subsumes the "bigger
  logical canvas" idea (the world *is* the large canvas; the viewport is a window).
  Experiments that want screen space (e.g. function plots) opt out via `camera: false`.
- **Persistence / shareable configs / image export** — *deferred.*
- **Formal experiment plugin contract** — *deferred* (F5 is satisfied informally for now).

## 7. Backlog of experiment ideas

Captured so they aren't lost; not committed.

- Primes as an X-Y scatter under configurable maps (e.g. `p → (p mod a, p ÷ a)`,
  `(n, nth-prime)`).
- Primes / integers in the complex plane (Gaussian primes).
- Other grid tilings and number-theoretic colorings (divisor counts, totient, etc.).

## 8. Open questions

- When experiments start needing tweakable inputs, do we revive the parameter-UI idea, or
  keep parameters as code constants longer? (Revisit after seeds are built.)
- What's the trigger to formalize the experiment contract? (Proposed: the 3rd experiment
  that copies the same boilerplate.)
