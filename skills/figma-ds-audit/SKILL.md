---
name: figma-ds-audit
description: Kiểm kê (chỉ đọc) một file Figma chưa chuẩn hoá trước khi dựng design system: đếm màu hex rời, tổ hợp chữ không có text style, giá trị spacing / radius lệch lưới, effect, component trùng lặp, variables và styles đang có; gom thành bộ token đề xuất và kế hoạch gắn lại. Dùng khi designer nói "kiểm kê file", "audit design system", "file này đang dùng bao nhiêu màu", "xem file cũ lộn xộn tới đâu", hoặc ở bước 1 của skill figma-ds với file cũ. Không ghi gì lên Figma.
---

# Kiểm kê file cũ

Chỉ đọc. Không tạo, sửa, xoá node, style hay variable ở bước này, kể cả khi thấy lỗi rõ ràng.

Đọc kèm: `references/clustering.md` (cách gom), `references/report-template.md` (mẫu báo cáo), và `figma-ds/references/api-gotchas.md` mục "Đọc file lớn".

## Quy trình

1. **Bản đồ file.** `get_metadata` cho từng page (hoặc `use_figma` liệt kê page → section → frame cấp 1 kèm số node). Hỏi designer page nào là màn "đang dùng", page nào là bản cũ / nháp / archive. Chỉ kiểm kê page đang dùng, trừ khi designer muốn cả file.
2. **Chạy `scripts/inventory.js`** qua `use_figma`, mỗi lần một page hoặc vài page (`CONFIG.pages`). Gộp kết quả các lần chạy.
3. **Xem bằng mắt.** `get_screenshot` 3–5 màn tiêu biểu để hiểu hệ thị giác (đâu là màu brand, đâu là nền, chữ phụ). Số liệu không nói được màu nào là "primary".
4. **Gom** theo `references/clustering.md`: màu gần nhau, cỡ chữ, spacing về lưới 4, radius về nhóm chức năng, component trùng.
5. **Viết `ds/audit.md`** theo `references/report-template.md`: hiện trạng bằng số, bộ token đề xuất, bảng ánh xạ cũ → mới, rủi ro, câu hỏi cho designer.
6. **Đưa designer duyệt.** Kết quả của bước này là đầu vào cho `ds/spec.md` (skill `figma-ds`, bước 2). Giá trị nào designer chưa xác nhận thì để `CHƯA CHỐT`.

## Những gì phải trả lời được

- Bao nhiêu màu khác nhau; top màu theo số lần dùng; bao nhiêu % fill đã gắn variable / style.
- Bao nhiêu tổ hợp chữ (font × weight × size × line height); bao nhiêu % text có text style.
- Spacing / padding / gap / radius: các giá trị và số lần; bao nhiêu % nằm trên lưới 4.
- Effect: shadow / blur nào, bao nhiêu lần.
- Component: số component local, số instance, instance bị detach (frame tên giống component nhưng không phải instance), component trùng chức năng.
- Variables / styles đã có: collection, mode, số biến, biến không ai dùng.

## Lưu ý

- Màu trong ảnh, logo, minh hoạ vector không phải màu UI: script bỏ qua fill IMAGE và có `CONFIG.ignoreNamePattern` để bỏ layer logo / illustration. Hỏi designer nếu không chắc.
- Màu gần giống nhau nhưng khác vai trò (ví dụ cùng xám nhưng một cái là chữ, một cái là viền) vẫn có thể là hai token Semantic trỏ cùng một Primitive. Gom ở tầng Primitive, tách ở tầng Semantic.
- Không đề xuất xoá màn "cũ" chỉ vì số liệu: màn chưa từng cập nhật có thể là bản đang chạy trên store. Hỏi.
