## Task Objective
Remove the Settings page from the frontend (routes + navigation) in the `market-research-ai` app.

## Current State
- Frontend is a Vite + React Router SPA.
- Settings was accessible at `/settings` via `src/App.jsx` and linked in `src/components/Sidebar.jsx`.

## Future State
- No Settings page exists in the frontend codebase.
- No navigation item links to `/settings`.
- Build succeeds without Settings imports or route references.

## Implementation Plan
1. Remove Settings route and imports
   - [x] ~~Delete `/settings` route from router~~
   - [x] ~~Remove `Settings` import~~
2. Remove navigation entry
   - [x] ~~Remove sidebar nav item pointing to `/settings`~~
   - [x] ~~Remove unused Settings icon import~~
3. Remove the page implementation
   - [x] ~~Delete `src/pages/Settings.jsx`~~
4. Validate
   - [x] ~~Search for remaining `/settings` references~~
   - [x] ~~Run production build~~

## Updates
- [2026-01-09] Removed `/settings` route from `src/App.jsx`, removed Settings nav item from `src/components/Sidebar.jsx`, and deleted `src/pages/Settings.jsx`. Verified no remaining `/settings` references and ran `npm run build` successfully.

