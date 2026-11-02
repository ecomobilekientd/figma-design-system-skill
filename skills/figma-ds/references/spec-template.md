# Khung `ds/spec.md`

Copy khung này vào `ds/spec.md` ở bước 2. Ô nào chưa chốt ghi `CHƯA CHỐT` kèm các lựa chọn; không tự điền giá trị rồi coi là chốt.

```markdown
# Design system: <tên dự án>

Trạng thái: NHÁP / ĐÃ CHỐT <ngày>
File Figma: <link>
Nền tảng: <Android Compose | iOS SwiftUI | Web | ...>   Đơn vị: <dp | pt | px>
Mode: <Light, Dark>   Brand mode: <không | tên các brand>

## 1. Primitives
| Dải | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Brand | | | | | | | | | | | |
| Neutral | | | | | | | | | | | |
| Red / Green / Amber / Blue (feedback) | | | | | | | | | | | |
Base: white #FFFFFF, black #000000. Alpha: chỉ thêm khi Semantic cần.

## 2. Semantic (mỗi dòng: Light → Dark, alias Primitive)
| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| color/surface/base | Neutral/50 | Neutral/950 | nền màn |
| ... | | | |

## 3. Typography
Font UI: <tên, nguồn, licence>. Font phụ: <...>.
| Text style | Font | Weight | Size | Line height | Letter spacing |
|---|---|---|---|---|---|
| type/title/l | | | | | |
| ... | | | | | |

## 4. Dimension
- space: 0 2 4 8 12 16 20 24 32 40 48 64
- size/icon: 16 20 24 32 · size/control: 32 40 48 56
- radius (chức năng): badge, control, card, sheet, pill=999
- border-width: 1 2
- opacity: disabled .38, ...

## 5. Effect styles
| Style | Thông số (x y blur spread màu) | Dùng cho |
|---|---|---|

## 6. Component
| Component | Variant property | Boolean / text / instance-swap property | Kích thước chốt |
|---|---|---|---|

## 7. Ngoại lệ được dùng hex / số thô
| Ở đâu | Giá trị | Lý do |
|---|---|---|

## 8. Bảng kích thước chốt (dùng để soát hồi quy)
| Phần tử | Kích thước |
|---|---|
| Top bar | |
| Bottom nav | |
| Button lớn | |

## 9. Còn mở
- ...
```

Quy tắc khi điền:
- Mỗi cặp chữ / nền Semantic phải đạt tương phản WCAG: chữ thường ≥ 4.5:1, chữ lớn và icon ≥ 3:1. Ghi tỉ số cạnh token quan trọng.
- Màu brand quá sáng (vàng, lime, cam nhạt) cần chữ tối trên nút: ghi rõ `on-primary` là màu tối.
- Màu đỏ "nguy hiểm / lỗi / xoá" tách khỏi brand nếu brand là đỏ / cam, để không lẫn nghĩa.
