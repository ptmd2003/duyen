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
- [X] Spine text at 360px: fine at 390px+ (shelf scales to 84%); untitled diary spines now show their year tag on touch

B. Home + shelf ✅

- [X] Home on phones: smaller pads in a measured column under the greeting; titles beside pads, no box, soft glow (cream at night)
- [X] Phone titles fade after ~5s; touching the water near a pad shows its title again; tapping a pad opens the post
- [X] Greeting wraps clear of the willow on phones
- [X] Shelf: header gets a frosted background once scrolled; "còn sách ở dưới nữa ↓" hint; plant hangs over the frame, not the first spine

C. Book on phones ✅ (kept the book, as Duyên asked: no scroll mode)

- [X] Spine strip on the cover, page-edge stack on the right that thins as you read, stronger gutter shadow
- [X] Folded page corners on touch screens; next-page corner pulses twice when the book opens
- [X] Smaller type on phones: body 15px, post titles ~26px, home heading 36px; long post 15 → 11 pages
- [ ] **Owner:** check body text spacing on a real iPhone/Android (looked uneven in headless Chrome)

D. Extras from Duyên's feedback ✅

- [X] "chép link bài này" → share button (phone share sheet, else copy link)
- [X] Like button with count (Supabase `luot_thich` + `thich()` function, 300 clicks / 10 min site-wide cap); hidden until the SQL is run
- [X] **Owner:** run the new "Lượt thích" part of `supabase.sql` in Supabase → SQL Editor
- [X] Opening leaf curtain parts like silk: wavy moving seam, bottom trails, strands near the seam swing aside, soft edges

E. Duyên's direction: let visitors explore (replaces parts of B and C on phones) ✅

- [X] Home on phones: back to scattered pads (desktop-style), **no post titles at all**; pads keep an `aria-label` for screen readers
- [X] Book on phones: straight page (no tilt), one tall page you scroll, no page-flip effect/corners; counter shows "bài 2 / 5"; page-edge stack follows scroll
- [X] Desktop unchanged: tilted two-page spread with page flip, hover titles on the pond
- [X] Removed the phone-only hints added earlier: "còn sách ở dưới nữa ↓" pill on the shelf and the year tag on untitled diary spines

F. "Để lại lời nhắn" as a paper note ✅

- [X] Form is one lined paper note in handwriting: write first, optional "— ký tên" (blank = "một người bạn")
- [X] One pin toggle "dán lên trang" (off = only Duyên reads) replaces the two radio options
- [X] Round send button + Ctrl/⌘+Enter; the note flies away, the button confirms ("Đã gửi cho Duyên ✓" / "Đã dán, chờ Duyên duyệt ✓")
- [X] Name remembered on this device for next time

G. Reader like Kindle / Apple Books ✅

- [X] Nav "bài viết" → "bookshelf"; removed the "← Kệ sách" back link (nav does the same)
- [X] Phone book flips pages again (straight, no tilt), more side margin, taller page; tap left/right third to turn, swipe still works
- [X] Tap the middle of the page → reading bar: contents icon + book name + notes toggle on top, post name + page slider + "2 / 13" at the bottom
- [X] Contents panel lists the book's posts with page numbers, current one highlighted; tap to jump
- [X] Phone: page counter removed (slider replaces it); notes toggle lives in the reading bar
- [X] Like + share moved to the bottom bar next to "Để lại lời nhắn" (desktop + phone), acting on the post being read
- [X] Dropped the pulsing page-corner hint on phones

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
