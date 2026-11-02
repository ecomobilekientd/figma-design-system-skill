# Page và board tài liệu

## Thứ tự page gợi ý

```
Cover
License            font, icon, ảnh, thư viện: tên, nơi dùng, licence, nguồn
———
Foundations        hoặc tách: Color · Typography · Spacing & Radius · Elevation · Icon
Components
———
Screens            mỗi flow một section
Archive            bản cũ, không xoá
```

File cũ: thêm page mới cạnh page sẵn có; không đổi tên, không xếp lại page của designer trừ khi được yêu cầu.

## Bố cục board

- Mỗi board là một frame auto layout dọc, rộng cố định (ví dụ 1440), padding 64, gap 40. Đầu board: tiêu đề + 1–2 câu mô tả + ngày cập nhật.
- Chrome của board (nền, chữ tiêu đề) dùng một bộ màu trung tính riêng hoặc chính token `surface` / `content`; không pha màu brand vào chrome.
- Ô mẫu dùng **chính token**: ô màu fill gắn biến, nhãn ghi tên token + hex đã resolve; dòng chữ mẫu gắn text style, nhãn ghi size / line height / weight.

| Board | Nội dung |
|---|---|
| Color · Primitives | lưới dải × bậc, mỗi ô: tên, hex |
| Color · Semantic | theo nhóm; mỗi hàng: token, ô Light, ô Dark, alias, dùng cho. Hai cột mode = hai frame đặt mode Light / Dark trên frame (explicit mode), không vẽ màu tay |
| Typography | mỗi style một dòng mẫu + thông số; thêm một khối thử ngôn ngữ dài / có dấu |
| Spacing & Radius | thanh spacing theo thang, ô radius theo vai trò kèm tên chức năng |
| Elevation | thẻ mẫu cho mỗi effect style, trên Light và Dark |
| Icon | lưới icon, tên dưới mỗi icon, ghi nguồn và licence |
| Component | mỗi component: set variant, bảng property, kích thước chốt, ghi chú `Dev:` |

## Màn hình

- Mỗi flow một section. Frame màn hình đặt tên theo màn + state (`Home / Empty`, `Home / Loaded`).
- Cặp Light / Dark: cùng một frame nhân đôi, đổi explicit mode của Semantic trên frame; không vẽ lại.
- Ghi chú cho dev là text trên canvas cạnh frame, bắt đầu bằng `Dev:`.
