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
