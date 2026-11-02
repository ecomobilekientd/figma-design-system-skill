# Soát hồi quy khi sửa master, style hoặc gắn token

Mọi thay đổi ở component master, text style, variable hay effect style lan ra **mọi** instance cùng lúc. Một lần áp line height cố định có thể làm bottom nav nở 40 px, header sheet cao gấp rưỡi, chữ trong pill bị cắt, ở hàng chục màn mà không ai sửa trực tiếp màn đó.

## Trước khi sửa

1. Liệt kê frame cấp 1 trong phạm vi (và màn dùng component / style sắp sửa, nếu sửa master).
2. Chụp từng frame (`get_screenshot` hoặc `exportAsync` PNG 1x), lưu `ds/baseline/<dd-mm>/<tên-frame>.png`.
3. Ghi kích thước (width × height) của các phần tử trong **bảng kích thước chốt** của `ds/spec.md` (top bar, bottom nav, nút lớn, sheet header…), lấy bằng script đọc `node.width/height`.

## Sau khi sửa

1. Chụp lại cùng danh sách frame.
2. So từng cặp ảnh. Có công cụ thì diff pixel (ImageMagick `compare -metric AE`, hoặc script Python PIL) và xếp frame theo mức lệch; không có thì đặt cạnh nhau và xem bằng mắt.
3. Đọc lại kích thước các phần tử trong bảng chốt. Lệch ≥ 1 px ngoài kế hoạch = lỗi.
4. Lỗi hay gặp và cách sửa:

| Hiện tượng | Nguyên nhân thường gặp | Sửa |
|---|---|---|
| Thanh điều hướng / chip nở rộng | khung HUG, chữ đổi metric | khung chrome FIXED đúng kích thước chốt, tab FILL |
| Header / list item cao thêm | line height cố định lớn hơn Auto cũ | chỉnh padding trong khung để giữ tổng chiều cao, hoặc cập nhật bảng chốt nếu designer đồng ý |
| Chữ bị cắt | text FIXED height, line height tăng | text HUG chiều cao, hoặc khung đủ cao |
| Text node cao cũ (18) sau khi style mới là 20 | text hug chưa tính lại | đặt lại `textAutoResize` để Figma tính lại |
| Màu đổi nhẹ | gắn token xa hơn ngưỡng | gỡ bind, đưa vào danh sách màu lẻ |
| Shadow mất | effect style mới thay effect rời | so thông số, sửa style |

## Ngoại lệ

- Node designer sửa có chủ ý trong ngày (ghi trong `ds/changelog.md` hoặc designer báo): không đưa về baseline.
- Thay đổi đã được duyệt trong kế hoạch đợt (ví dụ "list item cao 144 → 160 vì line height"): cập nhật bảng kích thước chốt, ghi vào `ds/decisions.md`.
