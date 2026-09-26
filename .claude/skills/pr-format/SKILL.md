---
name: pr-format
description: Commit, branch and pull request format used in match-padel-web (English, conventional commits, squash to develop, merge commit to main).
---

# Commit and PR format

**Language: English** for commits, titles and descriptions.

## Branches
`feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>` in kebab-case, always from `develop`.

## Commits (conventional)
`<type>(<scope>): <imperative summary>` — types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Scope = feature or app (`matches`, `reservations`, `admin`, `ui`...). Example: `feat(reservations): add cancel button`.

## Pull requests
- Base **always `develop`**. Title in the same conventional format.
- Body: the full `.github/pull_request_template.md` (What changes / Why / Technical changes / API contract / How to test / Checklist / Related PR). Nothing left empty: "None" or "N/A".
- No screenshots: review happens through the branch's Vercel preview (say how to reach the screen).
- If it depends on a `match-padel-api` PR, link it; the API PR is merged first.

## Merge method
- PR → `develop`: **squash**.
- `develop` → `main` (production): **merge commit**. Done by the human.
