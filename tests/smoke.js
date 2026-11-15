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

  check('no page errors', errs.length === 0, errs);
  await b.close(); server.close();
  console.log(failed ? `\n${failed} failed` : '\nall passed'); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
