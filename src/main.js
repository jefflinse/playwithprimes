import { experiments } from './core/registry.js';
import { createRenderer } from './core/renderer.js';

const canvas = document.getElementById('stage');
const picker = document.getElementById('picker');
const nameEl = document.getElementById('exp-name');
const descEl = document.getElementById('exp-desc');

const renderer = createRenderer(canvas);
let current = experiments[0];

// Resize the canvas, clear it, and (re)draw the current experiment.
function run() {
  renderer.resize();
  renderer.clear();
  try {
    current.draw(renderer);
  } catch (err) {
    console.error(`Experiment "${current.id}" failed:`, err);
  }
}

function select(exp) {
  current = exp;
  nameEl.textContent = exp.name;
  descEl.textContent = exp.description || '';
  for (const btn of picker.children) {
    btn.classList.toggle('active', btn.dataset.id === exp.id);
  }
  run();
}

// Build the picker from the registry.
for (const exp of experiments) {
  const btn = document.createElement('button');
  btn.textContent = exp.name;
  btn.dataset.id = exp.id;
  btn.addEventListener('click', () => select(exp));
  picker.appendChild(btn);
}

// Redraw on resize (debounced).
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(run, 100);
});

select(current);
