// Schema-driven parameter controls. Each experiment may export a `params`
// schema; this module turns it into DOM controls and reports changes.
//
// Schema entry shapes (keyed by param name):
//   { type:'int'|'float', min, max, step?, scale?:'log', default, label?, expensive? }
//   { type:'bool', default, label? }
//   { type:'enum', options:[{value,label}]|string[], default, label? }
//   { type:'color', default, label? }
//
// `expensive: true` marks a param whose redraw should be debounced (e.g. one
// that rebuilds the sieve). The panel itself doesn't debounce — it just reports
// the spec on change so the caller can decide.

export function defaultsFor(schema) {
  const values = {};
  for (const key in schema) values[key] = schema[key].default;
  return values;
}

// Build controls into `container`, seeded from `values` (mutated in place on
// change). `onChange(key, value, spec)` fires after each change.
export function buildPanel(container, schema, values, onChange) {
  container.innerHTML = '';
  for (const key in schema) {
    const spec = schema[key];
    const row = document.createElement('div');
    row.className = 'param-row';

    const label = document.createElement('label');
    label.className = 'param-label';
    label.textContent = spec.label || key;
    row.appendChild(label);

    const report = (v) => { values[key] = v; onChange(key, v, spec); };
    row.appendChild(makeControl(spec, values[key], report));
    container.appendChild(row);
  }
}

function makeControl(spec, value, report) {
  switch (spec.type) {
    case 'int':
    case 'float': return makeNumber(spec, value, report);
    case 'bool': return makeBool(value, report);
    case 'enum': return makeEnum(spec, value, report);
    case 'color': return makeColor(value, report);
    default: {
      const span = document.createElement('span');
      span.textContent = `?${spec.type}`;
      return span;
    }
  }
}

// Slider + numeric box, kept in sync. Supports a log scale for wide ranges.
function makeNumber(spec, value, report) {
  const wrap = document.createElement('div');
  wrap.className = 'param-number';

  const isInt = spec.type === 'int';
  const isLog = spec.scale === 'log';
  const { min, max } = spec;
  const STEPS = 1000;

  const toPos = (v) => isLog
    ? (Math.log(v / min) / Math.log(max / min)) * STEPS
    : ((v - min) / (max - min)) * STEPS;
  const fromPos = (p) => {
    const t = p / STEPS;
    let v = isLog ? min * Math.pow(max / min, t) : min + (max - min) * t;
    if (isInt) v = Math.round(v);
    else if (spec.step) v = Math.round(v / spec.step) * spec.step;
    return v;
  };

  const range = document.createElement('input');
  range.type = 'range';
  range.min = 0; range.max = STEPS; range.step = 1;
  range.value = toPos(value);

  const box = document.createElement('input');
  box.type = 'number';
  box.min = min; box.max = max;
  if (spec.step) box.step = spec.step;
  box.value = value;

  range.addEventListener('input', () => {
    const v = fromPos(+range.value);
    box.value = v;
    report(v);
  });
  box.addEventListener('input', () => {
    let v = +box.value;
    if (Number.isNaN(v)) return;
    v = Math.min(max, Math.max(min, v));
    range.value = toPos(v);
    report(v);
  });

  wrap.appendChild(range);
  wrap.appendChild(box);
  return wrap;
}

function makeBool(value, report) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'param-bool';
  input.checked = !!value;
  input.addEventListener('change', () => report(input.checked));
  return input;
}

function makeEnum(spec, value, report) {
  const select = document.createElement('select');
  select.className = 'param-enum';
  for (const opt of spec.options) {
    const { value: v, label } = typeof opt === 'string' ? { value: opt, label: opt } : opt;
    const o = document.createElement('option');
    o.value = v;
    o.textContent = label;
    if (v === value) o.selected = true;
    select.appendChild(o);
  }
  select.addEventListener('change', () => report(select.value));
  return select;
}

function makeColor(value, report) {
  const input = document.createElement('input');
  input.type = 'color';
  input.className = 'param-color';
  input.value = value;
  input.addEventListener('input', () => report(input.value));
  return input;
}
