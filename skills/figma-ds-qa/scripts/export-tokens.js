// Xuất variables, text styles, effect styles ra JSON theo định dạng W3C Design Tokens (DTCG).
// CHỈ ĐỌC. Chạy qua use_figma, lưu kết quả trả về thành ds/tokens.json.
// Cấu trúc: { "<Collection>": { "<Mode>": { nhóm lồng theo "/" ... { "$type", "$value" } } } }
// Alias xuất dạng "{Collection.path.to.token}" để Style Dictionary / Tokens Studio đọc được.

const CONFIG = {
  collections: [],          // [] = mọi collection local
  includeStyles: true,
  includeCodeSyntax: true,
};

const hex = c => '#' + [c.r, c.g, c.b, c.a ?? 1].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase().replace(/FF$/, '');
const setPath = (obj, path, val) => {
  const parts = path.split('/');
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] = cur[p] || {};
  cur[parts.at(-1)] = val;
};
const typeMap = { COLOR: 'color', FLOAT: 'number', STRING: 'string', BOOLEAN: 'boolean' };
const dtcgType = v => {
  if (v.resolvedType !== 'FLOAT') return typeMap[v.resolvedType];
  if (/^(space|size|radius|border-width)\//.test(v.name) || /font\/size|line-height|letter-spacing/.test(v.name)) return 'dimension';
  if (/font\/weight/.test(v.name)) return 'fontWeight';
  return 'number';
};

const cols = (await figma.variables.getLocalVariableCollectionsAsync()).filter(c => !CONFIG.collections.length || CONFIG.collections.includes(c.name));
const allCols = await figma.variables.getLocalVariableCollectionsAsync();
const out = { $metadata: { source: figma.root.name, exportedAt: new Date().toISOString(), format: 'DTCG' } };

for (const c of cols) {
  out[c.name] = {};
  for (const m of c.modes) {
    const tree = {};
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      const raw = v.valuesByMode[m.modeId];
      let value;
      if (raw && raw.type === 'VARIABLE_ALIAS') {
        const t = await figma.variables.getVariableByIdAsync(raw.id);
        const tc = allCols.find(x => x.id === t?.variableCollectionId);
        value = t ? `{${tc.name}.${t.name.split('/').join('.')}}` : null;
      } else if (v.resolvedType === 'COLOR') value = hex(raw);
      else if (dtcgType(v) === 'dimension') value = `${raw}px`;
      else value = raw;
      const token = { $type: dtcgType(v), $value: value };
      if (v.description) token.$description = v.description;
      if (CONFIG.includeCodeSyntax && v.codeSyntax && Object.keys(v.codeSyntax).length) token.$extensions = { 'com.figma.codeSyntax': v.codeSyntax };
      setPath(tree, v.name, token);
    }
    out[c.name][m.name] = tree;
  }
}

if (CONFIG.includeStyles) {
  const typography = {};
  for (const s of await figma.getLocalTextStylesAsync()) {
    setPath(typography, s.name, {
      $type: 'typography',
      $value: {
        fontFamily: s.fontName.family,
        fontWeight: s.fontName.style,
        fontSize: `${s.fontSize}px`,
        lineHeight: s.lineHeight.unit === 'PIXELS' ? `${s.lineHeight.value}px` : s.lineHeight.unit === 'PERCENT' ? `${s.lineHeight.value}%` : 'auto',
        letterSpacing: s.letterSpacing.unit === 'PIXELS' ? `${s.letterSpacing.value}px` : `${s.letterSpacing.value}%`,
      },
    });
  }
  const shadows = {};
  for (const s of await figma.getLocalEffectStylesAsync()) {
    const list = s.effects.filter(e => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW').map(e => ({
      color: hex(e.color), offsetX: `${e.offset.x}px`, offsetY: `${e.offset.y}px`, blur: `${e.radius}px`, spread: `${e.spread || 0}px`, inset: e.type === 'INNER_SHADOW',
    }));
    if (list.length) setPath(shadows, s.name, { $type: 'shadow', $value: list.length === 1 ? list[0] : list });
  }
  out.styles = { typography, effects: shadows };
}

return out;
