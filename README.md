# assets (deprecated — do not use)

This branch is **deprecated**. It was created for PR screenshots, but the mechanism it relied on — embedding an image via `raw.githubusercontent.com` pointing at this branch — never actually worked: `match-padel-web` is a private repo, and that CDN path only renders for public repos (there's no way to authenticate it). Every PR that tried this had a broken image link.

**Screenshots now live in [`agusshadow/match-padel-assets`](https://github.com/agusshadow/match-padel-assets)**, a small public repo made for exactly this (nothing sensitive in it — just UI screenshots). See its own README for the path convention. `pr-format` and `pr-agent` (in `.claude/`) were updated accordingly.

Do not add new screenshots here. This branch is kept only so the old broken links in already-merged PRs still resolve to *something* rather than a 404 on the branch itself; it will not be deleted, but it will not grow either.
