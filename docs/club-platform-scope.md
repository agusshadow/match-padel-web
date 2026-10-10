# Club and platform apps — scope

Status: agreed on 10/10/2026 in a product discussion with the owner. This is the
target; nothing here is built yet unless it says so. Trello cards `[Admin F0]` to
`[Admin F5]` (and the go-live prerequisite) track the work.

Principle: **everything a player sees is administered through a panel**, not loaded
by SQL. Clubs administer their own club; the platform team administers what is
global to the app.

## 1. The three apps

| App | Who uses it | Where it lives |
|---|---|---|
| Players (`apps/app`) | players | exists |
| Club panel | club owner, administrators, reception | today's `apps/admin`, rebuilt |
| Platform panel | superadmin and reviewers | new app in the same monorepo |

All three talk to the same API, with different permissions. The club panel and the
platform panel stop reading and writing Supabase tables directly: they go through
the API, which checks permissions per club and per role on the server.

## 2. Roles

**Platform** (platform panel)
- `superadmin`: sees and can do everything.
- `reviewer`: only reviews club applications. No commissions, catalogs or approved clubs.

**Club** (club panel; per club, through `club_staff`)
- `owner`: everything in their clubs, including the Mercado Pago account and the team.
- `administrator`: courts, schedules, prices, calendar, reservations, tournaments, team (not the Mercado Pago account).
- `reception`: sees, moves and cancels existing reservations. Does not create reservations or change prices.

A player keeps `users.role = player`. Club membership comes from `club_staff`; platform
roles come from their own table. One person can be an owner of several clubs.

## 3. Club lifecycle

1. The owner registers by themselves in the club panel (no invitation) and starts an application.
2. Onboarding (long form, saved as a draft): club data, location, contact, courts, schedules, prices, documentation (tax id or company name, supporting documents, uploaded as files).
3. The application goes to the platform inbox. A reviewer or the superadmin can **approve**, **reject with a reason** or **ask for corrections**; the owner fixes and resubmits, with full history.
4. States: `draft`, `pending`, `changes_requested`, `approved`, `rejected`, `suspended`. Only `approved` clubs are visible to players.
5. Every state change sends the owner an email.
6. An owner can have several clubs, each with its own application and its own Mercado Pago account.

## 4. What a club administers

- **Courts**: name, surface, indoor/outdoor, active.
- **Weekly schedule** per court (opening, closing, slot length) and exceptions (holidays, closures).
- **Prices** per court by time band and day (for example morning/afternoon/night, weekday/weekend).
- **Blocks**: a date and time range on one or several courts with a reason (maintenance, classes). Blocked slots are not bookable in the players app. No recurrence for now.
- **Calendar**: a Google Calendar-style day/week view per court with reservations, ranked matches and blocks. Reservations always belong to a player of the app; there are no counter reservations for people without an account.
- **Refund policy**: hours before the start and percentage returned, within minimums set by the platform.
- **Team**: create users with the roles above.
- **Mercado Pago account**: one per club (see section 6).
- **Tournaments** (section 5).

## 5. Tournaments

Only clubs create and manage tournaments. The players app only lists, joins and follows
them; its create-tournament screen is removed.

- The club panel covers: creating, categories/limits, registrations, **fixture generation for the four existing formats** (round robin, single elimination, double elimination, americano), results and standings.
- The registration fee is paid through the app, to the club's Mercado Pago account, with the same commission as reservations.

## 6. Payments

- **Direct to the club, with a commission for the platform.** Each club links its own Mercado Pago account with OAuth (Marketplace application, Checkout Pro). Preferences for reservations, matches and tournament registrations are created with the **club's** token and carry `marketplace_fee`.
- The commission is a **percentage configurable per club**, edited by the superadmin; it is converted to an amount on each charge (the API takes an amount).
- Mercado Pago deducts its own fee from the club first; the platform fee comes out of the remainder.
- The internal currency purchase keeps going to the platform's own account (the global token stays for that).
- **Late cancellations** (under the club's window) return **part of the amount in money**, per the club's policy, from the club's account. The internal credit for late cancellations is removed.
- Requirements from Mercado Pago to keep in mind: the club's account needs **KYC level 6**; seller tokens last 180 days and the refresh token rotates on every renewal (store the new one); an expired link must be redone by the club; refunds need enough balance in the club's account and are possible up to 180 days after approval; production credentials need to be activated (industry, website, terms).
- **To confirm in sandbox or with Mercado Pago**: whether the platform fee is returned on a refund or chargeback, who bears chargebacks, limits on the fee, and whether a commercial approval is needed to operate as a marketplace in production.

## 7. Platform panel

- **Applications inbox** with review, observations and history.
- **Clubs**: state, suspend, commission per club, refund minimums.
- **Gamification catalogs**: challenges, achievements, cosmetics and their prices. Global to the app; clubs cannot create them.
- **Global parameters** and an **audit log**.

## 8. Cross-cutting

- **Per-club authorization on the server**, and isolation between clubs in the database. The staff read policies added by card #65 treat any `club_staff` as staff of every club; they must be replaced by per-club policies (`club_staff` membership) before a second club exists.
- **Audit log**: who changed what (prices, schedules, reservations, commissions, approvals).
- **Private storage** for application documents, readable only by the platform team and the owner.
- **Transactional email** through Resend (domain `matchpadel.com.ar` is verified; the API has no email module yet).
- **Production readiness** before real clubs: a paid Supabase plan (the free plan pauses inactive projects and has no point-in-time restore), backups and an alert for downtime.
- The three demo clubs seeded in production stay for now; they have no phone, email, logo or coordinates, so complete them or mark them as demo before launch.

## 9. Delivery phases

| Phase | Content | Depends on |
|---|---|---|
| F0 | Roles, membership, per-club permissions in the API, per-club isolation, audit log, structure of the two apps | none |
| F1 | Owner registration, onboarding, application with documents, review with corrections, states, emails | F0 |
| F2 | Courts, schedules, prices, blocks, calendar, reservations and ranked matches management, club team | F0, F1 |
| F3 | Mercado Pago per club, commission, webhooks per seller, refund policy per club | F2 |
| F4 | Tournament management in the club panel and removal from the players app | F2, F3 |
| F5 | Gamification catalogs in the platform panel | F0 |
| Prerequisite | Production ready for real clubs | before the first real club |
