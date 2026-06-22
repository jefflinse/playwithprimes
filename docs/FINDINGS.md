# Experimath — Findings

> Observations worth keeping, with enough rigor to reproduce. Each entry records
> what we saw, what it actually is, and how it was verified.

---

## F1 — Prime-rich diagonal lines in the Diagonal Bounce layout

**Experiment:** `diagonal-bounce` (Cantor pairing enumeration; primes highlighted).

**Observation.** At a zoomed-out view the figure is shot through with diagonal
striping running parallel to the main diagonal, and a few lines stand out as
strikingly bright (prime-dense). One especially prominent line starts partway
along the bottom edge and runs up to the hypotenuse.

### The layout's mapping

Cell `(x, y)` (origin bottom-left, `x, y ≥ 0`) holds integer `n`, with
`d = x + y` and `T(d) = d(d+1)/2`:

- `d` even → `n = T(d) + x`
- `d` odd  → `n = T(d) + y`

### Slope-1 lines split by parity (the striping)

Consider a line `y = x + c`. Tracking the parity of `n` along it gives a clean rule:

> **`n` is even for *every* cell on the line ⟺ `c ≡ 0` or `1 (mod 4)`.**

So lines with `c ≡ 0, 1 (mod 4)` are **entirely composite** (dark); lines with
`c ≡ 2, 3 (mod 4)` are **prime-eligible** (bright). The dark lines come in pairs
every four steps, which is the fine diagonal texture across the whole image.
Examples: `y = x` gives `n = 2x(x+1)` (always even); `y = x+1` gives `n = 2(x+1)²`
(always even).

### The bright lines are the quadratics `n = 2u² − K`

For an odd offset, write `c = −(2K − 1)` (so `K = (1 − c)/2`). Substituting
`x = (2K−1) + s` and simplifying, the integers along the line are exactly:

```
n = 2u² − K,   for u = K, K+1, K+2, …
```

Every such line is a prime-generating quadratic of this form. Their prime density
is governed by `K`, and the richest land on **prime `K`** — these are Euler-style
prime-dense polynomials (same spirit as Euler's `u² + u + 41`); the mechanism is
which small primes are permitted to divide `2u² − K` (a quadratic-residue condition).
(Even-offset bright lines, `c ≡ 2 mod 4`, carry their own analogous quadratics,
e.g. `c = 2` → `2x² + 6x + 3`.)

### Standout lines (count = 3,000,000; background density ≈ 7.3%)

| offset `c` | quadratic | prime density |
|-----------:|-----------|--------------:|
| `−1` (main diagonal neighbor) | `2u² − 1` | ~28% |
| `−361` | `2u² − 181` | ~48% |
| **`−397`** | **`2u² − 199`** | **~54%** |

**The circled / "very obvious" line is `c = −397`: `n = 2u² − 199`** — the most
prime-dense line in the figure at ~54%, roughly **8× the background**. It begins at
cell `(397, 0)` and runs up-right to the hypotenuse; first primes on it: 79801,
80603, 81409, 82219, 84673, 88001, …

### Verification

- A fair-band scan (prime density along each `y = x + c` for `x ∈ [200, 1000]`,
  so lines are compared over the same magnitudes) ranks `c = −397` (57%) and
  `c = −361` (50%) at the top — far above the ~7% background.
- The closed-form `n = 2u² − 199` was checked cell-by-cell against the layout's
  forward mapping along the `c = −397` line (exact match).
- The line's screen position (starts ~16% along the bottom edge, meets the
  hypotenuse right of center) matches where it was visually circled.

### Open leads

- Catalogue which `K` are richest and whether it tracks a known class of
  prime-generating quadratics / class numbers.
- Do the same prime-rich quadratics appear (rotated/reflected) in the **Ulam
  spiral**? Ulam's diagonals are also quadratics — compare the two layouts.
- A **line probe** tool (click a cell → highlight its slope-1 line, print its
  `2u² − K` and live density) would turn this from eyeballing into measurement.
