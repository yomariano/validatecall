# build-usage-endpoint-500 — Phase 1 (bugfix)

## Task Objective
Fix production `GET /api/usage/:userId` returning 500 and prevent the frontend from crashing when usage fetch fails.

## Current State
- Frontend calls `GET https://api.validatecall.com/api/usage/:userId` and receives 500.
- After the failed fetch, the app can crash with `TypeError: v is not a function`.
- `UsageContext` exposes `shouldShowSoftPaywall` / `shouldShowHardPaywall` as objects, but consumers call them as functions.
- API `routes/usage.js` does not validate Supabase env config and does not consistently handle Supabase errors.

## Future State
- `GET /api/usage/:userId` reliably returns a consistent JSON shape (free tier vs subscribed) or a clear 500 with actionable server logs.
- `UsageContext` provides paywall helpers as functions (and remains safe on errors) so the UI never crashes due to a missing function.

## Implementation Plan
1. Fix frontend usage helpers contract
   - [ ] Update `UsageContext` to expose `shouldShowSoftPaywall(type)` / `shouldShowHardPaywall(type)` as functions
   - [ ] Make `refreshUsage()` awaitable (returns the underlying fetch promise)
   - [ ] Confirm `Campaigns.jsx` / `Leads.jsx` no longer crash when usage fetch fails
2. Fix API `/api/usage` robustness
   - [ ] Validate `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` at request time and return a clear 500 if missing
   - [ ] Use `maybeSingle()` and explicitly handle `{ error }` for all Supabase calls (no silent fallthrough)
   - [ ] Ensure the endpoint always returns the same JSON shape for free tier and subscribed users
3. Validate
   - [ ] Run the app locally, hit `/api/usage/:userId`, verify non-500 responses (or clear configuration errors)

## Updates
- [2026-01-09] Created build notes and identified a frontend contract bug: `shouldShowSoftPaywall` / `shouldShowHardPaywall` are objects but are called as functions by pages.
- [2026-01-09] Updated `UsageContext` to expose `shouldShowSoftPaywall(type)` / `shouldShowHardPaywall(type)` as functions and made `refreshUsage()` awaitable to match existing call sites.
- [2026-01-09] Hardened `validatecall-api/routes/usage.js` by validating Supabase env config, using `maybeSingle()` for 0-row cases, and explicitly handling `{ error }` and query exceptions to avoid silent failures turning into 500s.


