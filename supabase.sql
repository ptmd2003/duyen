-- Chạy trong Supabase → SQL Editor. Chạy lại cả file nhiều lần cũng được.
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
drop policy if exists "gui loi nhan" on public.loi_nhan;
create policy "gui loi nhan" on public.loi_nhan for insert to anon
  with check (da_duyet = false);

-- Người ngoài chỉ đọc được lời nhắn công khai đã duyệt.
drop policy if exists "doc loi nhan da duyet" on public.loi_nhan;
create policy "doc loi nhan da duyet" on public.loi_nhan for select to anon
  using (cong_khai = true and da_duyet = true);
-- Không có policy update/delete cho anon: người ngoài không sửa, không xoá được.

-- ---------- Chống spam (chạy lại được nhiều lần) ----------
-- Người ngoài chỉ được ghi 4 cột này; id, da_duyet, tao_luc do máy chủ tự đặt.
revoke insert on public.loi_nhan from anon;
grant insert (slug, ten, loi, cong_khai) on public.loi_nhan to anon;

alter table public.loi_nhan drop constraint if exists loi_nhan_slug_len;
alter table public.loi_nhan add constraint loi_nhan_slug_len check (slug is null or char_length(slug) <= 120);

create index if not exists loi_nhan_tao_luc on public.loi_nhan (tao_luc desc);

-- Cả trang nhận tối đa 20 lời nhắn mỗi 10 phút, và không nhận một lời giống hệt lời vừa gửi.
create or replace function public.loi_nhan_chan_spam() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.loi_nhan where tao_luc > now() - interval '10 minutes') >= 20 then
    raise exception 'qua nhieu loi nhan, thu lai sau' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.loi_nhan where loi = new.loi and tao_luc > now() - interval '1 day') then
    raise exception 'loi nhan trung' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists chan_spam on public.loi_nhan;
create trigger chan_spam before insert on public.loi_nhan
  for each row execute function public.loi_nhan_chan_spam();

-- ---------- Lượt thích (chạy lại được nhiều lần) ----------
-- Mỗi bài một dòng: slug và số lượt thích. Ai cũng đọc được số đếm.
create table if not exists public.luot_thich (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,120}$'),
  so integer not null default 0 check (so >= 0),
  sua_luc timestamptz not null default now()
);
alter table public.luot_thich enable row level security;
drop policy if exists "doc luot thich" on public.luot_thich;
create policy "doc luot thich" on public.luot_thich for select to anon using (true);
grant select on public.luot_thich to anon;
-- Người ngoài không ghi thẳng vào bảng; chỉ được tăng/giảm 1 qua hàm thich().
revoke insert, update, delete on public.luot_thich from anon;

-- Nhật ký lượt bấm, chỉ hàm thich() dùng; người ngoài không đọc/ghi được.
create table if not exists public.luot_bam (id bigint generated always as identity primary key, tao_luc timestamptz not null default now());
alter table public.luot_bam enable row level security;
revoke all on public.luot_bam from anon;

create or replace function public.thich(p_slug text, p_cong integer) returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_cong not in (1, -1) then raise exception 'p_cong phai la 1 hoac -1'; end if;
  if p_slug !~ '^[a-z0-9-]{1,120}$' then raise exception 'slug khong hop le'; end if;
  -- Chặn spam: cả trang tối đa 300 lượt bấm mỗi 10 phút (đếm trong bảng nhật ký riêng).
  delete from public.luot_bam where tao_luc < now() - interval '1 day';
  if (select count(*) from public.luot_bam where tao_luc > now() - interval '10 minutes') >= 300 then
    raise exception 'qua nhieu luot thich, thu lai sau' using errcode = 'P0001';
  end if;
  insert into public.luot_bam default values;
  insert into public.luot_thich (slug, so) values (p_slug, greatest(p_cong, 0))
  on conflict (slug) do update set so = greatest(public.luot_thich.so + p_cong, 0), sua_luc = now()
  returning so into n;
  return n;
end $$;
revoke all on function public.thich(text, integer) from public;
grant execute on function public.thich(text, integer) to anon;

-- ---------- Trang quản trị quan-tri.html (chạy lại được nhiều lần) ----------
-- Duyên trả lời lời nhắn; lời trả lời hiện dưới lời nhắn đã dán lên trang.
alter table public.loi_nhan add column if not exists tra_loi text;
alter table public.loi_nhan drop constraint if exists loi_nhan_tra_loi_len;
alter table public.loi_nhan add constraint loi_nhan_tra_loi_len check (tra_loi is null or char_length(tra_loi) <= 1000);
alter table public.loi_nhan add column if not exists tra_loi_luc timestamptz;
-- Người ngoài vẫn chỉ ghi được 4 cột (slug, ten, loi, cong_khai) như trên, không ghi được tra_loi.

-- Danh sách tài khoản quản trị. Không ai đọc/ghi bảng này qua API; Duyên tự thêm mình bằng SQL (xem README).
create table if not exists public.quan_tri (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.quan_tri enable row level security;
revoke all on public.quan_tri from anon, authenticated;

create or replace function public.la_quan_tri() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.quan_tri where user_id = auth.uid());
$$;
revoke all on function public.la_quan_tri() from public, anon;
grant execute on function public.la_quan_tri() to authenticated;

-- Quản trị đọc hết, duyệt/ẩn/trả lời, xoá được. Tài khoản đăng nhập khác không làm gì được.
drop policy if exists "quan tri doc" on public.loi_nhan;
create policy "quan tri doc" on public.loi_nhan for select to authenticated using ((select public.la_quan_tri()));
drop policy if exists "quan tri sua" on public.loi_nhan;
create policy "quan tri sua" on public.loi_nhan for update to authenticated using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));
drop policy if exists "quan tri xoa" on public.loi_nhan;
create policy "quan tri xoa" on public.loi_nhan for delete to authenticated using ((select public.la_quan_tri()));
revoke insert, update on public.loi_nhan from authenticated;
-- Người ngoài không bao giờ cần sửa/xoá; thu luôn quyền cho chắc (RLS vốn đã chặn).
revoke update, delete on public.loi_nhan from anon;
grant select, delete on public.loi_nhan to authenticated;
grant update (da_duyet, cong_khai, tra_loi, tra_loi_luc) on public.loi_nhan to authenticated;

-- ---------- Dọn quyền gọi hàm (chạy lại được nhiều lần) ----------
-- Hàm chống spam chỉ chạy qua trigger, không ai gọi thẳng qua API.
revoke all on function public.loi_nhan_chan_spam() from public, anon, authenticated;
-- thich() chỉ dành cho người đọc (anon); tài khoản đăng nhập không cần.
revoke execute on function public.thich(text, integer) from authenticated;

-- ---------- Bài viết và sổ đọc sách (chạy lại được nhiều lần) ----------
-- Trang đọc bài từ đây; nếu Supabase không trả lời thì dùng bản có sẵn trong index.html / read.js.
create table if not exists public.bai_viet (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,120}$'),
  tieu_de text not null check (char_length(tieu_de) between 1 and 200),
  ngay date not null default current_date,
  muc text not null default 'diary' check (muc in ('diary','notes','japanese','marketing','growth','books')),
  doan text[] not null default '{}',          -- các đoạn văn
  cau_noi_bat text,                           -- câu được tô màu (phải nằm trong một đoạn)
  anh text, anh_mo_ta text,                   -- ảnh minh hoạ (không bắt buộc)
  an boolean not null default false,          -- true = nháp / ẩn khỏi trang
  tao_luc timestamptz not null default now(),
  sua_luc timestamptz not null default now()
);
alter table public.bai_viet enable row level security;

create table if not exists public.sach_doc (
  id bigint generated always as identity primary key,
  ten text not null check (char_length(ten) between 1 and 200),
  tac_gia text check (char_length(tac_gia) <= 200),
  dang_doc boolean not null default false,
  nam integer check (nam between 1900 and 2100),   -- năm đọc xong
  diem numeric(2,1) check (diem between 0 and 5),
  doc_lai boolean not null default false,
  thu_tu integer not null default 0,               -- nhỏ hơn đứng trước
  sua_luc timestamptz not null default now()
);
alter table public.sach_doc enable row level security;

-- Ai cũng đọc được bài không ẩn và cả sổ đọc; chỉ quản trị mới thêm/sửa/xoá.
drop policy if exists "doc bai viet" on public.bai_viet;
create policy "doc bai viet" on public.bai_viet for select to anon using (an = false);
drop policy if exists "quan tri bai viet" on public.bai_viet;
create policy "quan tri bai viet" on public.bai_viet for all to authenticated using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));
revoke all on public.bai_viet from anon, authenticated;
grant select on public.bai_viet to anon;
grant select, insert, update, delete on public.bai_viet to authenticated;

drop policy if exists "doc sach doc" on public.sach_doc;
create policy "doc sach doc" on public.sach_doc for select to anon using (true);
drop policy if exists "quan tri sach doc" on public.sach_doc;
create policy "quan tri sach doc" on public.sach_doc for all to authenticated using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));
revoke all on public.sach_doc from anon, authenticated;
grant select on public.sach_doc to anon;
grant select, insert, update, delete on public.sach_doc to authenticated;

create or replace function public.dat_sua_luc() returns trigger language plpgsql set search_path = public as $$
begin new.sua_luc = now(); return new; end $$;
revoke all on function public.dat_sua_luc() from public, anon, authenticated;
drop trigger if exists sua_luc on public.bai_viet;
create trigger sua_luc before update on public.bai_viet for each row execute function public.dat_sua_luc();
drop trigger if exists sua_luc on public.sach_doc;
create trigger sua_luc before update on public.sach_doc for each row execute function public.dat_sua_luc();
