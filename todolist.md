# Todo list

Roadmap for the duyen site. Update this with every change (see `.claude/skills/ship-update`).

## Phase 1: Supabase + bug fixes ✅

- [X] Connect Supabase (`config.js` URL + publishable key, `supabase.sql` run on project `jrhaxqrfnnfesspkjaqt`)
- [X] Verify live rules: no self-approve, no setting `tao_luc`, private notes unreadable, duplicate rejected
- [X] Fix: own public note shown twice after approval
- [X] Fix: "Đã lưu trên máy này" shown when nothing was saved
- [X] Remove `[LỜI ĐỀ TỪ CỦA BẠN]` / `[ẢNH CỦA BẠN]` placeholders (optional `SKIN[book].de`, `post.img`/`post.alt`)
- [X] Spam: honeypot, 30s cooldown, DB trigger (20 / 10 min, no duplicates), column-level insert grant
- [X] Smoke test in `tests/smoke.js`
- [X] Project docs: `CLAUDE.md`, `senior-engineer` agent, `ship-update` skill, this file
- [X] **Owner:** delete test row `[test từ Claude, xoá được]` in Table Editor → `loi_nhan`
- [X] **Owner:** authenticate Supabase MCP (`claude /mcp` in a terminal → supabase → Authenticate)

## Phase 2: Polish ✅

- [X] `<meta name="description">`, Open Graph/Twitter tags, canonical, theme color
- [X] Social preview `og.jpg` (1200×630 screenshot of the water scene)
- [X] Favicon (`favicon.svg` + `favicon.png`) and `apple-touch-icon.png`
- [X] "chép link bài này" at the end of every post (copies `#bai-<slug>` link); tab title shows the current post
- [X] Reading log has one source: `read.js` (replaces `read.json` + inline copy)
- [X] Mobile notes: max 2 papers, clamped to 3 lines (6 on desktop), tap to expand; bottom bar fits one row
- [X] Smoke test covers all of the above (17 checks)
- [ ] **Owner:** write real epigraphs (`de` in `SKIN`) and add photos (`img` on posts) where wanted
- [ ] **Owner:** after deploy, check the preview at https://developers.facebook.com/tools/debug/ (and paste a link in Zalo/Messenger)

## Phase 2.5: Mobile UX (from the 2026-11-15 review)

A. Quick wins ✅

- [X] Light toggle `#doi`: in the header on phones (≤820px); desktop keeps it bottom-left
- [X] Sound button `#dan`: music-note icon, 44×44 tap area
- [X] Nav: "writings" → "bài viết"; book-scene flowers only along the sides, never behind header/back link/buttons
- [X] Note form: green radios (`accent-color`), button becomes "Đóng" while open (`aria-expanded`)
- [X] "GIỮ LẠI" ticket on one line (also fills page 1 better); "chép link bài này" and brand link 44px tall
- [ ] No text under 11px: shelf spine labels at 360px. Moved to the shelf item below (needs spine layout work)

B/C. Bigger

- [ ] Home: lily pads cover post titles and the tagline. Cards above pads, pads in the margins
- [ ] Book on phones: scroll-to-read mode (or visible ‹ › + first-time swipe hint); fix the empty bottom of page 1
- [ ] Shelf: fit or hint the hidden rows, smaller heading, label every spine, spine text ≥ 11px
- [ ] Check body text spacing on a real iPhone/Android (looked uneven in headless Chrome)

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
