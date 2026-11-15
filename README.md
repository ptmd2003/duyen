# duyên · hôm nay mình viết

Trang cá nhân của Duyên: mặt nước và kệ sách nhật ký. (Khu vườn "projects" đang tạm ẩn.)

Trang chạy tại https://ptmd2003.github.io/duyen/. Đẩy lên nhánh `main` là trang tự cập nhật.

## Các file
- `index.html`: toàn bộ trang (giao diện, bài viết, sổ đọc sách)
- `tex/`, `art/`: vân gỗ, vải, giấy và tranh gáy sách
- `config.js`: địa chỉ Supabase và khoá publishable (công khai được)
- `supabase.sql`: bảng `loi_nhan`, luật phân quyền và chống spam. Sửa xong thì chạy lại trong Supabase → SQL Editor
- `tests/`: kiểm tra tự động (`cd tests && npm install && npx playwright install chromium && npm test`)
- `todolist.md`: việc đã làm và sắp làm
- `CLAUDE.md`, `.claude/`, `.mcp.json`: ghi chú và công cụ cho Claude Code

## Lời nhắn
- Duyệt lời nhắn: Supabase → Table Editor → `loi_nhan` → bật `da_duyet`.
- Lời nhắn "Chỉ Duyên đọc" có `cong_khai = false`, không bao giờ hiện trên trang.
- Cả trang nhận tối đa 20 lời nhắn mỗi 10 phút; lời giống hệt lời đã gửi trong ngày sẽ bị chặn.

## Thêm ảnh hoặc lời đề từ
- Ảnh trong bài: thêm `"img":"art/ten-anh.webp","alt":"mô tả"` vào bài trong `POSTS`.
- Lời đề từ của một cuốn: thêm `de:"..."` vào cuốn đó trong `SKIN`.

## Nhật ký cập nhật
- 2026-11-15: Nối Supabase thật, lời nhắn giờ gửi được tới Duyên. Lời nhắn đã duyệt không còn hiện hai lần. Báo đúng khi chưa gửi được. Bỏ chữ mẫu `[LỜI ĐỀ TỪ CỦA BẠN]`, `[ẢNH CỦA BẠN]`. Thêm chống spam (bẫy bot, chờ 30 giây, giới hạn trong cơ sở dữ liệu). Thêm kiểm tra tự động và ghi chú dự án.
- Trước đó: lật trang mềm hơn, sổ đọc sách từ Notion, kệ sách liền khối.
