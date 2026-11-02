# Gom giá trị rời thành token

Mục tiêu: ít token nhất mà vẫn giữ được thiết kế hiện tại. Không "làm đẹp" thiết kế ở bước này; mọi thay đổi nhìn thấy được phải nêu trong báo cáo để designer chốt.

## Màu

1. Bỏ màu chỉ xuất hiện trong ảnh, logo, minh hoạ.
2. Đổi mỗi hex sang Lab, gom các màu có ΔE76 < 3 (mắt gần như không phân biệt). Đại diện cụm = màu dùng nhiều nhất.
3. 3 ≤ ΔE < 6: liệt kê riêng, hỏi designer gộp hay giữ.
4. Xếp cụm theo sắc độ (hue) thành dải: brand, neutral, các màu feedback. Mỗi dải xếp theo độ sáng và đặt bậc 50–950 gần nhất; bậc còn trống thì nội suy (OKLCH) và đánh dấu "nội suy".
5. Màu có alpha: nếu là màu đen / trắng / brand với alpha → giữ là alpha của Primitive (`Base/black` @ 0.5) ở tầng Semantic, không tạo Primitive riêng cho từng alpha.
6. Gán vai trò Semantic theo **nơi dùng** (cột `roles` của inventory: frame / shape / text / stroke) và ảnh chụp màn: nền lớn nhất → `surface/base`, chữ nhiều nhất → `content/primary`, nút chính → `action/primary`…
7. Màu dùng ≤ 2 lần và không gần cụm nào: ghi vào bảng "màu lẻ" để designer quyết: đổi sang token gần nhất, hay giữ làm ngoại lệ.

Ngưỡng ΔE là gợi ý; ghi rõ ngưỡng đã dùng trong báo cáo.

## Chữ

1. Gom theo (family, weight, size). Line height khác nhau trong cùng size → chọn một giá trị trên lưới 4 (thường size × 1.25–1.5, làm tròn lên bội 4).
2. Xếp các size thành thang 5–8 bậc theo vai trò: display, title (l/m/s), body (l/m/s), label (l/m/s). Size lẻ (13, 15, 17) → size chẵn gần nhất; ghi lại những chỗ sẽ đổi.
3. Weight: giữ tối đa 3 (Regular, Medium/SemiBold, Bold).
4. Mỗi tổ hợp còn lại = một text style. Tổ hợp dùng ≤ 2 lần: hỏi gộp vào style gần nhất.

## Spacing

- Giá trị trên lưới 4 giữ nguyên. Lệch lưới (5, 6, 10, 14, 18, 22) → bội 4 gần nhất; giá trị cách đều hai bội (6, 10, 14) hỏi designer làm tròn lên hay xuống, hoặc theo ngữ cảnh (padding nút thường lên).
- Thang đề xuất: các giá trị còn lại sau khi làm tròn, sắp tăng dần. Thường 0 4 8 12 16 20 24 32 40 48 64.

## Radius

- Gom theo **vai trò**, không theo số: các radius của chip / badge, của nút / ô nhập, của card, của sheet / dialog, và pill (≥ nửa chiều cao, dùng 999).
- Mỗi vai trò một token `radius/<vai trò>`. Hai vai trò cùng số vẫn là hai token (để đổi riêng sau này).

## Effect

- Shadow trùng thông số → một effect style. Gom 2–4 mức `elevation/low|mid|high` theo blur và offset.
- Background blur: hỏi nền tảng đích có hỗ trợ không (ví dụ Android chỉ blur nền từ API 31+); nếu không, cần màu fallback đặc.

## Component

- Frame tên giống component nhưng không phải instance = instance đã detach: đề xuất thay bằng instance.
- Hai component cùng chức năng khác chi tiết (Button, Button 2, btn-primary) → gộp thành một component set với variant `Type` / `Size` / `State`. Liệt kê khác biệt để designer chọn bản chuẩn.
