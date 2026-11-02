# Luật dựng component

## Cấu trúc

- Auto layout ở mọi tầng. Layer đặt tên theo vai trò (`Container`, `Label`, `LeadingIcon`, `TrailingIcon`), không để `Frame 123`.
- Không frame bọc thừa: mỗi frame phải có lý do (padding, nền, căn hàng).
- Kích thước: chiều cao control **FIXED** theo `size/control/*`; chiều rộng HUG (nút) hoặc FILL (ô nhập, list item). Chrome (top bar, bottom nav, tab bar) FIXED cả hai chiều theo bảng kích thước chốt, để đổi chữ không làm nở khung.
- Mọi gap, padding, radius, stroke weight gắn biến Dimension. Mọi fill / stroke gắn biến Semantic. Mọi text gắn text style.
- Icon: một component cho mỗi icon (`icon/<tên>`), khung vuông 24, nét theo bộ icon; trong component khác dùng instance + property **instance swap**. Màu icon gắn `color/content/*` qua fill / stroke của vector bên trong.
- Vùng chạm tối thiểu 48 × 48 (mobile). Icon button nhỏ hơn thì giữ khung 48, phần nhìn thấy nhỏ hơn.

## Variant và property

| Loại khác biệt | Dùng |
|---|---|
| Hình dạng / màu khác hẳn (Primary, Secondary, Ghost, Destructive) | Variant `Type` |
| Kích thước (S, M, L) | Variant `Size` |
| Trạng thái (Default, Pressed, Disabled, Selected, Loading, Error) | Variant `State` |
| Có / không có icon, badge, divider | Boolean property `showX` |
| Nội dung chữ | Text property `label`, `title`, `supportingText` |
| Icon nào | Instance swap property `icon`, có preferred values |

- Không tạo tổ hợp variant không tồn tại trong thực tế (ví dụ Ghost × Loading nếu sản phẩm không có).
- Không tạo variant cho từng màn hay từng ngôn ngữ.
- Mỗi variant đặt tên theo key=value; giữ cùng thứ tự key trong toàn file: `Type`, `Size`, `State`.
- Component set sắp variant thành lưới: hàng = Type × Size, cột = State. Khung set có padding và gap trên lưới 4.

## State

- `Pressed` / `Hover`: đổi sang token `-pressed` / `-hover`, không chồng lớp mờ thủ công.
- `Disabled`: dùng `interaction/disabled` + `on-disabled`, không giảm opacity cả component (chữ sẽ không đạt tương phản dự kiến, và dev thường làm khác).
- `Focused`: stroke ngoài `border/focus` 2 px; không đổi kích thước component.
- `Loading`: giữ nguyên kích thước của Default; nội dung thay bằng spinner. Mọi trạng thái có giá trị động (giá, số liệu) giữ đúng kích thước khi chưa có dữ liệu, để không nhảy layout.

## Danh sách tối thiểu cho app mobile

Theo độ ưu tiên; chỉ dựng cái spec có.

1. Icon set, Button, IconButton, Divider
2. TextField, Checkbox, Radio, Switch, Chip
3. ListItem, Card, Badge, Avatar
4. TopAppBar, BottomNavigation / TabBar, Tabs / SegmentedControl
5. BottomSheet, Dialog, Snackbar / Toast, Tooltip
6. Empty state, Loading / Skeleton, Progress

## Mỗi component dựng xong

1. Chụp ảnh component set.
2. Chạy `figma-ds-qa/scripts/lint.js` giới hạn ở node đó (`CONFIG.rootIds`): 0 màu rời, 0 text thiếu style, 0 số lệch lưới.
3. Đổi mode Light ↔ Dark trên một frame thử chứa instance, chụp cả hai.
4. Ghi vào bảng component trong `ds/spec.md`: property, kích thước chốt.
5. Board tài liệu: các variant, bảng property, ghi chú `Dev:` (hành vi, giới hạn dòng, ellipsis, min / max width) bằng text trên canvas, dùng tên của nền tảng đích.
