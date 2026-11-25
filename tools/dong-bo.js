// Đồng bộ bài viết + sổ đọc giữa bản có sẵn trong trang (index.html POSTS, read.js) và Supabase.
//   node tools/dong-bo.js seed   → viết du-lieu-ban-dau.sql (chép bản có sẵn lên Supabase, chạy một lần trong SQL Editor)
//   node tools/dong-bo.js keo    → kéo bài/sách công khai từ Supabase về index.html + read.js (bản dự phòng khi Supabase không trả lời)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), HTML = path.join(ROOT, 'index.html'), READJS = path.join(ROOT, 'read.js');
const POSTS_RE = /^const POSTS = window\.POSTS_SB \|\| (\[.*\]);$/m;

function docGoc() {
  const html = fs.readFileSync(HTML, 'utf8'), m = html.match(POSTS_RE);
  if (!m) throw new Error('Không tìm thấy dòng "const POSTS = window.POSTS_SB || [...]" trong index.html');
  const w = {}; new Function('window', fs.readFileSync(READJS, 'utf8'))(w);
  return { html, posts: JSON.parse(m[1]), read: w.READ || [] };
}
const q = v => v == null || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const n = v => v == null || v === '' || !Number.isFinite(Number(v)) ? 'null' : Number(v);

function seed() {
  const { posts, read } = docGoc();
  let s = `-- Chép bài viết và sổ đọc có sẵn lên Supabase. Chạy SAU supabase.sql, trong SQL Editor.\n-- Chạy lại cũng được: bài đã có (cùng slug) thì giữ nguyên; sổ đọc chỉ chép khi bảng đang trống.\n\n`;
  s += `insert into public.bai_viet (slug, tieu_de, ngay, muc, doan, cau_noi_bat, anh, anh_mo_ta) values\n`;
  s += posts.map(p => `(${q(p.s)}, ${q(p.t)}, ${q(p.d)}, ${q(p.c)}, array[${p.p.filter(x => String(x).trim()).map(q).join(', ')}]::text[], ${q(p.q)}, ${q(p.img)}, ${q(p.alt)})`).join(',\n');
  s += `\non conflict (slug) do nothing;\n\n`;
  s += `insert into public.sach_doc (ten, tac_gia, dang_doc, nam, diem, doc_lai, thu_tu)\nselect * from (values\n`;
  s += read.map((b, i) => `(${q(b.t)}, ${q(b.a)}, ${b.st === 'doc'}, ${n(b.y)}::integer, ${n(b.r)}::numeric, ${!!b.lai}, ${i})`).join(',\n');
  s += `\n) v where not exists (select 1 from public.sach_doc);\n`;
  fs.writeFileSync(path.join(ROOT, 'du-lieu-ban-dau.sql'), s);
  console.log(`du-lieu-ban-dau.sql: ${posts.length} bài, ${read.length} quyển`);
}

async function keo() {
  const cfg = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8'))(cfg);
  const { url, key } = cfg.DUYEN_SB || {}, h = { apikey: key, Authorization: 'Bearer ' + key };
  const get = async p => { const r = await fetch(url + '/rest/v1/' + p, { headers: h }); if (!r.ok) throw new Error(p + ': ' + r.status + ' ' + await r.text()); return r.json(); };
  const [bai, sach] = await Promise.all([get('bai_viet?select=*&order=ngay.desc,tao_luc.desc'), get('sach_doc?select=*&order=thu_tu.asc,id.asc')]);
  if (!bai.length) throw new Error('Supabase chưa có bài nào, không ghi đè.');
  const { html } = docGoc();
  const posts = bai.map(r => Object.assign({ s: r.slug, t: r.tieu_de, d: r.ngay, c: r.muc, p: r.doan }, r.cau_noi_bat ? { q: r.cau_noi_bat } : {}, r.anh ? { img: r.anh, alt: r.anh_mo_ta || '' } : {}));
  fs.writeFileSync(HTML, html.replace(POSTS_RE, () => `const POSTS = window.POSTS_SB || ${JSON.stringify(posts).replace(/</g, "\\u003c")};`));
  const books = sach.map(r => Object.assign({ t: r.ten, a: r.tac_gia || '' }, r.dang_doc ? { st: 'doc' } : {}, r.nam ? { y: r.nam } : {}, r.diem != null ? { r: Number(r.diem) } : {}, r.doc_lai ? { lai: 1 } : {}));
  const head = fs.readFileSync(READJS, 'utf8').split('\n')[0];
  fs.writeFileSync(READJS, `${head}\nwindow.READ = [\n${books.map(b => JSON.stringify(b)).join(',\n')}\n];\n`);
  console.log(`Đã kéo ${posts.length} bài, ${books.length} quyển về index.html + read.js`);
}

const cmd = process.argv[2];
if (cmd === 'seed') seed();
else if (cmd === 'keo') keo().catch(e => { console.error(e.message); process.exit(1); });
else console.log('Dùng: node tools/dong-bo.js seed | keo');
