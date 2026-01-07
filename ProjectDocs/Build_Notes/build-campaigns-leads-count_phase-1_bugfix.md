# build-campaigns-leads-count — Phase 1 (bugfix)

## Task Objective
Make `/campaigns` clearly display the total lead count (e.g., 448) and avoid the impression that only “a few” leads loaded.

## Current State
- `/campaigns` loads leads and renders them in a fixed-height scroll region.
- Users only see a handful of rows at once and may assume the table is truncated.

## Future State
- `/campaigns` shows **selected / shown (filtered) / total** lead counts near the table header.
- The lead list remains scrollable, but it’s obvious that all leads are present.

## Implementation Plan
1. Update `/campaigns` lead list header UX
   - [x] ~~Add derived counts (total, shown, selectable-with-phone)~~
   - [x] ~~Display counts in the “Select Leads to Call” label~~
   - [x] ~~Add a small “scroll to view all” hint~~
2. Verify backend lead API behavior
   - [x] ~~Confirm `/api/supabase/leads` is not applying a default limit~~
3. Validate locally
   - [ ] Confirm UI shows “448 total” and the list scrolls through all leads

## Updates
- [2026-01-02] Created build notes and began investigation of `/campaigns` lead rendering.
- [2026-01-02] Implemented explicit lead counts + “scroll to view all” hint on `/campaigns` and confirmed the backend lead API does not apply a default limit.
- [2026-01-02] Removed the fixed-height inner scroll container on the `/campaigns` lead table so the full dataset (e.g., 448 rows) renders and the page scrolls normally.


