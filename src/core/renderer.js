// Owns the canvas and hands experiments a clean, DPI-correct 2D context.
//
// THE WEBGL SEAM: experiments receive their drawing surface from here rather
// than touching the DOM canvas directly. To add a GPU backend later, add it
// behind this boundary — experiments that opt in use the new API; the rest
// keep drawing on Canvas 2D unchanged.
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;

  // Size the backing store to the element's CSS size × devicePixelRatio,
  // then scale the context so all drawing happens in CSS pixels.
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clear(bg = '#0b0e14') {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.restore();
  }

  return {
    canvas,
    ctx,
    get width() { return canvas.clientWidth; },
    get height() { return canvas.clientHeight; },
    resize,
    clear,
  };
}
