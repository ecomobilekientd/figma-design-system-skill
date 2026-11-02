---
name: figma-ds-qa
description: Soát lỗi design system trên Figma và bàn giao cho dev: tìm màu chưa gắn variable, text thiếu text style, spacing / radius lệch lưới 4, cỡ chữ lẻ, line height Auto, auto layout sai (FILL trong HUG, layoutAlign CENTER cũ), annotation dev không thấy, variable Semantic trỏ thẳng hex hoặc alias hỏng; xuất tokens.json; ghi chú Dev trên canvas, Update log, changelog, licence. Dùng ở bước 6–7 của skill figma-ds, hoặc khi designer nói "soát design system", "lint file Figma", "check token", "xuất tokens cho dev", "bàn giao design system", "file này còn bao nhiêu chỗ chưa gắn biến".
---

# Soát lỗi và bàn giao

Soát chỉ báo, không tự sửa. Sửa là một bước riêng có phạm vi và được designer đồng ý (dùng `figma-ds-migrate` hoặc `figma-ds-build`).

## Soát (bước 6)

1. Chạy `scripts/lint.js` qua `use_figma` với phạm vi: `rootIds` (component, section) hoặc `pages`. File lớn: từng page.
2. Đọc kết quả theo mức:

| Mức | Lỗi | Vì sao |
|---|---|---|
| P0 | variable Semantic trỏ thẳng hex, alias hỏng | đổi theme / brand sẽ không ăn |
| P0 | màu UI chưa gắn variable (ngoài danh sách ngoại lệ) | dev phải đoán token |
| P0 | text thiếu text style | dev phải đoán style, lệch line height |
| P1 | spacing / radius / size lệch lưới 4, cỡ chữ lẻ | lệch với thang code |
| P1 | line height Auto trong text style | số không đọc được, đổi theo font |
| P1 | FILL trong HUG, `layoutAlign = CENTER` | layout không như thấy; căn giữa bị bỏ qua |
| P1 | annotation Dev Mode | dev không có seat Dev Mode không thấy |
| P2 | frame tên giống component (nghi detach) | không cập nhật theo master |
| P2 | vector có stroke đen 1 px mặc định | thường là lỗi khi import SVG |
| P2 | tên variable sai quy ước, Primitive chưa ẩn | picker lộn xộn, code khó map |

3. Viết kết quả vào `ds/changelog.md` (số theo từng mức, top node lỗi kèm id). Gửi designer: số liệu, 1 ảnh chụp chỗ lỗi tiêu biểu, đề xuất đợt sửa.

## Bàn giao (bước 7)

Đọc `references/handoff.md`. Tóm tắt:

1. **Xuất token**: `scripts/export-tokens.js` → lưu kết quả thành `ds/tokens.json` (định dạng W3C Design Tokens, có alias và từng mode). Dev dùng file này (hoặc Style Dictionary) để sinh theme code. Mỗi lần đổi token: xuất lại, tăng version trong tên file, ghi changelog.
2. **Board tài liệu** đầy đủ (Foundations + Components) theo `figma-ds-build/references/pages.md`.
3. **Ghi chú dev trên canvas**, không dùng annotation.
4. **Update log** cạnh section mỗi khi đổi gì sau lần bàn giao đầu.
5. **Licence**: page `License` liệt kê font, icon, ảnh, thư viện và licence.
6. Nhắc designer lưu version history có tên: "DS v<x> bàn giao <ngày>".
