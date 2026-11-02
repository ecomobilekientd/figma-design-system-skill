---
name: figma-ds
description: Điểm vào để dựng hoặc chuẩn hoá design system trên Figma (variables, text styles, effect styles, component, trang tài liệu, bàn giao dev). Dùng khi designer nói "dựng design system", "chuẩn hoá file Figma", "tạo token / variables", "làm thư viện component", "file này chưa chuẩn, dọn giúp", "setup Light/Dark", hoặc dán link Figma kèm yêu cầu hệ thống hoá. Áp dụng cho cả file mới tinh lẫn file cũ chưa chuẩn hoá. Skill này chọn lộ trình, đặt cổng duyệt và gọi các skill figma-ds-audit, figma-ds-build, figma-ds-migrate, figma-ds-qa.
---

# Figma design system: điểm vào

Mục tiêu: một file Figma mà mọi màu đến từ variable, mọi chữ có text style, mọi khoảng cách nằm trên lưới, mọi phần lặp lại là instance của component, và dev đọc được token bằng đúng tên trong code.

Skill này không quyết thay designer. Màu brand, font, độ bo góc, số mode là quyết định của designer. Claude đề xuất có lý do, designer **chốt**, rồi Claude mới ghi lên Figma.

## Cần có

- Figma MCP (`use_figma`, `get_screenshot`, `get_metadata`). Không có thì dừng, hướng dẫn designer đọc SETUP.md của repo.
- Trước **mỗi** lệnh `use_figma`: đọc skill `figma-use` (plugin Figma chính thức) nếu có. Khi dựng thư viện, đọc thêm `figma-generate-library`. Skill này bổ sung quy trình và luật, không thay hai skill đó.
- Đọc theo nhu cầu:
  - `references/spec-template.md`: khung `ds/spec.md`. Đọc ở bước 2.
  - `references/naming.md`: quy ước tên. Đọc trước khi đặt bất kỳ tên nào.
  - `references/api-gotchas.md`: lỗi Plugin API hay gặp. Đọc trước lệnh ghi đầu tiên.

## Bước 0. Đầu vào

Hỏi gọn trong một lượt những gì chưa biết (đừng hỏi lại điều designer đã nói):

1. Link file Figma, file mới hay file cũ đã có màn hình.
2. Nền tảng đích: Android (Compose / XML), iOS (SwiftUI / UIKit), Web, đa nền tảng. Quyết định tên code syntax và đơn vị (dp / pt / px).
3. Mode cần: Light, Dark, cả hai; có nhiều brand / white-label không.
4. Đã có gì: brand guideline, màu chính, font, icon set, code đang chạy (theme file, tokens).
5. Phạm vi: chỉ foundations, hay cả component, hay cả gắn lại màn có sẵn.
6. Vùng không được đụng: page / section người khác đang làm.

Tạo thư mục làm việc `ds/` cạnh dự án của designer (hoặc nơi designer chỉ định):

```
ds/spec.md         nguồn sự thật: token, style, component đã chốt
ds/decisions.md    đã chốt gì, ngày, lý do
ds/audit.md        báo cáo kiểm kê (file cũ)
ds/changelog.md    mỗi lượt ghi lên Figma: ngày, đã tạo / sửa / xoá gì (kèm node id)
ds/tokens.json     xuất từ Figma ở bước 7
```

## Chọn lộ trình

| Bước | File mới | File cũ | Skill |
|---|---|---|---|
| 1. Kiểm kê (chỉ đọc) | bỏ qua | bắt buộc | `figma-ds-audit` |
| 2. Chốt spec | ✓ | ✓, token gom từ kết quả kiểm kê | skill này |
| 3. Nền tảng | ✓ | ✓ | `figma-ds-build` |
| 4. Component | ✓ | ✓, gộp các bản trùng | `figma-ds-build` |
| 5. Gắn màn có sẵn | bỏ qua | ✓ | `figma-ds-migrate` |
| 6. Soát lỗi | ✓ | ✓ | `figma-ds-qa` |
| 7. Tài liệu + bàn giao | ✓ | ✓ | `figma-ds-qa` |

File cũ nhưng designer muốn làm lại từ đầu: đi lộ trình file mới trong **file mới** hoặc page mới, giữ file cũ làm tham chiếu; bước 5 sau đó là thay màn cũ bằng màn dựng lại.

## Cổng duyệt

Trước mỗi bước ghi (3, 4, 5), gửi designer:
- Sẽ tạo / sửa / xoá gì, bao nhiêu node, ở page nào.
- Bảng giá trị (hoặc trỏ tới mục trong `ds/spec.md`).
- Rủi ro: những gì sẽ đổi hình (ví dụ chữ cao thêm vì line height cố định).

Chỉ ghi khi designer trả lời rõ ràng là đồng ý cho đúng thay đổi đó. Đồng ý ở bước này không áp cho bước sau.

## 8 luật vàng

1. **Đọc trước khi ghi.** Đọc lại node / collection hiện tại ngay trước khi sửa. Designer có thể vừa sửa tay. Chỉ xoá đúng id nêu trong kế hoạch; ghi id đã xoá vào `ds/changelog.md`.
2. **Không đụng thứ ngoài phạm vi.** Page, section, frame mà designer không nêu tên thì không sửa, không di chuyển, không đổi tên. Node thử nghiệm nằm ngoài section là của designer.
3. **Hai tầng token.** Primitives (giá trị thô, ẩn khỏi publish, không cho chọn trực tiếp) → Semantic (chỉ alias, theo chức năng, có mode). Màn hình và component chỉ dùng Semantic. Tầng component token chỉ thêm khi một component thật sự cần đổi riêng.
4. **Tên theo chức năng, không theo giá trị.** `color/content/secondary`, không phải `gray-600`. `radius/card`, không phải `radius/16`. Chi tiết: `references/naming.md`.
5. **Lưới 4.** Spacing, padding, gap, radius, kích thước control là bội số của 4 (ngoại lệ có chủ ý: stroke 1–2, radius pill 999). Cỡ chữ là số chẵn.
6. **Mọi text có text style.** Không gắn font / size lẻ. Line height **cố định bằng px, trên lưới 4, trùng giá trị trong code**; không để Auto (Auto ra số lệch lưới, đổi theo font, dev không đọc được). Thiếu tổ hợp thì thêm style, không dùng style to hơn.
7. **Mọi màu đến từ variable.** Ngoại lệ (ảnh, logo, minh hoạ, màu doc) phải nằm trong danh sách ngoại lệ ở `ds/spec.md`.
8. **Sửa master là sửa mọi nơi.** Trước khi đổi component master hoặc style: chụp baseline các màn dùng nó; sau khi đổi: chụp lại, so từng frame, đối chiếu bảng kích thước đã chốt. Xem `figma-ds-migrate/references/regression.md`.

## Ghi chú cho dev

- Dev thường xem file ở chế độ view, không có seat Dev Mode: **mọi ghi chú là text trên canvas** cạnh frame, bắt đầu bằng `Dev:`. Không dùng annotation của Dev Mode.
- Dùng từ vựng của nền tảng đích (Compose: `Column`, `Box`, `Modifier.padding`; SwiftUI: `VStack`, `.padding`; Web: flex, gap).
- Mọi font, icon set, ảnh đưa vào design system phải có licence rõ (OFL, MIT, Apache, licence thương mại đã mua). Ghi vào page `License` hoặc `ds/spec.md`. Ảnh chụp app đối thủ, ảnh AI chỉ dùng tham khảo.

## Kết thúc mỗi lượt

- Cập nhật `ds/changelog.md` (đã tạo / sửa / xoá, node id) và `ds/decisions.md` nếu có gì vừa chốt.
- Báo cho designer: đã làm gì, số liệu soát lỗi (bao nhiêu màu chưa gắn biến, text thiếu style…), ảnh chụp một board tiêu biểu, việc còn mở.
- Nhắc designer tự lưu version history có tên trong Figma (API không làm được).
