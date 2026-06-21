// Pan/zoom camera mapping a world coordinate space onto the screen.
//
// World coordinates use math convention (y increases upward); the camera
// flips y for the screen. All screen units here are CSS pixels — the dpr
// factor is folded in only at apply() time so it composes with DPI scaling.
//
//   screenX = offsetX + worldX * scale
//   screenY = offsetY - worldY * scale
export function createCamera() {
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  // Compose the camera with the renderer's devicePixelRatio into one transform.
  function apply(ctx, dpr) {
    ctx.setTransform(scale * dpr, 0, 0, -scale * dpr, offsetX * dpr, offsetY * dpr);
  }

  function screenToWorld(sx, sy) {
    return { x: (sx - offsetX) / scale, y: (offsetY - sy) / scale };
  }

  // Pan by a screen-space delta (CSS px).
  function panBy(dx, dy) {
    offsetX += dx;
    offsetY += dy;
  }

  // Zoom by `factor` while keeping the world point under (sx, sy) fixed.
  function zoomAt(sx, sy, factor) {
    const before = screenToWorld(sx, sy);
    scale *= factor;
    offsetX = sx - before.x * scale;
    offsetY = sy + before.y * scale;
  }

  // Frame a world bounding box within a viewport, with a little padding.
  function fit(bounds, vw, vh, pad = 0.04) {
    const bw = (bounds.maxX - bounds.minX) || 1;
    const bh = (bounds.maxY - bounds.minY) || 1;
    scale = Math.min(vw / bw, vh / bh) * (1 - pad * 2);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    offsetX = vw / 2 - cx * scale;
    offsetY = vh / 2 + cy * scale;
  }

  // The world rectangle currently visible in a vw×vh viewport (for culling).
  function visibleRect(vw, vh) {
    const a = screenToWorld(0, vh); // bottom-left of screen -> world min
    const b = screenToWorld(vw, 0); // top-right of screen   -> world max
    return { minX: a.x, minY: a.y, maxX: b.x, maxY: b.y };
  }

  return {
    apply,
    screenToWorld,
    panBy,
    zoomAt,
    fit,
    visibleRect,
    get scale() { return scale; },
  };
}
