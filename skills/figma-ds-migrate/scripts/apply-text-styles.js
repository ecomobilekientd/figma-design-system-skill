// Gắn text style cho text chưa có style, theo family + weight + size đang có.
// Chạy qua use_figma. Chạy dryRun: true trước để xem bao nhiêu text khớp / không khớp.

const CONFIG = {
  dryRun: true,
  rootIds: [],                 // id section / frame cần xử lý (bắt buộc)
  stylePrefix: 'type/',        // chỉ dùng style có tên bắt đầu bằng tiền tố này
  matchFamily: true,           // false = chỉ so weight + size (khi đổi font cả hệ)
  skipInsideInstances: true,
  // Ép ánh xạ: 'Roboto|Medium|15': 'type/label/m'  (lấy từ ds/audit.md)
  overrides: {},
};

if (!CONFIG.rootIds.length) return { error: 'Cần CONFIG.rootIds' };

const styles = (await figma.getLocalTextStylesAsync()).filter(s => s.name.startsWith(CONFIG.stylePrefix));
const keyOf = (family, style, size) => (CONFIG.matchFamily ? family + '|' : '') + style + '|' + size;
const index = new Map(styles.map(s => [keyOf(s.fontName.family, s.fontName.style, s.fontSize), s]));
const byName = new Map(styles.map(s => [s.name, s]));

const insideInstance = n => { for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };

const stats = { texts: 0, alreadyStyled: 0, applied: 0, mixed: 0, unmatched: 0, heightChanged: 0 };
const unmatched = new Map();
const appliedBy = new Map();

for (const id of CONFIG.rootIds) {
  const root = await figma.getNodeByIdAsync(id);
  if (!root) continue;
  const texts = root.type === 'TEXT' ? [root] : root.findAllWithCriteria({ types: ['TEXT'] });
  for (const t of texts) {
    if (CONFIG.skipInsideInstances && insideInstance(t)) continue;
    stats.texts++;
    if (t.textStyleId && t.textStyleId !== figma.mixed) { stats.alreadyStyled++; continue; }
    if (t.fontName === figma.mixed || t.fontSize === figma.mixed) { stats.mixed++; continue; }
    const raw = `${t.fontName.family}|${t.fontName.style}|${t.fontSize}`;
    const s = byName.get(CONFIG.overrides[raw]) || index.get(keyOf(t.fontName.family, t.fontName.style, t.fontSize));
    if (!s) {
      stats.unmatched++;
      unmatched.set(raw, (unmatched.get(raw) || 0) + 1);
      continue;
    }
    stats.applied++;
    appliedBy.set(s.name, (appliedBy.get(s.name) || 0) + 1);
    if (CONFIG.dryRun) continue;
    const before = t.height;
    await figma.loadFontAsync(t.fontName);
    await figma.loadFontAsync(s.fontName);
    await t.setTextStyleIdAsync(s.id);
    if (Math.abs(t.height - before) >= 1) stats.heightChanged++;
  }
}

return {
  dryRun: CONFIG.dryRun, stats,
  appliedBy: Object.fromEntries(appliedBy),
  unmatched: [...unmatched.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => ({ combo: k, count: n })),
  note: 'unmatched: thêm style mới hoặc thêm overrides; mixed: text nhiều kiểu chữ, sửa tay. heightChanged > 0: chụp lại và so baseline.',
};
