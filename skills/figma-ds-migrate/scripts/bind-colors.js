// Gắn fill / stroke màu đặc (hex rời) vào variable Semantic gần nhất theo vai trò.
// Chạy qua use_figma. Luôn chạy dryRun: true trước, gửi designer kết quả, rồi mới chạy thật.

const CONFIG = {
  dryRun: true,
  rootIds: [],                 // id section / frame cần xử lý (bắt buộc, không chạy cả file)
  collection: 'Semantic',
  mode: 'Light',               // mode dùng để so màu (mode của các frame trong phạm vi)
  maxDeltaE: 2,                // > ngưỡng này: không gắn, đưa vào danh sách màu lẻ
  skipNamePattern: /logo|illustration|illus|image|photo|avatar|flag/i,
  skipInsideInstances: true,   // node trong instance sửa ở master
  // Vai trò → tiền tố token ưu tiên. Không có token khớp trong nhóm ưu tiên thì tìm toàn bộ.
  rolePrefixes: {
    text: ['color/content/', 'color/action/on-', 'color/feedback/'],
    stroke: ['color/border/', 'color/feedback/'],
    fill: ['color/surface/', 'color/action/', 'color/interaction/', 'color/feedback/', 'color/overlay/'],
    icon: ['color/content/', 'color/action/on-', 'color/feedback/'],
  },
  // Ép ánh xạ cụ thể (từ ds/audit.md): '#62646A': 'color/content/secondary'
  overrides: {},
};

if (!CONFIG.rootIds.length) return { error: 'Cần CONFIG.rootIds' };

// ---------- màu ----------
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
function lab({ r, g, b }) {
  const lin = x => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const f = t => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const X = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
  const Y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
  const Z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
const dE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));

const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === CONFIG.collection);
if (!col) return { error: `Không có collection ${CONFIG.collection}` };
const modeId = col.modes.find(m => m.name === CONFIG.mode)?.modeId || col.defaultModeId;

async function resolve(v, mid) {
  let cur = v, mode = mid;
  for (let i = 0; i < 10; i++) {
    let val = cur.valuesByMode[mode];
    if (val === undefined) { mode = (await figma.variables.getVariableCollectionByIdAsync(cur.variableCollectionId)).defaultModeId; val = cur.valuesByMode[mode]; }
    if (val && val.type === 'VARIABLE_ALIAS') { cur = await figma.variables.getVariableByIdAsync(val.id); continue; }
    return val;
  }
}
const tokens = [];
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.resolvedType !== 'COLOR') continue;
  const c = await resolve(v, modeId);
  if (c) tokens.push({ v, c });
}

function pick(color, opacity, role) {
  const forced = CONFIG.overrides[hex(color)];
  if (forced) { const t = tokens.find(t => t.v.name === forced); if (t) return { t, d: 0 }; }
  const alphaOk = t => Math.abs((t.c.a ?? 1) - opacity) < 0.02;
  const search = list => list.filter(alphaOk).map(t => ({ t, d: dE(color, t.c) })).sort((a, b) => a.d - b.d)[0];
  const prefs = CONFIG.rolePrefixes[role] || [];
  const inRole = search(tokens.filter(t => prefs.some(p => t.v.name.startsWith(p))));
  if (inRole && inRole.d <= CONFIG.maxDeltaE) return inRole;
  return search(tokens);
}

// ---------- duyệt node ----------
const insideInstance = n => { for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
const isIcon = n => /^icon\b|\/icon|ic_/i.test(n.name) || (n.type === 'VECTOR' && n.parent && /icon/i.test(n.parent.name));

const stats = { bound: 0, skippedFar: 0, alreadyBound: 0 };
const far = new Map();   // hex -> {count, nearest, dE, role}
const plan = new Map();  // hex -> token -> count

function processPaints(node, key, role) {
  const paints = node[key];
  if (!Array.isArray(paints) || !paints.length) return;
  const bound = (node.boundVariables || {})[key] || [];
  const styleId = key === 'fills' ? node.fillStyleId : node.strokeStyleId;
  if (styleId && styleId !== figma.mixed && styleId !== '') { stats.alreadyBound += paints.length; return; }
  let changed = false;
  const next = paints.map((p, i) => {
    if (p.type !== 'SOLID' || p.visible === false) return p;
    if (bound[i]) { stats.alreadyBound++; return p; }
    const opacity = p.opacity ?? 1;
    const m = pick(p.color, opacity, role);
    const h = hex(p.color) + (opacity < 1 ? '@' + opacity.toFixed(2) : '');
    if (!m || m.d > CONFIG.maxDeltaE) {
      stats.skippedFar++;
      const e = far.get(h) || { count: 0, nearest: m?.t.v.name, dE: m ? +m.d.toFixed(1) : null, role };
      e.count++; far.set(h, e);
      return p;
    }
    const e = plan.get(h) || {}; e[m.t.v.name] = (e[m.t.v.name] || 0) + 1; plan.set(h, e);
    stats.bound++;
    if (CONFIG.dryRun) return p;
    changed = true;
    // token đã mang alpha → paint opacity về 1; không thì giữ opacity cũ
    const np = figma.variables.setBoundVariableForPaint({ ...p, opacity: 1 }, 'color', m.t.v);
    return (m.t.c.a ?? 1) < 1 ? np : { ...np, opacity };
  });
  if (changed) node[key] = next;
}

for (const id of CONFIG.rootIds) {
  const root = await figma.getNodeByIdAsync(id);
  if (!root) continue;
  const nodes = [root, ...('findAll' in root ? root.findAll(() => true) : [])];
  for (const n of nodes) {
    if (CONFIG.skipNamePattern.test(n.name)) continue;
    if (CONFIG.skipInsideInstances && insideInstance(n)) continue;
    if (n.type === 'TEXT') {
      if (n.fills !== figma.mixed) processPaints(n, 'fills', 'text');
    } else if ('fills' in n && n.fills !== figma.mixed) {
      processPaints(n, 'fills', isIcon(n) ? 'icon' : 'fill');
    }
    if ('strokes' in n) processPaints(n, 'strokes', isIcon(n) ? 'icon' : 'stroke');
  }
}

return {
  dryRun: CONFIG.dryRun, mode: CONFIG.mode, stats,
  plan: [...plan.entries()].slice(0, 60).map(([h, t]) => ({ hex: h, tokens: t })),
  farColors: [...far.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 40).map(([h, e]) => ({ hex: h, ...e })),
  note: 'Text có nhiều màu trong một node (fills mixed) chưa xử lý: sửa tay hoặc tách đoạn.',
};
