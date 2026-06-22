import { experiments } from './core/registry.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { isPrime } from './core/primes.js';
import { buildPanel, defaultsFor } from './core/params.js';

const canvas = document.getElementById('stage');
const picker = document.getElementById('picker');
const nameEl = document.getElementById('exp-name');
const descEl = document.getElementById('exp-desc');
const readout = document.getElementById('readout');
const paramsEl = document.getElementById('params');
const resetBtn = document.getElementById('reset-params');

const renderer = createRenderer(canvas);
const camera = createCamera();
let current = experiments[0];
let dirty = true;

// Per-experiment parameter values, preserved as you switch between experiments.
const valuesByExp = new Map();
function valuesFor(exp) {
  if (!valuesByExp.has(exp.id)) valuesByExp.set(exp.id, defaultsFor(exp.params || {}));
  return valuesByExp.get(exp.id);
}
let params = valuesFor(current);

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
    current.draw(renderer, view, params);
  } catch (err) {
    console.error(`Experiment "${current.id}" failed:`, err);
  }
  if (resized) requestRender();
}

function select(exp) {
  current = exp;
  params = valuesFor(exp);
  nameEl.textContent = exp.name;
  descEl.textContent = exp.description || '';
  for (const btn of picker.children) {
    btn.classList.toggle('active', btn.dataset.id === exp.id);
  }
  buildParamPanel();
  if (usesCamera(exp) && exp.bounds) {
    renderer.resize();
    camera.fit(exp.bounds(params), renderer.width, renderer.height);
  }
  hideReadout();
  requestRender();
}

// --- Parameters: hybrid redraw (cheap live, expensive debounced) ---

let debounceTimer;
function buildParamPanel() {
  buildPanel(paramsEl, current.params || {}, params, (key, value, spec) => {
    if (spec.expensive) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(requestRender, 150);
    } else {
      requestRender();
    }
  });
  resetBtn.style.display = current.params ? 'block' : 'none';
}

resetBtn.addEventListener('click', () => {
  const fresh = defaultsFor(current.params || {});
  Object.assign(params, fresh);
  buildParamPanel();
  requestRender();
});

// --- Hover readout: which integer is under the cursor ---

function hideReadout() {
  readout.style.display = 'none';
}

function updateReadout(sx, sy) {
  if (sx == null || !usesCamera(current) || !current.at) return hideReadout();
  const w = camera.screenToWorld(sx, sy);
  const hit = current.at(w.x, w.y, params);
  if (!hit) return hideReadout();

  // Experiments may supply their own label/prime flag (e.g. Gaussian "a+bi");
  // otherwise fall back to the integer n and a primality test.
  const label = hit.label ?? String(hit.n);
  const prime = hit.prime ?? (hit.n != null ? isPrime(hit.n) : false);
  readout.innerHTML =
    `<span class="n">${label}</span>` +
    `<span class="kind ${prime ? 'p' : 'c'}">${prime ? 'prime' : 'composite'}</span>`;
  readout.style.display = 'block';

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
    camera.fit(current.bounds(params), renderer.width, renderer.height);
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
