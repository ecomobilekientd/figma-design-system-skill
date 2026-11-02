# Plugin API: lỗi hay gặp khi dựng design system

Đọc cùng skill `figma-use`. Các mục dưới đây đều đã gây lỗi thật trên file production.

## Variables

- `figma.variables.setBoundVariableForPaint(paint, 'color', v)` trả paint **mới** và đặt opacity về 1. Lưu `paint.opacity` trước, gán lại sau. Gán mảng `node.fills = [...]` mới, không sửa phần tử tại chỗ.
- Alias: `figma.variables.createVariableAlias(variable)`; không truyền id string làm giá trị.
- Primitives nên có `scopes = []` và `hiddenFromPublishing = true` để designer không chọn nhầm. Semantic màu đặt scopes cụ thể (`FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR`, `EFFECT_COLOR`), Dimension đặt `GAP`, `CORNER_RADIUS`, `WIDTH_HEIGHT`…
- Xoá variable đang được dùng không báo lỗi; node chỉ mất bind và giữ giá trị cũ. Trước khi xoá: rebind sang biến thay thế, rồi đếm lại số node còn trỏ vào biến cũ (phải bằng 0).
- Variable không chứa được gradient, ảnh, nhiều lớp shadow: dùng paint style / effect style, và gắn variable vào từng thông số bên trong nếu cần.

## Text

- Phải `await figma.loadFontAsync(fontName)` cho **mọi** font của text trước khi sửa nội dung, style hay thuộc tính chữ. Text có nhiều đoạn: dùng `getStyledTextSegments(['fontName'])` để load đủ.
- Gắn style: `await node.setTextStyleIdAsync(style.id)` (bản sync báo lỗi ở chế độ dynamic page). Tương tự `setFillStyleIdAsync`, `setEffectStyleIdAsync`.
- Text style gắn được variable cho `fontSize`, `fontFamily`, `fontWeight`, `letterSpacing`, `lineHeight` qua `style.setBoundVariable(field, variable)`.
- `lineHeight = { unit: 'AUTO' }` tạo số lệch lưới. Dùng `{ unit: 'PIXELS', value: n }`.
- Text hug cao theo line height: đổi line height làm frame cha cao lên. Soát kích thước sau khi áp style (luật vàng 8).

## Auto layout

- `resize()` sau khi đặt `primaryAxisSizingMode = 'AUTO'` sẽ chuyển lại thành FIXED một cách im lặng. Gọi `resize()` trước, đặt AUTO / HUG sau.
- `layoutAlign = 'CENTER'` của con đã cũ, bị bỏ qua im lặng. Căn giữa bằng `primaryAxisAlignItems` / `counterAxisAlignItems` của frame cha, hoặc cho con FILL rồi căn chữ trong nó.
- Con FILL trong cha HUG không có nghĩa; soát và sửa.
- Frame HUG có stroke INSIDE và `strokesIncludedInLayout = true` sẽ lớn thêm 2 × stroke. Đặt `false` nếu cần hai bản cùng kích thước.
- `layoutSizingHorizontal` / `layoutSizingVertical` (`FIXED` / `HUG` / `FILL`) chỉ đặt được khi node đã nằm trong frame auto layout.

## Node và vector

- `figma.createVector()` từ path SVG có stroke đen 1 px mặc định. Đặt `strokes = []` ngay sau khi tạo nếu là hình đặc.
- Connector không tạo được trong file Design (chỉ FigJam). Mũi tên = vector với `strokeCap` dạng arrow.
- Ellipse có `arcData` vẽ dây cung, không phải cung hở. Spinner vẽ bằng vector path.

## Đọc file lớn

- `await figma.loadAllPagesAsync()` trước khi `findAll` qua nhiều page.
- `findAll` trả cả node bên trong instance. Khi kiểm kê, tách đếm "node trong instance" (sửa ở master) và "node rời" (sửa tại chỗ) để không đếm trùng.
- Trả kết quả gọn: đếm và gom nhóm trong script, chỉ trả top N. Kết quả quá lớn sẽ bị cắt.
- Chạy theo từng page nếu file có hàng chục nghìn node; một lệnh chạy quá lâu sẽ timeout.
- `node.exportAsync` / screenshot: chụp tối đa vài node mỗi lần; muốn ảnh nhiều frame thì tạo frame tạm bọc lại rồi chụp, xong xoá.

## Những gì API không làm được

- Lưu version history có tên: designer tự làm (File → Save to version history).
- Đặt thumbnail của file.
- Xuất WEBP: xuất PNG/SVG/PDF.
- Đọc comment của file qua `use_figma`: cần REST API hoặc designer chép lại.
- Ghi chú Dev Mode (annotation) chỉ hiện với seat Dev Mode: dùng text trên canvas.
