# Figma Design System skills

Bộ skill cho Claude Code để dựng **design system chuẩn hoá trên Figma**: variables, text styles, effect styles, component, trang tài liệu và bàn giao cho dev. Dùng được cho cả hai trường hợp:

- **File mới tinh**: chưa có gì, dựng design system từ đầu.
- **File cũ chưa chuẩn hoá**: màu hex rời, text không có style, spacing lộn xộn, component chồng chéo. Skill kiểm kê trước, đề xuất bộ token gom từ chính file đó, rồi mới gắn lại từng màn.

Skill không gắn với app hay brand nào. Màu, font, tên token cụ thể đều do designer chốt trong quá trình làm.

## Cài

Xem **[SETUP.md](SETUP.md)**: cài Claude Code, kết nối Figma MCP, cài skill, chạy thử.

Nhanh nhất:

```bash
git clone https://github.com/ecomobilekientd/figma-design-system-skill.git && mkdir -p ~/.claude/skills && cp -r figma-design-system-skill/skills/* ~/.claude/skills/
```

Mở phiên Claude Code mới, dán link file Figma và nói "chuẩn hoá design system cho file này" hoặc gọi tay `/figma-ds`.

## Có gì trong đây

```
skills/
  figma-ds/            điểm vào: hỏi đầu vào, chọn lộ trình, 8 luật vàng, cổng duyệt từng bước
    references/spec-template.md   khung file spec để designer chốt
    references/naming.md          quy ước đặt tên variable, style, component, page
    references/api-gotchas.md     các lỗi Plugin API hay gặp và cách tránh
  figma-ds-audit/      kiểm kê file cũ (chỉ đọc): màu, chữ, spacing, radius, effect, component
    scripts/inventory.js          chạy qua use_figma, trả bảng tổng hợp
    references/clustering.md      cách gom giá trị rời thành token
    references/report-template.md mẫu báo cáo kiểm kê
  figma-ds-build/      dựng nền tảng (variables, styles) và component theo spec đã chốt
    references/foundations.md     bộ token mặc định: dải màu, nhóm semantic, thang chữ, spacing, radius
    references/components.md      luật dựng component: auto layout, variant, property, state
    references/pages.md           cấu trúc page và board tài liệu
    scripts/create-variables.js   tạo collection, mode, variable từ một CONFIG
    scripts/create-styles.js      tạo text style, effect style gắn variable
  figma-ds-migrate/    gắn màn hình có sẵn vào token, thay bản rời bằng instance
    scripts/bind-colors.js        gắn fill/stroke hex vào variable gần nhất (có ngưỡng)
    scripts/apply-text-styles.js  gắn text style theo cỡ/đậm đang có
    references/regression.md      chụp baseline, so sau khi sửa, bảng kích thước chốt
  figma-ds-qa/         soát lỗi và bàn giao
    scripts/lint.js               tìm màu chưa gắn biến, text thiếu style, số lệch lưới 4…
    scripts/export-tokens.js      xuất variables ra JSON (định dạng W3C Design Tokens)
    references/handoff.md         ghi chú dev trên canvas, Update log, changelog, licence
```

## Quy trình tóm tắt

| Bước | File mới | File cũ | Skill |
|---|---|---|---|
| 0. Đầu vào | ✓ | ✓ | `figma-ds` |
| 1. Kiểm kê | — | ✓ | `figma-ds-audit` |
| 2. Chốt spec | ✓ | ✓ | `figma-ds` |
| 3. Nền tảng (variables, styles) | ✓ | ✓ | `figma-ds-build` |
| 4. Component | ✓ | ✓ | `figma-ds-build` |
| 5. Gắn màn có sẵn | — | ✓ | `figma-ds-migrate` |
| 6. Soát lỗi | ✓ | ✓ | `figma-ds-qa` |
| 7. Tài liệu + bàn giao | ✓ | ✓ | `figma-ds-qa` |

Mỗi bước có cổng duyệt: Claude viết ra sẽ làm gì, designer đồng ý thì mới ghi lên Figma.

## Cần có

- Claude Code (desktop app hoặc CLI), gói Pro/Max/Team/Enterprise.
- Figma MCP chính thức đã kết nối, quyền **edit** file và seat Figma Full hoặc Dev.
- Khuyên dùng: plugin Figma chính thức cho Claude Code (có skill `figma-use` bắt buộc trước mọi lệnh ghi).

## Đóng góp

- Sửa luật hoặc thêm gotcha: PR vào `skills/`. Ghi lý do và ví dụ lỗi thật trong mô tả PR.
- Script: chạy thử trên một file nháp trước khi PR, ghi kết quả vào mô tả.
