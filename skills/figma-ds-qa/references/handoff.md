# Bàn giao design system cho dev

## Nguyên tắc

- Một tên, ba nơi: tên token trong Figma = khoá trong `tokens.json` = tên trong code (qua code syntax). Dev không phải dịch.
- Dev có thể chỉ có quyền view, không có seat Dev Mode: mọi thứ dev cần phải **nhìn thấy trên canvas** hoặc nằm trong file xuất.
- Figma là nguồn sự thật cho giá trị; `ds/spec.md` là nguồn sự thật cho quyết định và lý do.

## Gói bàn giao

| Thành phần | Ở đâu | Ghi chú |
|---|---|---|
| tokens.json | `ds/tokens.json`, kèm version trong tên khi gửi (`tokens-v1.2.json`) | xuất bằng `scripts/export-tokens.js` |
| Board Foundations | page Foundations | ô mẫu dùng chính token |
| Board Components | page Components | variant, property, kích thước chốt, ghi chú Dev |
| Bảng kích thước chốt | `ds/spec.md` mục 8 + trên board | dùng để soát hồi quy |
| Licence | page License | font, icon, ảnh, thư viện |
| Asset | export setting trên node (SVG cho icon / logo, PNG @1x–4x cho ảnh) | đặt tên file theo quy ước của nền tảng (`ic_`, `bg_` cho Android) |
| Changelog | `ds/changelog.md` | mỗi đợt: ngày, thay đổi, node id |

## Ghi chú Dev trên canvas

- Text node thường, đặt cạnh frame (bên phải hoặc bên dưới), không đè UI. Bắt đầu bằng `Dev:`.
- Dùng một text style riêng cho ghi chú (ví dụ `doc/note`), màu trung tính, không phải token UI.
- Viết bằng từ vựng của nền tảng đích. Ví dụ:
  - Compose: `Dev: Row, Modifier.height(56.dp), title maxLines = 1, TextOverflow.Ellipsis`
  - SwiftUI: `Dev: HStack(spacing: 12), .frame(height: 56), lineLimit(1)`
  - Web: `Dev: flex row, gap 12, height 56, text-overflow: ellipsis`
- Ghi những gì không thấy được trên ảnh: hành vi (cuộn, ẩn khi gõ phím), giới hạn dòng, min / max width, thứ tự lớp (z-order), thời lượng animation, điều kiện hiện.
- Không dùng annotation Dev Mode, không dùng comment Figma làm tài liệu.

## Update log (sau lần bàn giao đầu)

Khi đã có bản bàn giao (baseline), mọi thay đổi sau đó được ghi ngay trên canvas để dev không phải so cả file:

- Mỗi section có một frame `Update log` (góc trên phải, ngoài vùng màn hình). Mỗi dòng: `dd/mm · thay đổi ngắn · frame / component bị ảnh hưởng · Chờ dev`. Mới nhất ở trên.
- Trên từng màn bị đổi: nhãn ngoài frame, phía trên: `MỚI · dd/mm` hoặc `SỬA · dd/mm` + một dòng mô tả. Với SỬA, thêm mũi tên (vector, nằm hoàn toàn ngoài frame, mũi chạm mép frame ngang chỗ đổi).
- Đặt tên layer `Update marker · <tên frame>` để dễ gỡ.
- Dev làm xong thì comment "done" trên dòng log. Designer kiểm tra, rồi mới xoá dòng log và nhãn. Không tự xoá trước khi dev xác nhận.
- Thay đổi ở thứ dev không build (frame nháp, frame tài liệu) không cần log.
- Không tạo section mới cho mỗi đợt cập nhật; sửa thẳng trong section gốc.

## Version

- Plugin API không lưu được version history có tên: nhắc designer `File → Save to version history` với tên `DS v<x.y> · <ngày>` sau mỗi đợt.
- Tăng version: đổi giá trị token = bản nhỏ (`1.1 → 1.2`); thêm / xoá / đổi tên token = bản lớn (`1.x → 2.0`) và báo dev trước, vì đổi tên làm vỡ code.

## Licence

Bảng trên page License (và trong `ds/spec.md`):

| Tài nguyên | Dùng ở đâu | Licence | Điều kiện | Nguồn | Trạng thái |
|---|---|---|---|---|---|
| Inter | font UI | OFL 1.1 | kèm file licence trong app | rsms.me/inter | Dùng được |

Trạng thái: `Dùng được` / `Chỉ tham khảo` / `Cần kiểm`. Ảnh chụp app khác, ảnh từ thư viện tham chiếu, ảnh AI: chỉ tham khảo, không đưa vào bản build.
