---
name: ship-update
description: Ship a change to the duyen site the standard way: implement, smoke-test, update todolist.md and the README changelog, then commit. Use for any code, content, or Supabase schema change in this repo.
---

# Ship an update

Follow these steps in order. Don't skip the docs step: the README changelog and `todolist.md` are how the owner keeps track of what changed.

## 1. Before editing
- Read `todolist.md`; find (or add) the item you're working on.
- Read the relevant part of `index.html` before changing it. It's one big file; use `grep -n` to locate code.

## 2. Implement
- Keep the existing style: vanilla JS, Vietnamese identifiers and copy, `esc()` for any text going into `innerHTML`.
- Schema changes go in `supabase.sql` and must be idempotent (`if not exists`, `drop … if exists`, `create or replace`). The owner must run it in Supabase SQL Editor (or use the Supabase MCP if authenticated). Say which.

## 3. Verify
```bash
cd tests && npm install && npx playwright install chromium   # first time only
npm test
```
- All checks must pass. If you changed behavior the smoke test doesn't cover, add a check to `tests/smoke.js`.
- For Supabase changes, also verify against the live project with the publishable key (read-only where possible).

## 4. Record
- `todolist.md`: tick finished items `[x]`, add follow-ups you discovered, keep "Now / Next / Later" honest.
- `README.md` → `## Nhật ký cập nhật`: add one dated line (YYYY-MM-DD) at the top, in plain Vietnamese, describing what changed for the owner/visitors. Update other README sections if files or setup changed.

## 5. Commit
- Only when the user asked to commit. Stage specific files (not `git add -A`), never commit `node_modules/` or secrets.
- Message: short imperative summary line, blank line, bullet list of changes.
- Pushing to `main` deploys the live site, so confirm with the user before `git push`.
