# Bộ token mặc định

Dùng khi designer chưa có hệ nào và muốn điểm khởi đầu. Đây là khung, không phải đáp án: màu brand, font, độ bo do designer chốt. Mọi số đều trên lưới 4.

## Màu

### Primitives

Mỗi dải 11 bậc: 50 100 200 300 400 500 600 700 800 900 950. Tạo dải từ một màu gốc bằng OKLCH: giữ hue, độ sáng L từ ~0.97 (50) xuống ~0.20 (950), chroma cao nhất ở 400–600 và giảm dần về hai đầu. Kiểm tra bằng mắt sau khi tạo; chỉnh tay bậc nào bị bẩn.

Dải tối thiểu:
- `Brand` (màu chính)
- `Neutral` (xám; nên ngả nhẹ về hue của brand cho hài hoà, chroma rất thấp)
- `Red` (lỗi, xoá, nguy hiểm), `Green` (thành công), `Amber` (cảnh báo), `Blue` (thông tin) nếu brand không phải xanh dương
- `Base/white`, `Base/black`

Thêm dải phụ (accent thứ hai, màu gói trả phí…) chỉ khi spec có vai trò cho nó.

### Semantic: ánh xạ gợi ý

| Token | Light | Dark |
|---|---|---|
| color/surface/base | Neutral/50 | Neutral/950 |
| color/surface/container | Neutral/100 | Neutral/900 |
| color/surface/container-high | Neutral/200 | Neutral/800 |
| color/surface/inverse | Neutral/900 | Neutral/50 |
| color/content/primary | Neutral/900 | Neutral/50 |
| color/content/secondary | Neutral/600 | Neutral/300 |
| color/content/tertiary | Neutral/500 | Neutral/400 |
| color/content/disabled | Neutral/400 | Neutral/600 |
| color/content/inverse | Neutral/50 | Neutral/900 |
| color/content/brand | Brand/600 | Brand/300 |
| color/border/subtle | Neutral/200 | Neutral/800 |
| color/border/default | Neutral/300 | Neutral/700 |
| color/border/strong | Neutral/500 | Neutral/500 |
| color/action/primary | Brand/600 | Brand/400 |
| color/action/on-primary | Base/white | Brand/950 |
| color/action/primary-pressed | Brand/700 | Brand/500 |
| color/action/secondary | Brand/100 | Brand/900 |
| color/action/on-secondary | Brand/800 | Brand/200 |
| color/action/destructive | Red/600 | Red/400 |
| color/action/on-destructive | Base/white | Red/950 |
| color/interaction/selected | Brand/100 | Brand/900 |
| color/interaction/on-selected | Brand/900 | Brand/100 |
| color/interaction/disabled | Neutral/200 | Neutral/800 |
| color/interaction/on-disabled | Neutral/500 | Neutral/500 |
| color/border/focus | Brand/600 | Brand/300 |
| color/feedback/error · error-subtle | Red/600 · Red/100 | Red/300 · Red/900 |
| color/feedback/success · success-subtle | Green/700 · Green/100 | Green/300 · Green/900 |
| color/feedback/warning · warning-subtle | Amber/700 · Amber/100 | Amber/300 · Amber/900 |
| color/feedback/info · info-subtle | Blue/600 · Blue/100 | Blue/300 · Blue/900 |
| color/overlay/scrim | Base/black @ 0.40 | Base/black @ 0.60 |

Brand sáng (vàng, lime, cam nhạt, cyan nhạt): `on-primary` dùng bậc tối (Brand/950) ở **cả hai** mode và `action/primary` Light lấy bậc 400–500. Luôn kiểm tương phản.

## Typography

| Text style | Size | Line height | Weight gợi ý |
|---|---|---|---|
| type/display/l | 48 | 56 | Bold |
| type/display/m | 36 | 44 | Bold |
| type/title/l | 28 | 36 | SemiBold |
| type/title/m | 22 | 28 | SemiBold |
| type/title/s | 18 | 24 | SemiBold |
| type/body/l | 16 | 24 | Regular |
| type/body/m | 14 | 20 | Regular |
| type/body/s | 12 | 16 | Regular |
| type/label/l | 16 | 20 | Medium |
| type/label/m | 14 | 20 | Medium |
| type/label/s | 12 | 16 | Medium |

Biến: `font/family/ui` (STRING), `font/size/<n>` (FLOAT), `font/weight/regular|medium|semibold|bold` (FLOAT 400/500/600/700). Style mới không có trong bảng: line height = size × 1.25 làm tròn **lên** bội 4.

Font: ưu tiên font có licence mở (OFL) và hỗ trợ đủ ngôn ngữ của app (tiếng Việt cần dấu chồng ở cỡ lớn; CJK / Thai / Devanagari cần font Noto tương ứng). Ghi licence.

## Dimension

| Nhóm | Giá trị |
|---|---|
| space/* | 0 2 4 8 12 16 20 24 32 40 48 64 (2 chỉ cho khe rất nhỏ trong icon / badge) |
| size/icon/* | s 16 · m 20 · l 24 · xl 32 |
| size/control/* | s 32 · m 40 · l 48 · xl 56 (vùng chạm tối thiểu 48 trên mobile) |
| radius/* | badge 4–8 · control 8–12 · card 12–16 · sheet 16–28 · pill 999 |
| border-width/* | thin 1 · thick 2 |
| opacity/* | disabled 0.38 · pressed-overlay 0.12 |

## Effect

| Style | Gợi ý |
|---|---|
| elevation/low | 0 1 2 0 black 12% |
| elevation/mid | 0 4 12 0 black 16% |
| elevation/high | 0 8 24 0 black 20% |
| focus-ring | stroke ngoài 2 px `color/border/focus` (vẽ bằng stroke, không phải effect) |

Dark mode: shadow ít tác dụng trên nền tối; phân tầng bằng `surface/container*` thay vì tăng shadow.
