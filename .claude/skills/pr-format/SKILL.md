---
name: pr-format
description: Commit, branch and pull request format used in match-padel-web (English, conventional commits, squash to develop, merge commit to main).
---

# Commit and PR format

**Language: English** for commits, titles and descriptions.

## Branches
`feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>` in kebab-case, always from `develop`. Releases use `release/vX.Y.Z`, cut from `develop`. Never commit or push to `main` or `develop` directly.

## Commits (conventional)
`<type>(<scope>): <imperative summary>` — types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Scope = feature or app (`matches`, `reservations`, `admin`, `ui`...). Example: `feat(reservations): add cancel button`.

## Pull requests
- Base **always `develop`**. Title in the same conventional format.
- Body: the full `.github/pull_request_template.md` (What changes / Why / Technical changes / API contract / How to test / Screenshots / Checklist / Related PR). Nothing left empty: "None" or "N/A".
- If it depends on a `match-padel-api` PR, link it; the API PR is merged first.
- Add a **Related Trello card** line with the card's URL (see the `trello-story` skill). Every PR that came from `/implement` has one.

## Screenshots
Required whenever the diff touches `apps/app` or `apps/admin` — any file under either app, not only components. Not required for backend-only, docs-only or config-only PRs (`Not applicable` in that case).

- Images never live in the PR branch, and never touch `develop`/`main` history: they are pushed straight to the `assets` orphan branch (created once, never merged, never opened as a PR — see its own `README.md`).
- Path convention: `pr-<number>/<app>-<screen-slug>-{before|after}.png`. `<app>` is `app` or `admin`; `<screen-slug>` is the kebab-case route/feature name. `-before` only for visual-fix/redesign PRs where the prior state matters (captured against the `develop` Vercel alias, e.g. `match-padel-app-git-develop-....vercel.app`), otherwise only `-after`.
- Embedded in the PR body as `![<app> <screen-slug> <before|after>](https://raw.githubusercontent.com/<owner>/<repo>/assets/pr-<number>/<file>)` so they render inline on GitHub.
- Captured against the PR's own Vercel preview (from the bot's comment) once it's ready, or a local server as a fallback, using the headless Chrome binary cached on this machine (never the Browser pane — it can't write a file to disk). See `.claude/skills/implement/SKILL.md` step 7 for the full capture-and-publish sequence and who does each part (the orchestrating session takes the screenshot; `pr-agent` only pushes files and edits the PR body).

## Merge method (done by the human, never by an agent)
| PR | Base | Method |
|---|---|---|
| Feature / fix / chore branch | `develop` | **Squash** |
| `release/vX.Y.Z` (all pending commits + one `chore: version bump` commit) | `main` | **Merge commit** |
| `main` synced back (`chore: sync develop with main (vX.Y.Z)`) | `develop` | **Merge commit** |

Never use rebase merge. Never delete `main` or `develop` (the sync PR's head branch is `main`). Release title format: `release: vX.Y.Z`. The bump commit subject is exactly `chore: version bump`, with `Bump version from A to B.` in the body. See the `release` skill.

The `assets` branch is excluded from this table entirely: it is never merged anywhere, by anyone.
