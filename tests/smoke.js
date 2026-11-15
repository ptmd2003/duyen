// Smoke test: serves the site locally, fakes Supabase, and checks the notes flow.
// Run: cd tests && npm install && npx playwright install chromium && npm test
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), PORT = 8123;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });

const FAKE = `window.supabase={createClient(){return{from(){const q={select(){return q},eq(){return q},not(){return q},order(){return q},
 limit(){return Promise.resolve({data:(window.__rows||[]),error:null})},insert(r){window.__ins=(window.__ins||[]).concat(r);return Promise.resolve({error:null})}};return q}}}};`;
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
    if (pub) await p.click('#dan-len'); await p.click('#form button[type=submit]'); await p.waitForTimeout(250); }

  let p = await open(false);
  const all = await p.evaluate(() => BOOKS.map(y => (buildBook(y), flow.innerText)).join(' '));
  check('no template placeholders in any book', !/\[(LỜI|ẢNH)/.test(all), all.match(/\[[^\]]+\]/));
  await p.evaluate(() => openBook(bookOf(POSTS[0]), POSTS[0].s)); await p.waitForTimeout(300);
  check('reading log loads from read.js', await p.evaluate(() => READ.length > 0 && (buildBook('doc-sach'), !!document.getElementById('p-so-doc'))));
  await p.evaluate(() => openBook(bookOf(POSTS[0]), POSTS[0].s)); await p.waitForTimeout(300);
  const meta = await p.evaluate(() => ['description', 'og:title', 'og:image', 'twitter:card'].every(n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)));
  check('share meta tags present', meta);
  check('tab title shows the post', (await p.title()).startsWith(await p.evaluate(() => POSTS[0].t)), await p.title());
  check('every post has a copy-link button', await p.evaluate(() => [...flow.querySelectorAll('article.bai[id^="p-"]:not(#p-so-doc)')].every(a => a.querySelector('.chep[data-link]'))));
  for (const f of ['favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'og.jpg']) check(`${f} served`, (await p.request.get(`http://localhost:${PORT}/${f}`)).ok());
  await send(p, 'Mai', 'hello');
  check('offline form says it was not sent', /chưa gửi/.test(await p.textContent('#form-msg')), await p.textContent('#form-msg'));

  p = await open(true);
  await send(p, 'Mai', 'hello', true);
  const ins = await p.evaluate(() => window.__ins);
  check('public note inserted with only allowed columns', JSON.stringify(ins) === JSON.stringify([{ slug:'cach-don-dung-luong-macbook', ten:'Mai', loi:'hello', cong_khai:true }]), ins);
  check('own note shows as waiting', /chờ Duyên duyệt/.test(await p.textContent('#giay')), await p.textContent('#giay'));
  await send(p, 'Mai', 'again');
  check('30s cooldown blocks a second send', (await p.evaluate(() => window.__ins.length)) === 1);
  const mine = await p.evaluate(() => localStorage.getItem('duyen-nhan-cua-toi'));

  p = await open(true, `localStorage.setItem('duyen-nhan-cua-toi', ${JSON.stringify(mine)}); window.__rows=[{slug:'cach-don-dung-luong-macbook',ten:'Mai',loi:'hello'}];`);
  check('approved note shows once', (await p.textContent('#b-an')) === 'Ẩn lời nhắn (1)', await p.textContent('#b-an'));
  check('local waiting copy cleared after approval', (await p.evaluate(() => localStorage.getItem('duyen-nhan-cua-toi'))) === '{}');

  p = await open(true); await p.evaluate(() => document.getElementById('web').value = 'http://x');
  await send(p, 'bot', 'spam');
  check('honeypot blocks bots', (await p.evaluate(() => (window.__ins || []).length)) === 0);

  check('no page errors', errs.length === 0, errs);
  await b.close(); server.close();
  console.log(failed ? `\n${failed} failed` : '\nall passed'); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
