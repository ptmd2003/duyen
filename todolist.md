# Todo list

Roadmap for the duyen site. Update this with every change (see `.claude/skills/ship-update`).

## Phase 1: Supabase + bug fixes ✅
- [x] Connect Supabase (`config.js` URL + publishable key, `supabase.sql` run on project `jrhaxqrfnnfesspkjaqt`)
- [x] Verify live rules: no self-approve, no setting `tao_luc`, private notes unreadable, duplicate rejected
- [x] Fix: own public note shown twice after approval
- [x] Fix: "Đã lưu trên máy này" shown when nothing was saved
- [x] Remove `[LỜI ĐỀ TỪ CỦA BẠN]` / `[ẢNH CỦA BẠN]` placeholders (optional `SKIN[book].de`, `post.img`/`post.alt`)
- [x] Spam: honeypot, 30s cooldown, DB trigger (20 / 10 min, no duplicates), column-level insert grant
- [x] Smoke test in `tests/smoke.js`
- [x] Project docs: `CLAUDE.md`, `senior-engineer` agent, `ship-update` skill, this file
- [ ] **Owner:** delete test row `[test từ Claude, xoá được]` in Table Editor → `loi_nhan`
- [ ] **Owner:** authenticate Supabase MCP (`claude /mcp` in a terminal → supabase → Authenticate)

## Phase 2: Polish ✅
- [x] `<meta name="description">`, Open Graph/Twitter tags, canonical, theme color
- [x] Social preview `og.jpg` (1200×630 screenshot of the water scene)
- [x] Favicon (`favicon.svg` + `favicon.png`) and `apple-touch-icon.png`
- [x] "chép link bài này" at the end of every post (copies `#bai-<slug>` link); tab title shows the current post
- [x] Reading log has one source: `read.js` (replaces `read.json` + inline copy)
- [x] Mobile notes: max 2 papers, clamped to 3 lines (6 on desktop), tap to expand; bottom bar fits one row
- [x] Smoke test covers all of the above (17 checks)
- [ ] **Owner:** write real epigraphs (`de` in `SKIN`) and add photos (`img` on posts) where wanted
- [ ] **Owner:** after deploy, check the preview at https://developers.facebook.com/tools/debug/ (and paste a link in Zalo/Messenger)

## Phase 3: Supabase does more
- [ ] Move `POSTS` and `READ` into Supabase tables (keep inline copy as offline fallback)
- [ ] Notion → Supabase sync for posts/reading log (Edge Function or script)
- [ ] Private admin page (Supabase Auth, only Duyên) to approve / hide / reply to notes
- [ ] Email notification on new note (Database Webhook → Edge Function)
- [ ] Show the inbox (`#hop-thu`) form again; its code is already there

## Later
- [ ] Re-open the garden (`#s-vuon`) with projects
- [ ] Split `index.html` into `style.css`, `app.js`, `data.js` (only if editing gets painful)
- [ ] Diary search / tag filter, RSS feed
- [ ] Per-post link previews (needs a static HTML page per post, since crawlers ignore `#bai-` hashes)
- [ ] Lighthouse pass (performance, a11y), image sizes
