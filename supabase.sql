-- Chạy một lần trong Supabase → SQL Editor.
create table if not exists public.loi_nhan (
  id bigint generated always as identity primary key,
  slug text,                      -- bài viết; null = hộp thư
  ten text check (char_length(ten) <= 40),
  loi text not null check (char_length(loi) between 1 and 500),
  cong_khai boolean not null default false,  -- true = cho dán lên trang
  da_duyet boolean not null default false,   -- Duyên bật khi muốn hiện
  tao_luc timestamptz not null default now()
);
alter table public.loi_nhan enable row level security;

-- Ai cũng gửi được, nhưng không tự duyệt được cho mình.
create policy "gui loi nhan" on public.loi_nhan for insert to anon
  with check (da_duyet = false);

-- Người ngoài chỉ đọc được lời nhắn công khai đã duyệt.
create policy "doc loi nhan da duyet" on public.loi_nhan for select to anon
  using (cong_khai = true and da_duyet = true);
-- Không có policy update/delete cho anon: người ngoài không sửa, không xoá được.
