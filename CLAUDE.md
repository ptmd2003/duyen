# CLAUDE.md: project memory for duyen

Personal website of Duyên ("hôm nay mình viết"). Live at https://ptmd2003.github.io/duyen/ (GitHub Pages, deploys on push to `main`, no build step).

## Layout
- `index.html`: the whole site: CSS (top `<style>`), markup, and one `<script>` with all data and logic.
  - Data constants near the top of the script: `POSTS` (diary posts), `READ` (reading log, loaded from `read.js` as `window.READ`), `CATS`, `VIEC` (garden projects), `CAM`, `SKIN` (book covers).
  - Scenes: `#s-nuoc` (water), `#s-ke-sach` (bookshelf), `#s-sach` (open book), `#s-vuon` (garden, currently closed). Routing is hash-based in `route()`: `#ke-sach`, `#sach-<book>`, `#bai-<slug>`.
- `read.js`: the reading log. The only place to edit books.
- `og.jpg` (1200×630 share preview, a screenshot of the water scene), `favicon.svg/png`, `apple-touch-icon.png`. Regenerate `og.jpg` if the home scene changes a lot.
- `config.js`: Supabase URL + **publishable** key (safe to commit). Never put a `service_role`/secret key in the repo.
- `supabase.sql`: schema + RLS for `loi_nhan` (guestbook notes and inbox). Idempotent; re-run in SQL Editor after edits.
- `tests/smoke.js`: Playwright smoke test with a fake Supabase. Run before every commit.
- `todolist.md`: the roadmap and status. Keep it in sync with what was actually done.
- `README.md`: owner-facing docs + changelog (Vietnamese). Every user-visible change gets a changelog line.

## Supabase
- Project ref `jrhaxqrfnnfesspkjaqt`. MCP server configured in `.mcp.json` (needs `/mcp` → Authenticate in a terminal).
- `loi_nhan` rules: anon may insert only `slug, ten, loi, cong_khai`; anon may read only rows with `cong_khai and da_duyet`. Trigger `chan_spam` caps 20 inserts / 10 min site-wide and rejects duplicate text within 1 day.
- Duyên approves notes in Table Editor → `loi_nhan` → `da_duyet = true`.
- `luot_thich` (likes): anon can only `select`; writes go through `thich(p_slug, p_cong ±1)` (security definer, slug regex, 300 clicks/10 min via private `luot_bam` log). Client hides the like button if the table is missing.
- Don't create test rows on the live DB unless needed; if you do, say so and tell the owner to delete them.

## Conventions
- UI copy and identifiers are Vietnamese (`loi_nhan`, `ten`, `da_duyet`, `gui`, `doc`…). Keep that style; write copy in Duyên's casual voice, no AI-sounding phrasing.
- Vanilla JS, no framework, no bundler. Helpers: `$`, `$$`, `esc` (always escape user/post text into HTML), `store` (try/catch localStorage), `rng(seed)` (deterministic decoration).
- Respect `prefers-reduced-motion` (`still`).
- Pin CDN versions (supabase-js is `@2.45.4`).

## Gotchas
- CSS class names collide easily in this one big file (e.g. `.so`, `.dem`, `.thich` were already taken). `grep` a class name before using it; prefix new ones (`nut-thich`, `so-thich`).
- Phones get their own layouts. Home: post titles on the pond are hidden on every screen size on purpose (Duyên wants visitors to explore; don't add labels back); phones (<760px) scatter pads at `SPOTS_M`. Book (<820px, `B.n === 1`): straight single page that slides (`slideTo()`, no paper flip; desktop keeps the 3D leaf in `turnTo()`); tap side thirds (`.goc`) to turn, tap the middle for the reading bar (`thanhDoc()`, `.book.chrome`: contents `#nut-muc`/`#muc`, slider `#truot`, notes toggle `#an-nhan`). Like/share live in the bottom bar (`#b-thich`, `#b-chia`) and follow `currentPost()` via `paintLikes()`. The light toggle `#doi` moves into the header. Check both 390px and 360px.
- Light modes are only `sang`/`chieu` (`LIGHTS`); old `toi` (night) CSS is dead code.
- The intro curtain (`#rem`) is driven by rAF in JS (clip-path wave + mask), not CSS transitions. Screenshots can't capture it reliably; record a video (Playwright `recordVideo`) and pull frames with Playwright's ffmpeg.

## Workflow
Use the `ship-update` skill for any change: edit → `cd tests && npm test` → update `todolist.md` + README changelog → commit. Use the `senior-engineer` agent for reviews and planning.
