# Cài đặt và kết nối

| Bước | Công cụ | Bắt buộc? |
|---|---|---|
| 1 | Claude Code | Có |
| 2 | Figma MCP | Có |
| 3 | Plugin Figma chính thức (skill `figma-use`) | Nên có |
| 4 | Bộ skill này | Có |

## 1. Claude Code

Chọn một:
- **Desktop app** (Mac/Windows): tải ở https://claude.ai/download, đăng nhập, mở tab **Code**.
- **CLI**: làm theo https://docs.claude.com/en/docs/claude-code/setup, rồi chạy `claude` để đăng nhập.

## 2. Figma MCP

**Cách A, desktop app hoặc claude.ai**: Settings → Connectors → **Figma** → Connect → đăng nhập Figma và cho phép.

**Cách B, CLI, plugin chính thức** (gồm cả MCP và skill `figma-use`):

```bash
claude plugin install figma@claude-plugins-official
```

**Cách C, CLI, chỉ thêm server:**

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Cách B và C: mở `claude`, gõ `/mcp`, chọn **figma** → Authenticate.

Kiểm tra: dán link một frame và hỏi "đọc frame này". Claude trả được tên layer là xong.

Lưu ý:
- Ghi lên Figma cần quyền edit file và seat Full hoặc Dev. Seat View chỉ đọc được, vẫn chạy được bước kiểm kê.
- Nên làm trên **bản sao** của file thật ở lần đầu (File → Duplicate). Plugin API không lưu được điểm version history có tên, nên trước mỗi bước lớn hãy tự lưu: File → Save to version history.

## 3. Plugin Figma chính thức

Nếu đã dùng cách B ở trên thì đã có. Plugin có skill `figma-use` dạy Claude cách gọi `use_figma` đúng (bắt buộc đọc trước mỗi lệnh ghi) và `figma-generate-library` cho phần dựng thư viện. Bộ skill này dựa trên hai skill đó và thêm quy trình chuẩn hoá, luật đặt tên, script kiểm kê / soát lỗi.

## 4. Cài bộ skill

```bash
git clone https://github.com/ecomobilekientd/figma-design-system-skill.git
```

```bash
mkdir -p ~/.claude/skills && cp -r figma-design-system-skill/skills/* ~/.claude/skills/
```

Kiểm tra: mở phiên mới, gõ `/figma-ds`. Claude đọc `SKILL.md` và hỏi đầu vào là xong.

Cập nhật bản mới:

```bash
cd figma-design-system-skill && git pull && cp -r skills/* ~/.claude/skills/
```

## Chạy thử

1. Tạo file Figma trống, copy link.
2. Trong Claude Code: "Dựng design system mới cho file này: <link>. App ghi chú, Android + iOS, có Light và Dark."
3. Claude hỏi những gì còn thiếu, viết `ds/spec.md`, chờ bạn chốt rồi mới tạo variables.

Với file cũ: "Kiểm kê và chuẩn hoá design system cho file này: <link>". Bước đầu chỉ đọc, ra báo cáo `ds/audit.md`.

## Lỗi hay gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Claude báo không có tool `use_figma` | Figma MCP chưa kết nối hoặc chưa Authenticate (`/mcp`). |
| Lỗi quyền khi ghi | File chỉ có quyền view, hoặc seat không phải Full/Dev. |
| Script chạy quá lâu trên file lớn | Giới hạn theo page (`CONFIG.pages`) thay vì cả file. |
| Font báo thiếu khi tạo text style | Font chưa có trong Figma của bạn: cài font hoặc chọn font Google Fonts. |
