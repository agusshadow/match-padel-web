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
Every requirement must be backed by a Trello card in **`Listo para tomar`** on the `match-padel` board (see the `trello-story` skill for the board, lists and label colors). Resolve which card before planning:
- If `$ARGUMENTS` is a Trello card URL or clearly names one, read it (`trelloReadCard`) and use its description as the requirement.
- If the user gave a plain-text requirement with no card, ask them for the card (or offer to create one in `Backlog` and stop there — do not implement against a backlog card, only one already in `Listo para tomar`, since that list is what signals it is ready).
- If neither is available, stop and ask. Do not invent a requirement to keep going.

Move the card to `En progreso` once you start step 3.

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
Invoke `pr-agent` to create the branch, commits and the PR against `develop`.

## 8. Summary to the user
Return: the PR link, what was implemented, how to test it in the dev preview (`https://match-padel-app-dev.vercel.app` and/or `https://match-padel-admin-dev.vercel.app`), and whether it depends on an API PR.

## Rules
- Never touch production (Supabase, Render or Vercel). Going to production is the human's decision.
- PRs always go against `develop`.
- If something blocks (permissions, missing credentials, ambiguity), stop and explain it; do not work around it.
