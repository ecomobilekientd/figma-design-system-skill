// Kiểm kê design system của file Figma. CHỈ ĐỌC.
// Chạy qua tool use_figma (đọc skill figma-use trước). Sửa CONFIG rồi dán toàn bộ.
// Trả JSON gọn: đã gom và chỉ giữ top N mỗi nhóm.

const CONFIG = {
  pages: [],            // tên page cần kiểm kê; [] = mọi page
  topN: 40,             // số dòng tối đa mỗi bảng
  ignoreNamePattern: /logo|illustration|illus|image|photo|avatar|flag/i, // bỏ layer có tên khớp
  countInsideInstances: false, // false = chỉ đếm node rời (instance được sửa ở master)
};

await figma.loadAllPagesAsync();
const pages = figma.root.children.filter(p => CONFIG.pages.length === 0 || CONFIG.pages.includes(p.name));

const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const bump = (map, key, extra) => {
  const e = map.get(key) || { count: 0, ...extra };
  e.count++;
  map.set(key, e);
};
const top = map => [...map.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, CONFIG.topN).map(([k, v]) => ({ value: k, ...v }));

const colors = new Map();       // hex@alpha -> {count, bound, roles}
const textCombos = new Map();   // family|style|size|lh -> {count, styled}
const spacing = new Map();      // number -> {count}
const radius = new Map();
const effects = new Map();
const detachedLike = new Map(); // frame name equal to a component name
const stats = { nodes: 0, fills: 0, fillsBound: 0, texts: 0, textsStyled: 0, spacingValues: 0, spacingOnGrid: 0, instances: 0, components: 0 };

const componentNames = new Set();
for (const p of pages) p.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] }).forEach(c => componentNames.add(c.name));
stats.components = componentNames.size;

function insideInstance(n) {
  for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true;
  return false;
}

function addPaints(node, paints, role, boundList) {
  if (!Array.isArray(paints)) return;
  paints.forEach((paint, i) => {
    if (paint.type !== 'SOLID' || paint.visible === false) return;
    stats.fills++;
    const isBound = !!(boundList && boundList[i]);
    if (isBound) stats.fillsBound++;
    const key = hex(paint.color) + (paint.opacity !== undefined && paint.opacity < 1 ? '@' + paint.opacity.toFixed(2) : '');
    const e = colors.get(key) || { count: 0, bound: 0, roles: {} };
    e.count++;
    if (isBound) e.bound++;
    e.roles[role] = (e.roles[role] || 0) + 1;
    colors.set(key, e);
  });
}

for (const page of pages) {
  const nodes = page.findAll(n => {
    if (CONFIG.ignoreNamePattern && CONFIG.ignoreNamePattern.test(n.name)) return false;
    if (!CONFIG.countInsideInstances && insideInstance(n)) return false;
    return true;
  });
  for (const n of nodes) {
    stats.nodes++;
    if (n.type === 'INSTANCE') stats.instances++;
    if (n.type === 'FRAME' && componentNames.has(n.name)) bump(detachedLike, n.name, {});

    const bv = n.boundVariables || {};
    const fillsBound = n.fillStyleId && n.fillStyleId !== '' ? (n.fills || []).map(() => true) : bv.fills;
    const strokesBound = n.strokeStyleId && n.strokeStyleId !== '' ? (n.strokes || []).map(() => true) : bv.strokes;
    if (n.type !== 'TEXT') addPaints(n, n.fills, n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE' ? 'frame' : 'shape', fillsBound);
    addPaints(n, n.strokes, 'stroke', strokesBound);

    if (n.type === 'TEXT') {
      stats.texts++;
      const segs = n.getStyledTextSegments(['fontName', 'fontSize', 'lineHeight', 'textStyleId', 'fills', 'boundVariables']);
      let allStyled = true;
      for (const s of segs) {
        const lh = s.lineHeight.unit === 'AUTO' ? 'auto' : s.lineHeight.unit === 'PERCENT' ? s.lineHeight.value.toFixed(0) + '%' : s.lineHeight.value;
        const key = `${s.fontName.family} | ${s.fontName.style} | ${s.fontSize} | ${lh}`;
        const e = textCombos.get(key) || { count: 0, styled: 0 };
        e.count++;
        if (s.textStyleId) e.styled++; else allStyled = false;
        textCombos.set(key, e);
        addPaints(n, s.fills, 'text', s.boundVariables && s.boundVariables.fills);
      }
      if (allStyled) stats.textsStyled++;
    }

    if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') {
      const vals = [n.itemSpacing, n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft];
      if (n.layoutWrap === 'WRAP' && typeof n.counterAxisSpacing === 'number') vals.push(n.counterAxisSpacing);
      for (const v of vals) {
        if (typeof v !== 'number' || v === 0) continue;
        stats.spacingValues++;
        if (v % 4 === 0) stats.spacingOnGrid++;
        bump(spacing, v, {});
      }
    }
    if ('cornerRadius' in n) {
      const r = n.cornerRadius;
      if (typeof r === 'number' && r > 0) bump(radius, r, {});
      else if (r === figma.mixed) [n.topLeftRadius, n.topRightRadius, n.bottomLeftRadius, n.bottomRightRadius].filter(x => x > 0).forEach(x => bump(radius, x, {}));
    }
    if ('effects' in n && n.effects.length) {
      for (const ef of n.effects) {
        if (ef.visible === false) continue;
        const key = ef.type.startsWith('DROP') || ef.type.startsWith('INNER')
          ? `${ef.type} x${ef.offset.x} y${ef.offset.y} b${ef.radius} s${ef.spread || 0} ${hex(ef.color)}@${ef.color.a.toFixed(2)}`
          : `${ef.type} ${ef.radius}`;
        bump(effects, key, { styled: !!n.effectStyleId });
      }
    }
  }
}

// Variables và styles đang có
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const existing = {
  collections: collections.map(c => ({ name: c.name, modes: c.modes.map(m => m.name), variables: c.variableIds.length })),
  variablesByType: vars.reduce((a, v) => (a[v.resolvedType] = (a[v.resolvedType] || 0) + 1, a), {}),
  textStyles: (await figma.getLocalTextStylesAsync()).length,
  paintStyles: (await figma.getLocalPaintStylesAsync()).length,
  effectStyles: (await figma.getLocalEffectStylesAsync()).length,
};

const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
return {
  scope: pages.map(p => p.name),
  summary: {
    ...stats,
    fillsBoundPct: pct(stats.fillsBound, stats.fills),
    textsStyledPct: pct(stats.textsStyled, stats.texts),
    spacingOnGridPct: pct(stats.spacingOnGrid, stats.spacingValues),
    distinctColors: colors.size,
    distinctTextCombos: textCombos.size,
  },
  existing,
  colors: top(colors),
  textCombos: top(textCombos),
  spacing: top(spacing),
  radius: top(radius),
  effects: top(effects),
  framesNamedLikeComponents: top(detachedLike),
};
