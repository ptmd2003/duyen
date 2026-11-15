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

## Phase 2: Polish (next)
- [ ] `<meta name="description">`, Open Graph/Twitter tags, social preview image
- [ ] Favicon + `apple-touch-icon`
- [ ] Per-post share: update `og` info / copy-link button for `#bai-<slug>` links
- [ ] One source for the reading log (load `read.json` or drop it; today it's duplicated in `index.html`)
- [ ] Add real epigraphs (`de`) for books and photos (`img`) for posts that should have them
- [ ] Check mobile layout of note papers (`#giay`) with 4 long notes

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
- [ ] Lighthouse pass (performance, a11y), image sizes
