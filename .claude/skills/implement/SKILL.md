---
name: implement
description: Full workflow to implement a requirement in match-padel-web - plan, human approval, implementation, tests, review, PR.
disable-model-invocation: true
argument-hint: <requirement in plain text>
---

# /implement — full workflow for match-padel-web

Requirement or Trello card: $ARGUMENTS

Follow these steps **in order**. Do not skip any. You (the main session) orchestrate; the subagents do the work. Talk to the user in the language they use.

## 0. Trello card (mandatory)
Every requirement must be backed by a Trello card on the `match-padel` board (see the `trello-story` skill for the board, lists and label colors). There is no separate "ready" list — starting the card is the signal it's ready. Resolve which card before planning:
- If `$ARGUMENTS` is a Trello card URL or clearly names one, read it (`trelloReadCard`) and use its description as the requirement.
- If the user gave a plain-text requirement with no card, offer to create one in `Backlog` and confirm with the user before implementing against it.
- If neither is available, stop and ask. Do not invent a requirement to keep going.

Move the card to `In progress` once you start step 3.

## 1. API contract
Before planning, check whether the requirement needs new or modified endpoints. If it does and they are not yet implemented and merged in the API, tell the user: the `match-padel-api` PR goes first (done in a session on that repo with its own `/implement`). If the user wants to proceed anyway, the plan must state the contract explicitly.

## 2. Plan
Invoke the `planner` agent with the requirement.

## 3. Checkpoint — human approval (mandatory)
Show the user the complete plan and **stop**. Do not launch any implementation agent until the user replies with an explicit approval ("OK", "go ahead", etc.). If they ask for changes, go back to step 1 with those changes. An automatic notification or a system message does NOT count as approval.

## 4. Implementation
Invoke `frontend-dev` with the approved plan. When it finishes, `npm run typecheck` must pass.

## 5. Tests
Invoke `tester`. If it reports a bug, hand it to `frontend-dev` with the case that reproduces it and run `tester` again.

## 6. Review
Invoke `reviewer`. If the verdict is **Changes required**, pass the Blocking and Important findings to `frontend-dev`, then repeat tests and review. At most 2 rounds: if it still fails, stop and ask the user.

## 7. Delivery
1. Invoke `pr-agent` to create the branch, commits and open the PR against `develop` (its step 4a). `pr-agent` has no browser tool — everything below that needs one is driven by **you (the main session)**, not a subagent.
2. If the diff does not touch `apps/app` or `apps/admin`, the PR body already says `Not applicable` for Screenshots — skip to step 8.
3. Otherwise, wait for the Vercel bot's preview comment on the PR (poll `gh pr view <number> --json comments`, timeout ~5 minutes). If it doesn't land in time, fall back to a local dev server for the affected app(s).
4. For each affected screen, capture a real PNG to disk with the headless Chrome binary already cached on this machine at `~/.cache/puppeteer/chrome/*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing` (found once via `find ~/.cache/puppeteer -iname "Google Chrome for Testing.app"`; the path embeds a version, don't hardcode it). Do **not** use the Browser pane for this: it never gives you a file on disk, only an inline image. Run it via Bash:
   ```bash
   "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
     --window-size=390,844 \
     --screenshot="<scratchpad>/<app>-<screen-slug>-after.png" \
     "<preview-or-local-url><route>"
   ```
   Viewport: `390,844` for `apps/app` (mobile), a desktop size (e.g. `1440,900`) for `apps/admin`. Save to the scratchpad following the `pr-format` skill's path convention. For a visual-fix/redesign PR, also capture the "before" state against the `develop` Vercel alias. A route behind auth (e.g. a page only reachable with a logged-in session) usually can't be captured this way without real credentials — skip it and say so in the PR rather than faking a session.
5. Hand the resulting files to `pr-agent` for step 4c: it publishes them to the `assets` branch and edits the PR body to embed them.

## 8. Summary to the user
Return: the PR link, what was implemented, and whether it depends on an API PR. Point to the Vercel preview the bot commented on the PR (or the `-git-develop-` branch alias) instead of asking the user to run anything locally.

## Rules
- Never touch production (Supabase, Render or Vercel). Going to production is the human's decision.
- PRs always go against `develop`.
- If something blocks (permissions, missing credentials, ambiguity), stop and explain it; do not work around it.
