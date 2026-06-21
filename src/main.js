import { experiments } from './core/registry.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { isPrime } from './core/primes.js';

const canvas = document.getElementById('stage');
const picker = document.getElementById('picker');
const nameEl = document.getElementById('exp-name');
const descEl = document.getElementById('exp-desc');
const readout = document.getElementById('readout');

const renderer = createRenderer(canvas);
const camera = createCamera();
let current = experiments[0];
let dirty = true;

const usesCamera = (exp) => exp.camera !== false;
const requestRender = () => { dirty = true; };

// Single rAF loop; redraws only when something changed.
function frame() {
  if (dirty) {
    dirty = false;
    draw();
  }
  requestAnimationFrame(frame);
}

function draw() {
  const resized = renderer.resize();
  renderer.clear();
  const ctx = renderer.ctx;

  let view;
  if (usesCamera(current)) {
    camera.apply(ctx, renderer.dpr);
    view = camera.visibleRect(renderer.width, renderer.height);
    view.scale = camera.scale;
    view.toScreen = camera.worldToScreen;
  } else {
    ctx.setTransform(renderer.dpr, 0, 0, renderer.dpr, 0, 0);
    view = { scale: 1, minX: 0, minY: 0, maxX: renderer.width, maxY: renderer.height };
  }

  try {
    current.draw(renderer, view);
  } catch (err) {
    console.error(`Experiment "${current.id}" failed:`, err);
  }
  // Note if a resize happened mid-loop so the next frame reflects new size.
  if (resized) requestRender();
}

function select(exp) {
  current = exp;
  nameEl.textContent = exp.name;
  descEl.textContent = exp.description || '';
  for (const btn of picker.children) {
    btn.classList.toggle('active', btn.dataset.id === exp.id);
  }
  if (usesCamera(exp) && exp.bounds) {
    renderer.resize();
    camera.fit(exp.bounds(), renderer.width, renderer.height);
  }
  hideReadout();
  requestRender();
}

// --- Hover readout: which integer is under the cursor ---

function hideReadout() {
  readout.style.display = 'none';
}

function updateReadout(sx, sy) {
  if (sx == null || !usesCamera(current) || !current.at) return hideReadout();
  const w = camera.screenToWorld(sx, sy);
  const hit = current.at(w.x, w.y);
  if (!hit) return hideReadout();

  const prime = isPrime(hit.n);
  readout.innerHTML =
    `<span class="n">${hit.n}</span>` +
    `<span class="kind ${prime ? 'p' : 'c'}">${prime ? 'prime' : 'composite'}</span>`;
  readout.style.display = 'block';

  // Offset from the cursor, flipping to stay inside the viewport.
  let left = sx + 16;
  let top = sy + 16;
  if (left + readout.offsetWidth > renderer.width) left = sx - readout.offsetWidth - 16;
  if (top + readout.offsetHeight > renderer.height) top = sy - readout.offsetHeight - 16;
  readout.style.left = `${left}px`;
  readout.style.top = `${top}px`;
}

// --- Interaction: drag to pan, scroll to zoom, double-click to reset ---

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
  if (!usesCamera(current)) return;
  dragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (dragging) {
    camera.panBy(e.offsetX - lastX, e.offsetY - lastY);
    lastX = e.offsetX;
    lastY = e.offsetY;
    requestRender();
  }
  updateReadout(e.offsetX, e.offsetY);
});

canvas.addEventListener('pointerleave', hideReadout);

const endDrag = (e) => {
  if (!dragging) return;
  dragging = false;
  if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

canvas.addEventListener('wheel', (e) => {
  if (!usesCamera(current)) return;
  e.preventDefault();
  const factor = Math.exp(-e.deltaY * 0.0015);
  camera.zoomAt(e.offsetX, e.offsetY, factor);
  updateReadout(e.offsetX, e.offsetY);
  requestRender();
}, { passive: false });

canvas.addEventListener('dblclick', () => {
  if (usesCamera(current) && current.bounds) {
    camera.fit(current.bounds(), renderer.width, renderer.height);
    requestRender();
  }
});

window.addEventListener('resize', requestRender);

// Build the picker from the registry.
for (const exp of experiments) {
  const btn = document.createElement('button');
  btn.textContent = exp.name;
  btn.dataset.id = exp.id;
  btn.addEventListener('click', () => select(exp));
  picker.appendChild(btn);
}

select(current);
requestAnimationFrame(frame);
