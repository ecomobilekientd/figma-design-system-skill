// Soát design system. CHỈ ĐỌC. Chạy qua use_figma.
// Phạm vi: rootIds (ưu tiên) hoặc pages. Trả số lỗi theo loại + vài node mẫu (id, tên) mỗi loại.

const CONFIG = {
  rootIds: [],                 // id component / section / frame; [] = dùng pages
  pages: [],                   // tên page; [] và rootIds rỗng = page hiện tại
  checkVariables: true,        // soát collection / variable
  semanticCollections: ['Semantic'],
  primitiveCollections: ['Primitives'],
  skipNamePattern: /logo|illustration|illus|image|photo|avatar|flag/i,
  skipInsideInstances: true,
  allowedOffGrid: [1, 2, 999], // giá trị được phép không chia hết cho 4 (stroke, khe nhỏ, pill)
  samples: 8,
};

const issues = {};
const add = (type, node, detail) => {
  const e = issues[type] || (issues[type] = { count: 0, samples: [] });
  e.count++;
  if (e.samples.length < CONFIG.samples) e.samples.push({ id: node?.id, name: node?.name, ...(detail !== undefined ? { detail } : {}) });
};
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const onGrid = v => typeof v !== 'number' || v === 0 || v % 4 === 0 || CONFIG.allowedOffGrid.includes(v);
const insideInstance = n => { for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };

// ---------- phạm vi ----------
let roots = [];
if (CONFIG.rootIds.length) {
  for (const id of CONFIG.rootIds) { const n = await figma.getNodeByIdAsync(id); if (n) roots.push(n); }
} else if (CONFIG.pages.length) {
  await figma.loadAllPagesAsync();
  roots = figma.root.children.filter(p => CONFIG.pages.includes(p.name));
} else roots = [figma.currentPage];

const componentNames = new Set();
for (const r of roots) if ('findAllWithCriteria' in r) r.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }).forEach(c => componentNames.add(c.name));

let scanned = 0;
for (const root of roots) {
  const nodes = root.type === 'PAGE' ? root.findAll(() => true) : [root, ...('findAll' in root ? root.findAll(() => true) : [])];
  for (const n of nodes) {
    if (CONFIG.skipNamePattern.test(n.name)) continue;
    if (CONFIG.skipInsideInstances && insideInstance(n)) continue;
    scanned++;
    const bv = n.boundVariables || {};

    // màu chưa gắn
    for (const key of ['fills', 'strokes']) {
      if (n.type === 'TEXT' && key === 'fills') continue;
      const paints = n[key];
      if (!Array.isArray(paints)) continue;
      const styled = key === 'fills' ? n.fillStyleId : n.strokeStyleId;
      if (styled && styled !== '') continue;
      paints.forEach((p, i) => {
        if (p.type === 'SOLID' && p.visible !== false && !(bv[key] || [])[i]) add(`P0 ${key} chưa gắn variable`, n, hex(p.color));
      });
    }

    // text
    if (n.type === 'TEXT') {
      for (const s of n.getStyledTextSegments(['textStyleId', 'fontSize', 'fills', 'boundVariables'])) {
        if (!s.textStyleId) add('P0 text thiếu text style', n, s.characters.slice(0, 24));
        if (s.fontSize % 2 !== 0) add('P1 cỡ chữ lẻ', n, s.fontSize);
        const fb = (s.boundVariables && s.boundVariables.fills) || [];
        s.fills.forEach((p, i) => { if (p.type === 'SOLID' && p.visible !== false && !fb[i] && !n.fillStyleId) add('P0 màu chữ chưa gắn variable', n, hex(p.color)); });
      }
    }

    // auto layout
    if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') {
      for (const [k, v] of [['gap', n.itemSpacing], ['pt', n.paddingTop], ['pr', n.paddingRight], ['pb', n.paddingBottom], ['pl', n.paddingLeft]]) {
        if (!onGrid(v)) add('P1 spacing lệch lưới 4', n, `${k} ${v}`);
      }
      const hugW = n.layoutSizingHorizontal === 'HUG', hugH = n.layoutSizingVertical === 'HUG';
      for (const c of n.children || []) {
        if ((hugW && c.layoutSizingHorizontal === 'FILL') || (hugH && c.layoutSizingVertical === 'FILL')) add('P1 con FILL trong cha HUG', c);
        if (c.layoutAlign === 'CENTER') add('P1 layoutAlign CENTER (bị bỏ qua)', c);
      }
    }
    if ('cornerRadius' in n && typeof n.cornerRadius === 'number' && !onGrid(n.cornerRadius) && n.cornerRadius < Math.min(n.width, n.height) / 2) {
      add('P1 radius lệch lưới 4', n, n.cornerRadius);
    }

    // khác
    if ('annotations' in n && n.annotations && n.annotations.length) add('P1 annotation Dev Mode (dev không seat không thấy)', n);
    if (n.type === 'FRAME' && componentNames.has(n.name)) add('P2 frame trùng tên component (nghi detach)', n);
    if (n.type === 'VECTOR' && Array.isArray(n.strokes) && n.strokes.length === 1 && n.strokes[0].type === 'SOLID'
      && hex(n.strokes[0].color) === '#000000' && n.strokeWeight === 1 && Array.isArray(n.fills) && n.fills.length) add('P2 vector có stroke đen 1px mặc định', n);
  }
}

// ---------- text styles ----------
for (const s of await figma.getLocalTextStylesAsync()) {
  if (s.lineHeight.unit === 'AUTO') add('P1 text style line height Auto', { id: s.id, name: s.name });
  else if (s.lineHeight.unit === 'PIXELS' && s.lineHeight.value % 4 !== 0) add('P1 text style line height lệch lưới 4', { id: s.id, name: s.name }, s.lineHeight.value);
  if (s.fontSize % 2 !== 0) add('P1 text style cỡ lẻ', { id: s.id, name: s.name }, s.fontSize);
}

// ---------- variables ----------
if (CONFIG.checkVariables) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  for (const c of cols) {
    const isSem = CONFIG.semanticCollections.includes(c.name);
    const isPrim = CONFIG.primitiveCollections.includes(c.name);
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      for (const m of c.modes) {
        const val = v.valuesByMode[m.modeId];
        if (val && val.type === 'VARIABLE_ALIAS') {
          if (!(await figma.variables.getVariableByIdAsync(val.id))) add('P0 alias hỏng', { id: v.id, name: v.name }, m.name);
        } else if (isSem && v.resolvedType === 'COLOR') add('P0 Semantic trỏ thẳng giá trị (không alias)', { id: v.id, name: v.name }, m.name);
      }
      if (isPrim && (!v.hiddenFromPublishing || v.scopes.length)) add('P2 Primitive chưa ẩn / còn scopes', { id: v.id, name: v.name });
      if (!isPrim && !/^[a-z0-9-]+(\/[a-z0-9-]+)+$/.test(v.name)) add('P2 tên variable sai quy ước', { id: v.id, name: v.name });
    }
  }
}

const order = Object.keys(issues).sort();
return {
  scope: roots.map(r => r.name), scanned,
  totals: Object.fromEntries(order.map(k => [k, issues[k].count])),
  details: Object.fromEntries(order.map(k => [k, issues[k].samples])),
};
