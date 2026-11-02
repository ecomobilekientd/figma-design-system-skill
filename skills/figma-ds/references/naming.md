# Quy ước đặt tên

Một tên dùng chung ở ba nơi: Figma, `tokens.json`, code. Đặt một lần, không đổi về sau (đổi tên làm vỡ code của dev). Dấu `/` trong Figma tạo nhóm trong picker.

## Collection

| Collection | Mode | Nội dung | Publish |
|---|---|---|---|
| `Primitives` | 1 (`Value`) | dải màu thô, base | ẩn (`hiddenFromPublishing = true`), `scopes = []` |
| `Semantic` | `Light`, `Dark` (hoặc 1 mode nếu chỉ một theme) | màu theo chức năng, chỉ alias | hiện |
| `Brand` (tuỳ chọn) | mỗi brand một mode | alias brand → Primitives; Semantic trỏ vào đây | ẩn |
| `Typography` | 1 | `font/family/*`, `font/size/*`, `font/weight/*` | hiện |
| `Dimension` | 1 (hoặc theo breakpoint) | `space/*`, `size/*`, `radius/*`, `border-width/*`, `opacity/*` | hiện |

Không thêm collection cho từng màn hay từng feature.

## Variable

Dạng: `<loại>/<nhóm>/<vai trò>[-<biến thể>][-<state>]`, chữ thường, gạch ngang.

Primitives: `<Dải>/<bậc>` → `Brand/500`, `Neutral/50`, `Red/600`, `Base/white`. Bậc 50–950.

Semantic, các nhóm gợi ý (bỏ nhóm không dùng, thêm nhóm khi thật cần):

| Nhóm | Ví dụ |
|---|---|
| `color/surface/*` | `base`, `container`, `container-high`, `inverse`, `overlay` |
| `color/content/*` (chữ + icon) | `primary`, `secondary`, `tertiary`, `disabled`, `inverse`, `brand`, `on-brand` |
| `color/border/*` | `subtle`, `default`, `strong`, `selected`, `focus` |
| `color/action/*` | `primary`, `on-primary`, `primary-pressed`, `secondary`, `on-secondary`, `destructive`, `on-destructive` |
| `color/interaction/*` | `pressed`, `hover`, `selected`, `on-selected`, `disabled`, `on-disabled` |
| `color/feedback/*` | `success`, `success-subtle`, `warning`, `warning-subtle`, `error`, `error-subtle`, `info`, `info-subtle` |
| `color/overlay/*` | `scrim`, `on-media` |

Cặp nền / chữ luôn đi đôi: `X` và `on-X`. State là hậu tố: `-pressed`, `-hover`, `-disabled`, `-subtle`.

Dimension: `space/<số>` hoặc `space/<t-shirt>` (chọn một kiểu cho cả file); `radius/<chức năng>` (`badge`, `control`, `card`, `sheet`, `pill`), không dùng thang `s/m/l` vì dev không biết dùng cái nào cho đâu.

## Code syntax

Gắn code syntax cho từng variable để Dev Mode / export hiện đúng tên code:

| Nền tảng | Figma key | Ví dụ cho `color/content/secondary` |
|---|---|---|
| Web | `WEB` | `var(--color-content-secondary)` |
| Android | `ANDROID` | `AppTheme.colors.content.secondary` |
| iOS | `iOS` | `Color.content.secondary` |

Quy tắc chuyển: bỏ `color/` ở Android/iOS nếu theme đã tách nhóm màu; gạch ngang → camelCase (`container-high` → `containerHigh`).

## Style

- Text style: `type/<vai trò>/<cỡ>` → `type/display/l`, `type/title/m`, `type/body/s`, `type/label/m`. Biến thể đậm: `type/label/m-strong`. Tránh đặt cỡ px vào tên trừ khi thang không đủ chỗ.
- Effect style: `elevation/<mức>` (`low`, `mid`, `high`) hoặc theo chức năng (`elevation/nav`, `focus-ring`).
- Paint style chỉ cho gradient và ảnh (variable không chứa được gradient): `gradient/<tên>`.

## Component

- Tên component theo tên của nền tảng đích nếu có tương đương (Compose: `Button`, `IconButton`, `FilterChip`, `TopAppBar`, `ListItem`, `ModalBottomSheet`; SwiftUI / Web dùng tên gần nhất). Dev map 1–1.
- Variant property: `Type`, `Size`, `State` (PascalCase key, giá trị PascalCase). Boolean / text property: camelCase (`showIcon`, `label`).
- State chuẩn: `Default`, `Pressed`, `Hover` (web), `Focused`, `Disabled`, `Selected`, `Loading`, `Error`. Chỉ thêm state component thật có.
- Component con dùng nội bộ: tiền tố `.` hoặc `_` (`_ButtonBase`) để không publish.

## Page

Thứ tự gợi ý: `Cover` · `License` · `—` · `Foundations` (Color, Typography, Spacing & Radius, Elevation, Icon) · `Components` · `—` · `Screens` · `Archive`. Emoji trong tên page chỉ dùng nếu đội đã quen.
