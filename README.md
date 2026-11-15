# duyên · hôm nay mình viết

Trang cá nhân của Duyên: mặt nước và kệ sách nhật ký. (Khu vườn "projects" đang tạm ẩn.)

Trang chạy tại https://ptmd2003.github.io/duyen/. Đẩy lên nhánh `main` là trang tự cập nhật.

## Các file
- `index.html`: toàn bộ trang (giao diện, bài viết, sổ đọc sách)
- `tex/`, `art/`: vân gỗ, vải, giấy và tranh gáy sách
- `read.js`: sổ đọc sách (sửa ở đây là đủ)
- `config.js`: địa chỉ Supabase và khoá publishable (công khai được)
- `og.jpg`, `favicon.*`, `apple-touch-icon.png`: ảnh xem trước khi chia sẻ link và icon trên tab
- `supabase.sql`: bảng `loi_nhan`, luật phân quyền và chống spam. Sửa xong thì chạy lại trong Supabase → SQL Editor
- `tests/`: kiểm tra tự động (`cd tests && npm install && npx playwright install chromium && npm test`)
- `todolist.md`: việc đã làm và sắp làm
- `CLAUDE.md`, `.claude/`, `.mcp.json`: ghi chú và công cụ cho Claude Code

## Lời nhắn
- Duyệt lời nhắn: Supabase → Table Editor → `loi_nhan` → bật `da_duyet`.
- Lời nhắn "Chỉ Duyên đọc" có `cong_khai = false`, không bao giờ hiện trên trang.
- Cả trang nhận tối đa 20 lời nhắn mỗi 10 phút; lời giống hệt lời đã gửi trong ngày sẽ bị chặn.

## Lượt thích
- Đếm trong bảng `luot_thich` (mỗi bài một dòng). Người đọc chỉ tăng/giảm 1 qua hàm `thich()`; cả trang tối đa 300 lượt bấm mỗi 10 phút.
- Máy người đọc nhớ bài nào họ đã thích. Nút thích chỉ hiện khi bảng đã được tạo (chạy phần "Lượt thích" trong `supabase.sql`).

## Thêm ảnh hoặc lời đề từ
- Ảnh trong bài: thêm `"img":"art/ten-anh.webp","alt":"mô tả"` vào bài trong `POSTS`.
- Lời đề từ của một cuốn: thêm `de:"..."` vào cuốn đó trong `SKIN`.

## Nhật ký cập nhật
- 2026-11-15: Bỏ hai nhãn gợi ý trên điện thoại: "còn sách ở dưới nữa" ở kệ sách và nhãn năm trên gáy sổ nhật ký.
- 2026-11-15: Điện thoại: mặt nước trở lại kiểu lá sen nằm rải rác như trên máy tính, không hiện tên bài, để người đọc tự chạm vào khám phá. Sổ trên điện thoại đặt thẳng, cuộn xuống để đọc, bỏ hiệu ứng lật trang; máy tính vẫn lật trang như cũ.
- 2026-11-15: Điện thoại: tên bài cạnh lá sen không còn khung trắng, tự mờ đi sau vài giây, chạm mặt nước gần lá sen để xem lại. Kệ sách có gợi ý "còn sách ở dưới nữa", thanh trên cùng không đè lên sách khi cuộn. Sổ trên điện thoại giống cuốn sách hơn: gáy, mép giấy mỏng dần khi đọc, góc trang gập để lật. Chữ nhỏ lại vừa mắt hơn. Cuối mỗi bài có nút thích (đếm chung) và nút chia sẻ. Màn lá lúc mở trang giờ tách ra mềm như lụa thay vì một đường thẳng.
- 2026-11-15: Trên điện thoại gọn hơn: nút đổi ánh sáng lên thanh trên cùng, nút nhạc có hình nốt nhạc, "writings" thành "bài viết". Hoa không còn che chữ ở đầu và cuối trang sách. Nút "Để lại lời nhắn" thành "Đóng" khi đang mở form. Vé "GIỮ LẠI" nằm gọn một dòng. Các nút đủ lớn để bấm bằng ngón tay.
- 2026-11-15: Gửi link trang lên Messenger, Zalo, Facebook giờ hiện ảnh và lời giới thiệu. Có icon hoa trên tab. Cuối mỗi bài có nút "chép link bài này", tab trình duyệt hiện tên bài đang đọc. Sổ đọc sách giờ chỉ sửa ở một chỗ (`read.js`). Lời nhắn trên điện thoại gọn lại: tối đa 2 tờ, bấm vào để đọc hết.
- 2026-11-15: Nối Supabase thật, lời nhắn giờ gửi được tới Duyên. Lời nhắn đã duyệt không còn hiện hai lần. Báo đúng khi chưa gửi được. Bỏ chữ mẫu `[LỜI ĐỀ TỪ CỦA BẠN]`, `[ẢNH CỦA BẠN]`. Thêm chống spam (bẫy bot, chờ 30 giây, giới hạn trong cơ sở dữ liệu). Thêm kiểm tra tự động và ghi chú dự án.
- Trước đó: lật trang mềm hơn, sổ đọc sách từ Notion, kệ sách liền khối.
