// Draw integer labels centered on grid cells.
//
// Runs in a screen-space pass (resets to the dpr transform) so the camera's
// y-flip doesn't mirror the text. `cells` is a flat array of triples
// [n, worldCx, worldCy, ...]; font size is fit to the on-screen cell width so
// multi-digit numbers don't overflow. `view.toScreen` maps world -> CSS px.
export function drawCellLabels(ctx, dpr, view, cells, color = '#04101c') {
  const cellPx = view.scale;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < cells.length; i += 3) {
    const text = String(cells[i]);
    const fs = Math.min(cellPx * 0.5, (cellPx * 0.85) / (text.length * 0.6));
    if (fs < 7) continue; // too small to read; skip
    const s = view.toScreen(cells[i + 1], cells[i + 2]);
    ctx.font = `${fs}px system-ui, sans-serif`;
    ctx.fillText(text, s.x, s.y);
  }
  ctx.restore();
}
