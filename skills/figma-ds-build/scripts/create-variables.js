// Tạo / cập nhật collection, mode và variable từ CONFIG. Idempotent: tìm theo tên, có rồi thì cập nhật.
// Chạy qua use_figma (đọc skill figma-use trước). Mỗi lượt nên chạy một tầng: primitives → semantic → typography/dimension.
// Giá trị màu: '#RRGGBB' hoặc '#RRGGBBAA' = giá trị thô; chuỗi khác = tên variable để alias (vd 'Neutral/50').

const CONFIG = {
  run: ['primitives'], // chọn tầng chạy lượt này: 'primitives' | 'semantic' | 'typography' | 'dimension'

  primitives: {
    collection: 'Primitives',
    values: {
      // 'Brand/50': '#EEF3FF', ... 'Brand/950': '#0A1440',
      // 'Neutral/50': '#F7F7F8', ...
      'Base/white': '#FFFFFF',
      'Base/black': '#000000',
    },
  },

  semantic: {
    collection: 'Semantic',
    modes: ['Light', 'Dark'],
    values: {
      // 'color/surface/base': { Light: 'Neutral/50', Dark: 'Neutral/950' },
      // 'color/overlay/scrim': { Light: '#00000066', Dark: '#00000099' },
    },
  },

  typography: {
    collection: 'Typography',
    values: {
      // 'font/family/ui': 'Inter',
      // 'font/size/14': 14,
      // 'font/weight/regular': 400,
    },
  },

  dimension: {
    collection: 'Dimension',
    values: {
      // 'space/4': 4, 'space/8': 8,
      // 'radius/card': 16, 'radius/pill': 999,
      // 'size/control/l': 48,
    },
  },

  // Code syntax cho từng nền tảng; bỏ key nào không dùng. name = tên variable.
  codeSyntax: {
    WEB: name => `var(--${name.replace(/\//g, '-')})`,
    // ANDROID: name => 'AppTheme.' + toCode(name),
    // iOS: name => toCode(name),
  },
};

// ---------- helpers ----------
const camel = s => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
// 'color/content/secondary' -> 'colors.content.secondary'
function toCode(name) {
  const parts = name.split('/');
  const head = { color: 'colors', space: 'spacing', radius: 'radius', size: 'size', font: 'typography' }[parts[0]] || parts[0];
  return [head, ...parts.slice(1).map(camel)].join('.');
}

function parseHex(h) {
  const m = h.replace('#', '');
  const n = m.length === 6 ? m + 'FF' : m;
  const v = i => parseInt(n.slice(i, i + 2), 16) / 255;
  return { r: v(0), g: v(2), b: v(4), a: v(6) };
}

function scopesFor(name, type) {
  if (type === 'COLOR') {
    if (/\/shadow\//.test(name)) return ['EFFECT_COLOR'];
    if (/\/border\//.test(name)) return ['STROKE_COLOR'];
    if (/\/content\/|\/on-/.test(name)) return ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
    return ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  }
  if (type === 'FLOAT') {
    if (name.startsWith('space/')) return ['GAP'];
    if (name.startsWith('radius/')) return ['CORNER_RADIUS'];
    if (name.startsWith('size/')) return ['WIDTH_HEIGHT'];
    if (name.startsWith('border-width/')) return ['STROKE_FLOAT'];
    if (name.startsWith('opacity/')) return ['OPACITY'];
    if (name.startsWith('font/size/')) return ['FONT_SIZE'];
    if (name.startsWith('font/weight/')) return ['FONT_WEIGHT'];
    if (name.startsWith('font/line-height/')) return ['LINE_HEIGHT'];
    if (name.startsWith('font/letter-spacing/')) return ['LETTER_SPACING'];
    return ['ALL_SCOPES'];
  }
  if (type === 'STRING') {
    if (name.startsWith('font/family/')) return ['FONT_FAMILY'];
    if (name.startsWith('font/style/')) return ['FONT_STYLE'];
    return ['ALL_SCOPES'];
  }
  return ['ALL_SCOPES'];
}

const report = { created: [], updated: [], errors: [], contrastFails: [] };
const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
let allVars = await figma.variables.getLocalVariablesAsync();
const varByName = name => allVars.find(v => v.name === name);

function getCollection(name, modes) {
  let c = allCollections.find(x => x.name === name);
  if (!c) {
    c = figma.variables.createVariableCollection(name);
    allCollections.push(c);
    report.created.push('collection ' + name);
  }
  const wanted = modes && modes.length ? modes : [c.modes[0].name];
  // mode đầu tiên của collection mới tên "Mode 1": đổi tên thay vì thêm
  if (c.modes.length === 1 && !wanted.includes(c.modes[0].name)) c.renameMode(c.modes[0].modeId, wanted[0]);
  for (const m of wanted) if (!c.modes.find(x => x.name === m)) { c.addMode(m); report.created.push(`mode ${name}/${m}`); }
  const modeId = {};
  for (const m of c.modes) modeId[m.name] = m.modeId;
  return { c, modeId };
}

function getVar(name, c, type) {
  let v = allVars.find(x => x.name === name && x.variableCollectionId === c.id);
  if (!v) {
    v = figma.variables.createVariable(name, c, type);
    allVars.push(v);
    report.created.push(name);
  } else {
    if (v.resolvedType !== type) { report.errors.push(`${name}: đã có với kiểu ${v.resolvedType}, cần ${type}`); return null; }
    report.updated.push(name);
  }
  return v;
}

function applyMeta(v, { hidden } = {}) {
  v.scopes = hidden ? [] : scopesFor(v.name, v.resolvedType);
  v.hiddenFromPublishing = !!hidden;
  if (!hidden) for (const [platform, fn] of Object.entries(CONFIG.codeSyntax || {})) v.setVariableCodeSyntax(platform, fn(v.name));
}

function toValue(raw, type) {
  if (type === 'COLOR') {
    if (typeof raw === 'string' && raw.startsWith('#')) return parseHex(raw);
    const target = varByName(raw);
    if (!target) throw new Error(`không tìm thấy variable "${raw}" để alias`);
    return figma.variables.createVariableAlias(target);
  }
  if (typeof raw === 'string' && type !== 'STRING') {
    const target = varByName(raw);
    if (!target) throw new Error(`không tìm thấy variable "${raw}" để alias`);
    return figma.variables.createVariableAlias(target);
  }
  return raw;
}

const typeOf = raw => (typeof raw === 'number' ? 'FLOAT' : 'STRING');

function runLayer(key, { hidden = false, forceType } = {}) {
  const layer = CONFIG[key];
  const { c, modeId } = getCollection(layer.collection, layer.modes);
  const modeNames = Object.keys(modeId);
  for (const [name, val] of Object.entries(layer.values)) {
    try {
      const perMode = val !== null && typeof val === 'object' && !Array.isArray(val) ? val : Object.fromEntries(modeNames.map(m => [m, val]));
      const sample = Object.values(perMode)[0];
      const type = forceType || (typeof sample === 'string' && (sample.startsWith('#') || varByName(sample)?.resolvedType === 'COLOR') ? 'COLOR' : typeOf(sample));
      const v = getVar(name, c, type);
      if (!v) continue;
      for (const [m, raw] of Object.entries(perMode)) {
        if (!(m in modeId)) { report.errors.push(`${name}: mode "${m}" không có trong ${layer.collection}`); continue; }
        v.setValueForMode(modeId[m], toValue(raw, type));
      }
      applyMeta(v, { hidden });
    } catch (e) {
      report.errors.push(`${name}: ${e.message}`);
    }
  }
}

if (CONFIG.run.includes('primitives')) runLayer('primitives', { hidden: true, forceType: 'COLOR' });
if (CONFIG.run.includes('semantic')) runLayer('semantic', { forceType: 'COLOR' });
if (CONFIG.run.includes('typography')) runLayer('typography');
if (CONFIG.run.includes('dimension')) runLayer('dimension', { forceType: 'FLOAT' });

// ---------- kiểm tương phản cặp X / on-X và content/* trên surface/base ----------
async function resolveColor(v, modeId) {
  let cur = v, mode = modeId;
  for (let i = 0; i < 10; i++) {
    let val = cur.valuesByMode[mode];
    if (val === undefined) {
      const col = await figma.variables.getVariableCollectionByIdAsync(cur.variableCollectionId);
      mode = col.defaultModeId;
      val = cur.valuesByMode[mode];
    }
    if (val && val.type === 'VARIABLE_ALIAS') {
      const next = await figma.variables.getVariableByIdAsync(val.id);
      const col = await figma.variables.getVariableCollectionByIdAsync(next.variableCollectionId);
      if (!col.modes.find(m => m.modeId === mode)) mode = col.defaultModeId;
      cur = next;
      continue;
    }
    return val;
  }
  return null;
}
const lum = ({ r, g, b }) => [r, g, b].map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)).reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };

if (CONFIG.run.includes('semantic')) {
  const sem = allCollections.find(x => x.name === CONFIG.semantic.collection);
  const semVars = allVars.filter(v => v.variableCollectionId === sem.id && v.resolvedType === 'COLOR');
  const pairs = [];
  for (const v of semVars) {
    const m = v.name.match(/^(.*)\/on-(.*)$/);
    if (m) { const bg = semVars.find(x => x.name === `${m[1]}/${m[2]}`); if (bg) pairs.push([v, bg, 4.5]); }
  }
  const base = semVars.find(x => x.name === 'color/surface/base');
  if (base) for (const v of semVars.filter(x => /^color\/content\/(primary|secondary|brand)$/.test(x.name))) pairs.push([v, base, 4.5]);
  for (const v of semVars.filter(x => /^color\/content\/tertiary$/.test(x.name))) if (base) pairs.push([v, base, 3]);
  for (const [fg, bg, min] of pairs) {
    for (const mode of sem.modes) {
      const a = await resolveColor(fg, mode.modeId), b = await resolveColor(bg, mode.modeId);
      if (!a || !b || (a.a !== undefined && a.a < 1) || (b.a !== undefined && b.a < 1)) continue;
      const r = ratio(a, b);
      if (r < min) report.contrastFails.push(`${mode.name}: ${fg.name} trên ${bg.name} = ${r.toFixed(2)} (cần ${min})`);
    }
  }
}

return {
  created: report.created.length, updated: report.updated.length,
  createdNames: report.created.slice(0, 60),
  errors: report.errors, contrastFails: report.contrastFails,
};
