# duyên · hôm nay mình viết

Trang cá nhân của Duyên: mặt nước và kệ sách nhật ký. (Khu vườn "projects" đang tạm ẩn.)

Trang chạy tại https://ptmd2003.github.io/duyen/. Đẩy lên nhánh `main` là trang tự cập nhật.

## Các file
- `index.html`: toàn bộ trang (giao diện, bài viết, sổ đọc sách)
- `tex/`, `art/`: vân gỗ, vải, giấy và tranh gáy sách
- `read.js`: bản dự phòng của sổ đọc sách (bản chính giờ nằm trên Supabase, sửa trong trang quản trị)
- `quan-tri.html`: trang riêng của Duyên (cần đăng nhập): lời nhắn, viết/sửa bài, sổ đọc
- `du-lieu-ban-dau.sql`: chép bài viết và sổ đọc có sẵn lên Supabase (chạy một lần)
- `tools/dong-bo.js`: kéo bài/sách từ Supabase về `index.html` + `read.js` để bản dự phòng luôn mới
- `config.js`: địa chỉ Supabase và khoá publishable (công khai được)
- `og.jpg`, `favicon.*`, `apple-touch-icon.png`: ảnh xem trước khi chia sẻ link và icon trên tab
- `supabase.sql`: bảng `loi_nhan`, luật phân quyền và chống spam. Sửa xong thì chạy lại trong Supabase → SQL Editor
- `tests/`: kiểm tra tự động (`cd tests && npm install && npx playwright install chromium && npm test`)
- `todolist.md`: việc đã làm và sắp làm
- `CLAUDE.md`, `.claude/`, `.mcp.json`: ghi chú và công cụ cho Claude Code

## Lời nhắn
- Duyệt lời nhắn: mở https://ptmd2003.github.io/duyen/quan-tri.html, đăng nhập. Có các ngăn "Chờ duyệt", "Đang hiện", "Thư riêng". Bấm "Duyệt, cho hiện", "Ẩn khỏi trang", "Trả lời" hoặc "Xoá" (bấm hai lần mới xoá).
- Trả lời của mình hiện dưới lời nhắn trên trang (chỉ với lời nhắn đã dán lên trang và đã duyệt).
- Vẫn duyệt được kiểu cũ: Supabase → Table Editor → `loi_nhan` → bật `da_duyet`.

### Mở trang quản trị lần đầu (làm một lần)
1. Supabase → SQL Editor: chạy lại cả file `supabase.sql`, rồi chạy cả file `du-lieu-ban-dau.sql` (chép 23 bài và 44 quyển sách hiện có lên).
2. Authentication → Users → Add user → Create new user: email + mật khẩu của mình, tick "Auto Confirm User".
3. SQL Editor, chạy (thay email):
   `insert into public.quan_tri (user_id) select id from auth.users where email = 'email-cua-minh@...' on conflict do nothing;`
4. Authentication → Sign In / Providers: tắt "Allow new users to sign up" để không ai tự tạo tài khoản được. (Có tạo được thì cũng không vào được trang quản trị, chỉ tài khoản trong bảng `quan_tri` mới vào được.)
- Lời nhắn "Chỉ Duyên đọc" có `cong_khai = false`, không bao giờ hiện trên trang.
- Cả trang nhận tối đa 20 lời nhắn mỗi 10 phút; lời giống hệt lời đã gửi trong ngày sẽ bị chặn.

## Viết và sửa bài
- Mở `quan-tri.html` → **Bài viết**. "+ Viết bài mới" hoặc bấm vào một bài để sửa. Lưu xong, tải lại trang chính là thấy.
- Mỗi lần xuống dòng là một đoạn mới. Link YouTube để riêng một dòng sẽ thành video; gắn link: `[chữ](https://…)`.
- "Cuốn sổ": nhật ký vào sổ theo năm (theo ngày của bài); các mục khác vào cuốn riêng (ghi chú, tiếng Nhật, marketing, lớn lên, sách).
- "Ẩn bài này" = để nháp: lưu được nhưng chưa ai thấy.
- Lưu ý: trang có một bản dự phòng (dùng khi Supabase chậm). Bài đã từng hiện rồi mới ẩn/xoá thì vẫn còn trong bản dự phòng cho tới khi chạy `node tools/dong-bo.js keo` và commit. Bài riêng tư cần gỡ hẳn thì nhờ Claude chạy bước này ngay.
- Đường dẫn (vd. `#bai-ngay-mua`) tự tạo từ tiêu đề và giữ nguyên sau lần lưu đầu, để link cũ, lượt thích và lời nhắn không mất.
- **Sổ đọc**: thêm sách (lên đầu danh sách), sửa năm đọc xong, điểm, đang đọc, muốn đọc lại.
- Trang chính lấy bài từ Supabase; nếu Supabase không trả lời trong 2,5 giây thì dùng bản có sẵn trong `index.html`/`read.js`. Thỉnh thoảng nhờ Claude chạy `node tools/dong-bo.js keo` rồi commit để bản dự phòng có bài mới.

## Lượt thích
- Đếm trong bảng `luot_thich` (mỗi bài một dòng). Người đọc chỉ tăng/giảm 1 qua hàm `thich()`; cả trang tối đa 300 lượt bấm mỗi 10 phút.
- Máy người đọc nhớ bài nào họ đã thích. Nút thích chỉ hiện khi bảng đã được tạo (chạy phần "Lượt thích" trong `supabase.sql`).

## Thêm ảnh hoặc lời đề từ
- Ảnh trong bài: thêm `"img":"art/ten-anh.webp","alt":"mô tả"` vào bài trong `POSTS`.
- Video YouTube: để link YouTube thành một đoạn riêng trong `p` (vd. `"https://youtu.be/…"`), trang sẽ hiện khung video, bấm mới tải.
- Link trong bài: viết `[chữ hiện ra](https://…)`; link để trần `https://…` cũng tự bấm được.
- Lời đề từ của một cuốn: thêm `de:"..."` vào cuốn đó trong `SKIN`.

## Nhật ký cập nhật
- 2026-11-25: Viết và sửa bài ngay trong trang quản trị (ngăn "Bài viết"), không cần đụng vào code nữa; để nháp được. Sổ đọc sách cũng sửa ở đó (ngăn "Sổ đọc"). Bài và sách giờ nằm trên Supabase; trang vẫn có bản dự phòng nếu Supabase chậm. (Cần chạy `supabase.sql` rồi `du-lieu-ban-dau.sql` một lần.)
- 2026-11-25: Có trang riêng `quan-tri.html` để duyệt, ẩn, trả lời và xoá lời nhắn ngay trên điện thoại, không cần vào Supabase nữa. Trả lời của mình hiện dưới tờ giấy lời nhắn trên trang. (Cần làm 4 bước "Mở trang quản trị lần đầu" ở trên.)
- 2026-11-17: Bài có video YouTube giờ hiện video (bấm vào mới tải, như bài "cách dọn dung lượng macbook"). Link trong bài bấm được và mở tab mới. Gắn lại các link bị rơi lúc chuyển từ WordPress: thư viện sách nói, uTorrent/OmniPlayer trong bài học tiếng Nhật, danh sách tài liệu UX/UI.
- 2026-11-15: Mặt nước trên máy tính cũng không hiện tên bài nữa, giống điện thoại. Bỏ chế độ ban đêm, nút đổi ánh sáng nhỏ lại (chỉ còn sáng và chiều). Kéo kệ sách xuống thì thanh menu thu nhỏ và trong hơn. Thanh đọc trên điện thoại trong suốt hơn. Điện thoại: trang sách trượt sang như Kindle/Apple Books, không lật giấy nữa. Máy tính: lật trang mềm như giấy thật hơn (mép giấy nhấc lên trước, cong rồi rơi xuống, có bóng đổ theo trang).
- 2026-11-15: Menu "bài viết" thành "bookshelf", bỏ nút "← Kệ sách". Sổ trên điện thoại lật trang lại như đọc Kindle/Apple Books: chạm hai bên để lật, chạm giữa trang để hiện thanh đọc (mục lục, thanh kéo trang, ẩn/hiện lời nhắn). Lề sách rộng hơn. Nút thích và chia sẻ chuyển xuống góc dưới bên phải, cạnh "Để lại lời nhắn".
- 2026-11-15: "Để lại lời nhắn" giờ là một tờ giấy viết tay: viết trước, ký tên nếu muốn (không bắt buộc), ghim "dán lên trang" nếu muốn hiện lên trang. Gửi thì tờ giấy bay đi. Máy nhớ tên cho lần sau. Ctrl/⌘+Enter để gửi nhanh.
- 2026-11-15: Bỏ hai nhãn gợi ý trên điện thoại: "còn sách ở dưới nữa" ở kệ sách và nhãn năm trên gáy sổ nhật ký.
- 2026-11-15: Điện thoại: mặt nước trở lại kiểu lá sen nằm rải rác như trên máy tính, không hiện tên bài, để người đọc tự chạm vào khám phá. Sổ trên điện thoại đặt thẳng, cuộn xuống để đọc, bỏ hiệu ứng lật trang; máy tính vẫn lật trang như cũ.
- 2026-11-15: Điện thoại: tên bài cạnh lá sen không còn khung trắng, tự mờ đi sau vài giây, chạm mặt nước gần lá sen để xem lại. Kệ sách có gợi ý "còn sách ở dưới nữa", thanh trên cùng không đè lên sách khi cuộn. Sổ trên điện thoại giống cuốn sách hơn: gáy, mép giấy mỏng dần khi đọc, góc trang gập để lật. Chữ nhỏ lại vừa mắt hơn. Cuối mỗi bài có nút thích (đếm chung) và nút chia sẻ. Màn lá lúc mở trang giờ tách ra mềm như lụa thay vì một đường thẳng.
- 2026-11-15: Trên điện thoại gọn hơn: nút đổi ánh sáng lên thanh trên cùng, nút nhạc có hình nốt nhạc, "writings" thành "bài viết". Hoa không còn che chữ ở đầu và cuối trang sách. Nút "Để lại lời nhắn" thành "Đóng" khi đang mở form. Vé "GIỮ LẠI" nằm gọn một dòng. Các nút đủ lớn để bấm bằng ngón tay.
- 2026-11-15: Gửi link trang lên Messenger, Zalo, Facebook giờ hiện ảnh và lời giới thiệu. Có icon hoa trên tab. Cuối mỗi bài có nút "chép link bài này", tab trình duyệt hiện tên bài đang đọc. Sổ đọc sách giờ chỉ sửa ở một chỗ (`read.js`). Lời nhắn trên điện thoại gọn lại: tối đa 2 tờ, bấm vào để đọc hết.
- 2026-11-15: Nối Supabase thật, lời nhắn giờ gửi được tới Duyên. Lời nhắn đã duyệt không còn hiện hai lần. Báo đúng khi chưa gửi được. Bỏ chữ mẫu `[LỜI ĐỀ TỪ CỦA BẠN]`, `[ẢNH CỦA BẠN]`. Thêm chống spam (bẫy bot, chờ 30 giây, giới hạn trong cơ sở dữ liệu). Thêm kiểm tra tự động và ghi chú dự án.
- Trước đó: lật trang mềm hơn, sổ đọc sách từ Notion, kệ sách liền khối.
