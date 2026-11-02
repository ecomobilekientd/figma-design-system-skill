---
name: figma-ds-build
description: Dựng nền tảng và component của design system trên Figma theo spec đã chốt: collection Primitives / Semantic / Typography / Dimension, mode Light / Dark (hoặc brand), scopes và code syntax, text styles có line height cố định, effect styles, component set với variant / property / state gắn token, và các page tài liệu (Color, Typography, Spacing, Component). Dùng ở bước 3–4 của skill figma-ds, hoặc khi designer nói "tạo variables", "tạo text style", "dựng component Button", "setup Light/Dark", "làm page Foundations". Cần `ds/spec.md` đã chốt; chưa có thì quay lại skill figma-ds.
---

# Dựng nền tảng và component

Đầu vào bắt buộc: `ds/spec.md` có trạng thái ĐÃ CHỐT cho phần sắp dựng. Thiếu giá trị nào thì hỏi, không đoán.

Đọc trước: skill `figma-use` (bắt buộc trước `use_figma`), `figma-generate-library` nếu có, `figma-ds/references/naming.md`, `figma-ds/references/api-gotchas.md`. Đọc theo nhu cầu: `references/foundations.md` (bộ mặc định khi designer chưa có gì), `references/components.md`, `references/pages.md`.

## Thứ tự dựng

Không đảo thứ tự: mỗi tầng dựa trên tầng trước.

1. **Page.** Tạo / sắp page theo `references/pages.md`. File cũ: chỉ thêm page mới, không đổi tên hay dời page của designer.
2. **Primitives.** `scripts/create-variables.js` với phần `primitives` của CONFIG. Ẩn khỏi publish, `scopes = []`.
3. **Semantic.** Cùng script, phần `semantic`: mỗi biến là alias tới Primitive cho từng mode. Đặt scopes và code syntax.
4. **Typography và Dimension.** Cùng script, phần `typography` / `dimension` (FLOAT và STRING).
5. **Text styles và effect styles.** `scripts/create-styles.js`: text style gắn biến font family / size / weight, line height cố định px; effect style cho elevation.
6. **Soát nền tảng.** Chạy `figma-ds-qa/scripts/lint.js` phần variables (alias hỏng, Semantic trỏ thẳng hex, tên sai quy ước). Báo cho designer, chờ duyệt trước khi sang component.
7. **Board tài liệu foundations.** Color, Typography, Spacing & Radius, Elevation: mỗi ô mẫu **dùng chính token** (fill gắn biến, text gắn style), để board tự cập nhật khi đổi giá trị. Bố cục ở `references/pages.md`.
8. **Component.** Theo `references/components.md`: dựng từ nguyên tử lên (Icon → Button → ListItem → TopAppBar…), mỗi component dựng xong thì chụp ảnh, soát, rồi mới làm cái tiếp theo.
9. **Board tài liệu component.** Mỗi component một khung: mọi variant, bảng property, kích thước chốt, ghi chú `Dev:` bằng text trên canvas.

## Cách chạy script

- Script là thân hàm cho `use_figma`: sửa `CONFIG` ở đầu, dán cả file. Script trả JSON tóm tắt (đã tạo / đã có / lỗi).
- Script **idempotent**: tìm theo tên trước, có rồi thì cập nhật giá trị, không tạo trùng. Chạy lại an toàn.
- Mỗi lượt chạy một tầng. Lượt sau đọc lại kết quả lượt trước (id variable) chứ không giả định.
- Ghi kết quả (tên, id, số lượng) vào `ds/changelog.md`.

## Luật khi dựng

- Semantic **chỉ alias**. Cần alpha: tạo Primitive alpha có tên rõ (`Base/black-a50`) hoặc biến Semantic có giá trị RGBA kèm ghi chú trong spec; không rải hex.
- Mỗi cặp nền / chữ phải đạt tương phản (≥ 4.5:1 chữ thường, ≥ 3:1 chữ lớn / icon / viền control) ở **mọi mode**. Script `create-variables.js` có kiểm tra cặp `X` / `on-X` và trả danh sách cặp không đạt.
- Line height cố định, trên lưới 4, đúng số trong spec; không dùng Auto.
- Component: auto layout ở mọi tầng, không có frame thừa chỉ để bọc; mọi fill / stroke / radius / gap / padding gắn biến; mọi text gắn style; icon là instance của component icon (instance swap), không vẽ lại.
- Dựng component ở page Components, không dựng trong page màn hình.
- Không thêm variant cho từng màn. Khác biệt theo màn = property trên instance (text, boolean, instance swap).
