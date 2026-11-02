---
name: figma-ds-migrate
description: Gắn các màn hình và component có sẵn trong file Figma cũ vào design system mới: fill / stroke hex → variable, text rời → text style, spacing lệch lưới → bội 4, frame detach → instance, component trùng → một component set; có chụp baseline và soát hồi quy. Dùng ở bước 5 của skill figma-ds, hoặc khi designer nói "gắn token cho các màn", "bind màu vào variable", "áp text style cho cả page", "thay frame bằng instance", "dọn page UI theo design system". Cần variables và styles đã dựng (figma-ds-build).
---

# Gắn màn có sẵn vào design system

Nguyên tắc: **không đổi thiết kế**. Bước này chỉ thay giá trị rời bằng token có cùng (hoặc gần như cùng) giá trị. Mọi thay đổi nhìn thấy được phải nằm trong kế hoạch đã duyệt.

Đọc trước: `figma-ds/references/api-gotchas.md`, `references/regression.md`. Đầu vào: `ds/audit.md` (bảng ánh xạ cũ → mới) và `ds/spec.md`.

## Quy trình mỗi đợt

Một đợt = một section hoặc một page. Không chạy cả file một lần.

1. **Kế hoạch đợt** gửi designer: phạm vi (page / section / id), việc sẽ làm, số node ước tính (chạy script ở chế độ `dryRun: true`), những chỗ sẽ đổi hình.
2. **Baseline**: chụp mọi frame cấp 1 trong phạm vi (xem `references/regression.md`). Lưu vào `ds/baseline/<ngày>/`.
3. **Màu**: `scripts/bind-colors.js`. Chỉ gắn khi màu khớp hoặc rất gần token (`maxDeltaE`, mặc định 2). Màu xa hơn để nguyên và vào danh sách "màu lẻ" cho designer quyết. Chọn token theo vai trò (text → `content/*`, stroke → `border/*`, nền frame → `surface/*` / `action/*`), không chỉ theo hex.
4. **Chữ**: `scripts/apply-text-styles.js`. Gắn style trùng family / weight / size; line height theo style (có thể làm chữ cao thêm vài px: đây là thay đổi nhìn thấy, phải nằm trong kế hoạch). Không gắn style to hơn cỡ đang có.
5. **Spacing**: chỉ sửa giá trị lệch lưới theo bảng làm tròn đã duyệt. Gắn biến `space/*` cho gap / padding nếu spec yêu cầu.
6. **Component**: thay frame detach / bản trùng bằng instance của component chuẩn, giữ text và icon bằng property. Ghi id frame cũ đã thay vào `ds/changelog.md`.
7. **So sau khi sửa**: chụp lại, so với baseline từng frame, đối chiếu bảng kích thước chốt. Lệch ngoài kế hoạch → sửa ngay hoặc báo designer, không để sang đợt sau.
8. **Soát**: `figma-ds-qa/scripts/lint.js` trên phạm vi đợt. Ghi số liệu trước / sau vào `ds/changelog.md`.

## Luật

- Màn hình có thể là bản đang chạy trên store: không "sửa cho đẹp", không gộp hai màn "trông giống nhau".
- Hai màu gần nhau nhưng vai trò khác (chữ phụ và viền) → hai token khác nhau, dù cùng Primitive.
- Màu trong ảnh, logo, minh hoạ, ảnh chụp màn hình dán vào: không gắn.
- Text trong instance: sửa ở master, không override từng instance (trừ text nội dung).
- Không xoá màn cũ. Màn được thay thế chuyển sang page / section Archive nếu designer đồng ý.
- Node designer đã sửa tay trong ngày (theo `ds/changelog.md` hoặc designer báo) không đưa về baseline.
