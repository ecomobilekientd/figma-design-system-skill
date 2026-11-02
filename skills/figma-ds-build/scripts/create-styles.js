// Tạo / cập nhật text style và effect style từ CONFIG. Idempotent theo tên.
// Chạy qua use_figma sau khi đã có collection Typography (create-variables.js).
// Line height luôn PIXELS (trên lưới 4), không dùng AUTO.

const CONFIG = {
  textStyles: [
    // { name: 'type/body/m', family: 'Inter', style: 'Regular', size: 14, lineHeight: 20, letterSpacing: 0,
    //   vars: { fontSize: 'font/size/14', fontFamily: 'font/family/ui' } },
  ],
  effectStyles: [
    // { name: 'elevation/low', shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: '#0000001F' }] },
    // colorVar (tuỳ chọn) gắn màu shadow vào variable: { ..., colorVar: 'color/shadow/default' }
  ],
};

const report = { created: [], updated: [], errors: [], offGrid: [] };
const vars = await figma.variables.getLocalVariablesAsync();
const varByName = n => vars.find(v => v.name === n);

function parseHex(h) {
  const m = h.replace('#', '');
  const n = m.length === 6 ? m + 'FF' : m;
  const v = i => parseInt(n.slice(i, i + 2), 16) / 255;
  return { r: v(0), g: v(2), b: v(4), a: v(6) };
}

// ---------- text styles ----------
const textStyles = await figma.getLocalTextStylesAsync();
for (const t of CONFIG.textStyles) {
  try {
    if (t.lineHeight % 4 !== 0) report.offGrid.push(`${t.name}: line height ${t.lineHeight} không chia hết cho 4`);
    if (t.size % 2 !== 0) report.offGrid.push(`${t.name}: cỡ chữ ${t.size} là số lẻ`);
    const fontName = { family: t.family, style: t.style };
    await figma.loadFontAsync(fontName);
    let s = textStyles.find(x => x.name === t.name);
    if (!s) { s = figma.createTextStyle(); s.name = t.name; report.created.push(t.name); } else report.updated.push(t.name);
    s.fontName = fontName;
    s.fontSize = t.size;
    s.lineHeight = { unit: 'PIXELS', value: t.lineHeight };
    s.letterSpacing = { unit: t.letterSpacingUnit || 'PIXELS', value: t.letterSpacing || 0 };
    if (t.description) s.description = t.description;
    for (const [field, varName] of Object.entries(t.vars || {})) {
      const v = varByName(varName);
      if (!v) { report.errors.push(`${t.name}: không có variable ${varName}`); continue; }
      s.setBoundVariable(field, v);
    }
  } catch (e) {
    report.errors.push(`${t.name}: ${e.message}`);
  }
}

// ---------- effect styles ----------
const effectStyles = await figma.getLocalEffectStylesAsync();
for (const e of CONFIG.effectStyles) {
  try {
    let s = effectStyles.find(x => x.name === e.name);
    if (!s) { s = figma.createEffectStyle(); s.name = e.name; report.created.push(e.name); } else report.updated.push(e.name);
    s.effects = e.shadows.map(sh => {
      let eff = {
        type: sh.inner ? 'INNER_SHADOW' : 'DROP_SHADOW',
        color: parseHex(sh.color),
        offset: { x: sh.x, y: sh.y },
        radius: sh.blur,
        spread: sh.spread || 0,
        visible: true,
        blendMode: 'NORMAL',
        showShadowBehindNode: false,
      };
      if (sh.colorVar) {
        const v = varByName(sh.colorVar);
        if (v) eff = figma.variables.setBoundVariableForEffect(eff, 'color', v);
        else report.errors.push(`${e.name}: không có variable ${sh.colorVar}`);
      }
      return eff;
    });
  } catch (err) {
    report.errors.push(`${e.name}: ${err.message}`);
  }
}

return report;
