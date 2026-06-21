// Coordinate-mapping helpers. Pure math, no drawing — this is where the
// different coordinate systems the experiments need actually live.

// Polar -> cartesian. Angle in radians. Returns math-convention coords
// (y increases upward); callers flip y when writing to screen space.
export function polarToCartesian(r, theta) {
  return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
}

// Build a world->screen transform.
//   originX/originY : screen pixel where world (0,0) lands
//   scale           : screen pixels per world unit
//   flipY           : true so math "up" maps to screen "up" (default)
// Returns { x(wx), y(wy), scale } mapping world coords to screen pixels.
export function createViewport({ originX, originY, scale = 1, flipY = true }) {
  return {
    scale,
    x: (wx) => originX + wx * scale,
    y: (wy) => originY + (flipY ? -wy : wy) * scale,
  };
}
