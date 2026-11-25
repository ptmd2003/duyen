// Smoke test: serves the site locally, fakes Supabase, and checks the notes flow.
// Run: cd tests && npm install && npx playwright install chromium && npm test
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), PORT = 8123;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });

// Fake supabase-js: loi_nhan reads/inserts, luot_thich read (only when window.__likes is set), rpc('thich').
const FAKE = `window.supabase={createClient(){return{
 from(t){const q={select(){return q},eq(){return q},not(){return q},order(){return q},
  limit(){return Promise.resolve({data:(window.__rows||[]),error:null})},
  insert(r){window.__ins=(window.__ins||[]).concat(r);return Promise.resolve({error:null})},
  then(ok,no){return Promise.resolve(t==='luot_thich'&&window.__likes?{data:window.__likes,error:null}:{data:null,error:{message:'missing'}}).then(ok,no)}};return q},
 rpc(fn,a){window.__rpc=(window.__rpc||[]).concat([a]);const r=(window.__likes||[]).find(x=>x.slug===a.p_slug)||{so:0};r.so=Math.max(0,r.so+a.p_cong);return Promise.resolve({data:r.so,error:null})}}}};`;
const URL = `http://localhost:${PORT}/#bai-cach-don-dung-luong-macbook`;
let failed = 0; const check = (name, ok, got) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : '  got: ' + JSON.stringify(got)}`); if (!ok) failed++; };

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const b = await chromium.launch(), errs = [];
  async function open(online, setup) {
    const p = await (await b.newContext()).newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.route('**/config.js', r => r.fulfill({ contentType:'text/javascript', body: online ? 'window.DUYEN_SB={url:"https://x.supabase.co",key:"k"}' : 'window.DUYEN_SB={url:"",key:""}' }));
    await p.route('**/supabase.js', r => r.fulfill({ contentType:'text/javascript', body: online ? FAKE : '' }));
    if (setup) await p.addInitScript(setup);
    await p.goto(URL); await p.waitForTimeout(1200); return p;
  }
  async function send(p, name, text, pub) { await p.click('#b-nhan'); await p.fill('#ten-ban', name); await p.fill('#loi-nhan', text);
    if (pub) await p.click('.ghim'); await p.click('#form button[type=submit]'); await p.waitForTimeout(1000); }

  let p = await open(false);
  const all = await p.evaluate(() => BOOKS.map(y => (buildBook(y), flow.innerText)).join(' '));
  check('no template placeholders in any book', !/\[(LỜI|ẢNH)/.test(all), all.match(/\[[^\]]+\]/));
  check('no raw [text](link) markup left in any book', !/\]\(https?:/.test(all), all.match(/.{20}\]\(https?:.{20}/));
  const media = await p.evaluate(() => { const b = POSTS.find(x => x.s === 'cach-don-dung-luong-macbook'); buildBook(bookOf(b));
    const v = document.querySelector('#p-cach-don-dung-luong-macbook [data-yt]'); const out = { yt: v && v.dataset.yt }; v && v.click();
    const f = document.querySelector('#p-cach-don-dung-luong-macbook iframe'); out.ifr = f && f.src;
    const n = POSTS.find(x => x.s === 'cach-nha-ngheo-hoc-tieng-nhat'); buildBook(bookOf(n));
    out.a = [...document.querySelectorAll('#p-cach-nha-ngheo-hoc-tieng-nhat a.lien-ket')].map(a => a.textContent + '|' + a.target); return out; });
  check('youtube link becomes a click-to-play video', media.yt === 'wee9U_bLc_4' && /youtube-nocookie\.com\/embed\/wee9U_bLc_4/.test(media.ifr), media);
  check('links in posts are clickable and open a new tab', media.a.includes('đây|_blank') && media.a.includes('https://nyaa.land/|_blank'), media.a);
  await p.evaluate(() => openBook(bookOf(POSTS[0]), POSTS[0].s)); await p.waitForTimeout(300);
  check('reading log loads from read.js', await p.evaluate(() => READ.length > 0 && (buildBook('doc-sach'), !!document.getElementById('p-so-doc'))));
  await p.evaluate(() => openBook(bookOf(POSTS[0]), POSTS[0].s)); await p.waitForTimeout(300);
  const meta = await p.evaluate(() => ['description', 'og:title', 'og:image', 'twitter:card'].every(n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)));
  check('share meta tags present', meta);
  check('tab title shows the post', (await p.title()).startsWith(await p.evaluate(() => POSTS[0].t)), await p.title());
  check('bottom bar has share for the post being read', await p.evaluate(() => !document.getElementById('b-chia').hidden));
  check('like button hidden without Supabase', await p.evaluate(() => document.getElementById('b-thich').hidden));
  await p.click('#b-chia'); await p.waitForTimeout(200);
  check('share button reacts', await p.evaluate(() => document.getElementById('b-chia').classList.contains('xong') && !!document.getElementById('bao').textContent), await p.textContent('#bao'));
  for (const f of ['favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'og.jpg']) check(`${f} served`, (await p.request.get(`http://localhost:${PORT}/${f}`)).ok());
  await send(p, 'Mai', 'hello');
  check('offline form says it was not sent', /chưa gửi/.test(await p.textContent('#form-msg')), await p.textContent('#form-msg'));

  p = await open(true);
  await send(p, 'Mai', 'hello', true);
  const ins = await p.evaluate(() => window.__ins);
  check('public note inserted with only allowed columns', JSON.stringify(ins) === JSON.stringify([{ slug:'cach-don-dung-luong-macbook', ten:'Mai', loi:'hello', cong_khai:true }]), ins);
  check('send confirms on the button', /chờ Duyên duyệt ✓/.test(await p.textContent('#b-nhan')), await p.textContent('#b-nhan'));
  check('own note shows as waiting', /chờ Duyên duyệt/.test(await p.textContent('#giay')), await p.textContent('#giay'));
  await send(p, 'Mai', 'again');
  check('30s cooldown blocks a second send', (await p.evaluate(() => window.__ins.length)) === 1);
  check('name is remembered for next time', (await p.evaluate(() => localStorage.getItem('duyen-ten'))) === '"Mai"');
  const mine = await p.evaluate(() => localStorage.getItem('duyen-nhan-cua-toi'));

  p = await open(true, `localStorage.setItem('duyen-nhan-cua-toi', ${JSON.stringify(mine)}); window.__rows=[{slug:'cach-don-dung-luong-macbook',ten:'Mai',loi:'hello'}];`);
  check('approved note shows once', (await p.textContent('#b-an')) === 'Ẩn lời nhắn (1)', await p.textContent('#b-an'));
  check('local waiting copy cleared after approval', (await p.evaluate(() => localStorage.getItem('duyen-nhan-cua-toi'))) === '{}');

  p = await open(true, `window.__rows=[{slug:'cach-don-dung-luong-macbook',ten:'Mai',loi:'hay quá',tra_loi:'<b>cảm ơn</b> nha'}];`);
  const rep = await p.evaluate(() => { const t = document.querySelector('#giay .tl-duyen'); return t && [t.textContent, t.querySelector('b') === null]; });
  check("Duyên's reply shows under the note, escaped", rep && rep[0] === 'Duyên: <b>cảm ơn</b> nha' && rep[1], rep);

  p = await open(true, `window.__likes=[{slug:'cach-don-dung-luong-macbook',so:3}]`);
  const like = () => p.evaluate(() => { const b = document.getElementById('b-thich'); return [b.hidden, b.getAttribute('aria-pressed'), b.querySelector('.so-thich').textContent]; });
  check('like count shows from Supabase', JSON.stringify(await like()) === '[false,"false","3"]', await like());
  await p.evaluate(() => document.getElementById('b-thich').click()); await p.waitForTimeout(200);
  check('like adds one', JSON.stringify(await like()) === '[false,"true","4"]', await like());
  await p.evaluate(() => document.getElementById('b-thich').click()); await p.waitForTimeout(200);
  check('unlike removes it', JSON.stringify(await like()) === '[false,"false","3"]' && JSON.stringify(await p.evaluate(() => window.__rpc.map(a => a.p_cong))) === '[1,-1]', await like());

  p = await open(true); await send(p, '', 'không ký tên');
  check('name is optional (sent as null)', JSON.stringify(await p.evaluate(() => window.__ins)) === JSON.stringify([{ slug:'cach-don-dung-luong-macbook', ten:null, loi:'không ký tên', cong_khai:false }]), await p.evaluate(() => window.__ins));
  await p.waitForTimeout(800); check('note flies away after sending', await p.evaluate(() => document.getElementById('form').hidden));

  p = await open(true); await p.evaluate(() => document.getElementById('web').value = 'http://x');
  await send(p, 'bot', 'spam');
  check('honeypot blocks bots', (await p.evaluate(() => (window.__ins || []).length)) === 0);

  p = await open(true);
  const desk = await p.evaluate(async () => { location.hash = '#nuoc'; await new Promise(r => setTimeout(r, 500));
    const h = [...document.querySelectorAll('#hoa .hoa')], d = document.getElementById('doi'), L = [document.body.dataset.light];
    d.click(); L.push(document.body.dataset.light); d.click(); L.push(document.body.dataset.light);
    return { n: h.length, shown: h.filter(a => getComputedStyle(a.querySelector('.nhan')).display !== 'none').length, L, size: d.offsetWidth }; });
  check('desktop: no post titles on the pond either', desk.n > 0 && desk.shown === 0, desk);
  check('light toggle: day and afternoon only, small button', !desk.L.includes('toi') && desk.L[0] === desk.L[2] && desk.L[0] !== desk.L[1] && desk.size <= 32, desk);

  // phones: scattered pads with no titles (explore by tapping); book is a straight page you scroll, no page flip
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' }), m = await ctx.newPage();
    m.on('pageerror', e => errs.push(e.message));
    await m.route('**/supabase.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
    await m.goto(`http://localhost:${PORT}/`); await m.waitForTimeout(1000);
    const home = await m.evaluate(() => { const h = [...document.querySelectorAll('#hoa .hoa')];
      return { shown: h.filter(a => getComputedStyle(a.querySelector('.nhan')).display !== 'none').length, labelled: h.every(a => a.getAttribute('aria-label')), xs: new Set(h.map(a => a.style.left)).size }; });
    check('phone: no post titles on the pond', home.shown === 0, home);
    check('phone: pads still announce their post', home.labelled);
    check('phone: pads are scattered, not a column', home.xs >= 4, home);

    await m.goto(`http://localhost:${PORT}/#sach-nk-2024`); await m.waitForTimeout(1200);
    const bk = await m.evaluate(() => ({ tilt: getComputedStyle(book).transform, pages: B.pages, corners: getComputedStyle(document.querySelector('#g-sau')).display, pager: getComputedStyle(document.querySelector('#so-trang')).display, back: !!document.querySelector('.ve') }));
    check('phone: book page is straight', /^matrix\(1, 0, 0, 1,/.test(bk.tilt), bk.tilt);
    check('phone: book turns pages (tap zones present)', bk.pages > 3 && bk.corners !== 'none', bk);
    check('phone: no page counter, no back link', bk.pager === 'none' && !bk.back, bk);
    const box = await m.evaluate(() => { const r = document.querySelector('#book .trang').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await m.touchscreen.tap(box[0], box[1]); await m.waitForTimeout(350);
    check('phone: tapping the middle shows the reading bar', await m.evaluate(() => book.classList.contains('chrome') && getComputedStyle(document.querySelector('.thanh.duoi-sach')).visibility === 'visible'));
    await m.evaluate(() => { const r = document.getElementById('truot'); r.value = r.max; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); }); await m.waitForTimeout(200);
    check('phone: slider jumps to the last page', await m.evaluate(() => B.page === B.pages - 1), await m.evaluate(() => [B.page, B.pages]));
    await m.click('#nut-muc'); await m.waitForTimeout(150);
    const toc = await m.evaluate(() => ({ open: !document.getElementById('muc').hidden, items: document.querySelectorAll('#muc-ds button').length }));
    check('phone: contents panel lists the posts', toc.open && toc.items > 1, toc);
    await m.click('#muc-ds button'); await m.waitForTimeout(200);
    check('phone: picking a post jumps there and closes the panel', await m.evaluate(() => document.getElementById('muc').hidden && !book.classList.contains('chrome') && B.page < B.pages - 1));
    await ctx.close(); }

  // admin page: fake supabase with auth; window.__admin decides whether la_quan_tri() says yes
  const FAKE_QT = `(function(){let ses=null;const rows=[
   {id:1,slug:'cach-don-dung-luong-macbook',ten:'Mai',loi:'<img src=x onerror=alert(1)>chờ',cong_khai:true,da_duyet:false,tao_luc:'2026-11-20T10:00:00Z',tra_loi:null,tra_loi_luc:null},
   {id:2,slug:'cach-don-dung-luong-macbook',ten:null,loi:'đang hiện',cong_khai:true,da_duyet:true,tao_luc:'2026-11-19T10:00:00Z',tra_loi:null,tra_loi_luc:null},
   {id:3,slug:null,ten:null,loi:'thư riêng',cong_khai:false,da_duyet:false,tao_luc:'2026-11-18T10:00:00Z',tra_loi:null,tra_loi_luc:null}];
   window.__ops=[];
   window.supabase={createClient(){return{
    auth:{getSession(){return Promise.resolve({data:{session:ses}})},
     signInWithPassword(c){if(c.password!=='dung')return Promise.resolve({data:{},error:{message:'Invalid login credentials',status:400}});ses={user:{email:c.email}};return Promise.resolve({data:{session:ses},error:null})},
     signOut(){ses=null;return Promise.resolve({})}},
    rpc(fn){return Promise.resolve({data:fn==='la_quan_tri'&&!!window.__admin,error:null})},
    from(){let op='select',val=null,id=null;const q={select(){return q},order(){return q},limit(){return q},
     update(v){op='update';val=v;return q},delete(){op='delete';return q},eq(k,v){id=v;return q},
     then(ok,no){window.__ops.push([op,id,val]);let data=rows;
      if(op==='update'){const r=rows.find(x=>x.id===id);Object.assign(r,val);data=[r]}
      if(op==='delete'){const i=rows.findIndex(x=>x.id===id);data=rows.splice(i,1)}
      return Promise.resolve({data,error:null}).then(ok,no)}};return q}}}};})();`;
  async function admin(isAdmin) { const q = await (await b.newContext()).newPage(); q.on('pageerror', e => errs.push(e.message)); q.on('dialog', d => { errs.push('dialog: ' + d.message()); d.dismiss(); });
    await q.route('**/config.js', r => r.fulfill({ contentType:'text/javascript', body:'window.DUYEN_SB={url:"https://x.supabase.co",key:"k"}' }));
    await q.route('**/supabase.js', r => r.fulfill({ contentType:'text/javascript', body: FAKE_QT }));
    // the real page pins supabase-js with SRI; serve it without that so the fake loads
    await q.route('**/quan-tri.html', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace(/ integrity="[^"]+"/, '') }); });
    await q.addInitScript(`window.__admin=${isAdmin}`); await q.goto(`http://localhost:${PORT}/quan-tri.html`); await q.waitForTimeout(400); return q; }
  let q = await admin(false);
  check('admin: supabase-js pinned with SRI', /supabase-js@2\.45\.4\/dist\/umd\/supabase\.js" integrity="sha384-/.test(fs.readFileSync(path.join(ROOT, 'quan-tri.html'), 'utf8')));
  check('admin: login form first', await q.isVisible('#dang-nhap') && !(await q.isVisible('#hop')));
  check('admin: page is not indexed', await q.evaluate(() => /noindex/.test(document.querySelector('meta[name=robots]').content)));
  await q.fill('#email', 'a@b.c'); await q.fill('#mat-khau', 'sai'); await q.click('#dang-nhap button'); await q.waitForTimeout(200);
  check('admin: wrong password is refused', /Sai/.test(await q.textContent('#bao-dn')) && !(await q.isVisible('#hop')));
  await q.fill('#mat-khau', 'dung'); await q.click('#dang-nhap button'); await q.waitForTimeout(200);
  check('admin: a non-admin account is turned away', /không phải/.test(await q.textContent('#bao-dn')) && !(await q.isVisible('#hop')));
  q = await admin(true);
  await q.fill('#email', 'a@b.c'); await q.fill('#mat-khau', 'dung'); await q.click('#dang-nhap button'); await q.waitForTimeout(300);
  check('admin: waiting notes listed, text escaped', await q.isVisible('#hop') && (await q.$$('#ds .the-qt')).length === 1 && !(await q.$('#ds img')) && /chờ/.test(await q.textContent('#ds')), await q.textContent('#ds'));
  check('admin: tab counts', (await q.$$eval('.tab-qt .dem-qt', e => e.map(x => x.textContent).join())) === '1,1,1,3', await q.$$eval('.tab-qt .dem-qt', e => e.map(x => x.textContent).join()));
  await q.click('[data-viec=duyet]'); await q.waitForTimeout(200);
  check('admin: approve sets da_duyet and moves it out of waiting', JSON.stringify((await q.evaluate(() => __ops)).pop()) === '["update",1,{"da_duyet":true}]' && (await q.$$('#ds .the-qt')).length === 0);
  await q.click('[data-loc=hien]'); await q.click('[data-id="1"] [data-viec=tra-loi]'); await q.fill('#tl-1', 'cảm ơn nha'); await q.click('[data-id="1"] [data-viec=luu-tl]'); await q.waitForTimeout(200);
  const op = (await q.evaluate(() => __ops)).pop();
  check('admin: reply is saved', op[0] === 'update' && op[1] === 1 && op[2].tra_loi === 'cảm ơn nha' && !!op[2].tra_loi_luc && /cảm ơn nha/.test(await q.textContent('[data-id="1"] .tl-qt')), op);
  await q.click('[data-id="2"] [data-viec=an]'); await q.waitForTimeout(200);
  check('admin: hide clears da_duyet', JSON.stringify((await q.evaluate(() => __ops)).pop()) === '["update",2,{"da_duyet":false}]');
  await q.click('[data-loc=rieng]'); await q.click('[data-id="3"] [data-viec=xoa]'); await q.waitForTimeout(100);
  check('admin: delete asks for a second click', (await q.evaluate(() => __ops)).pop()[0] !== 'delete' && /Chắc chưa/.test(await q.textContent('[data-id="3"]')));
  await q.click('[data-id="3"] [data-viec=xoa]'); await q.waitForTimeout(200);
  check('admin: second click deletes', JSON.stringify((await q.evaluate(() => __ops)).pop()) === '["delete",3,null]' && !(await q.$('[data-id="3"]')));

  check('no page errors', errs.length === 0, errs);
  await b.close(); server.close();
  console.log(failed ? `\n${failed} failed` : '\nall passed'); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
