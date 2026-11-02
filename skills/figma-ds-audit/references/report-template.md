# Mẫu `ds/audit.md`

```markdown
# Kiểm kê design system: <tên file>

Ngày: <dd/mm/yyyy> · Phạm vi: <các page> · Chỉ đọc, chưa sửa gì.

## 1. Hiện trạng
| Chỉ số | Giá trị |
|---|---|
| Node rời (không tính trong instance) | |
| Fill gắn variable / style | x / y (z%) |
| Text có text style | x / y (z%) |
| Spacing trên lưới 4 | x / y (z%) |
| Màu khác nhau | |
| Tổ hợp chữ khác nhau | |
| Component local / instance | |
| Frame giống component (nghi detach) | |
| Variables / styles đã có | |

Ảnh tham chiếu: <3–5 màn đã chụp>

## 2. Màu
Ngưỡng gom: ΔE76 < 3. Đề xuất Primitives:
| Dải | Bậc | Hex | Gom từ (hex, số lần) |
|---|---|---|---|

Đề xuất Semantic:
| Token | Primitive | Bằng chứng (dùng ở đâu, bao nhiêu lần) |
|---|---|---|

Màu cần designer quyết (3 ≤ ΔE < 6, hoặc màu lẻ):
| Hex | Số lần | Gần nhất | ΔE | Đề xuất |
|---|---|---|---|---|

## 3. Chữ
| Text style đề xuất | Font / weight / size / line height | Gom từ | Thay đổi nhìn thấy |
|---|---|---|---|

## 4. Spacing, radius, effect
| Loại | Giá trị hiện có (số lần) | Thang / token đề xuất |
|---|---|---|

## 5. Component
| Component | Hiện trạng | Đề xuất |
|---|---|---|

## 6. Kế hoạch gắn lại (cho bước 5)
| Đợt | Page / section | Việc | Số node ước tính |
|---|---|---|---|

## 7. Rủi ro
- Những chỗ sẽ đổi hình: ...
- Màn có thể là bản đang chạy trên store, không được đổi thiết kế: ...

## 8. Câu hỏi cho designer
1. ...
```
