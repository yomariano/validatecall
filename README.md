# ValidateCall

React/Vite frontend for lead import, sourced web research, voice campaigns, and outreach workflows.
The API owns PostgreSQL access, Google sign-in, sessions, and all provider secrets.

## Local setup

Start the sibling `validatecall-api` project first; its README covers PostgreSQL and Google OAuth.

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to the API URL. Google redirects back to the API's configured `FRONTEND_URL`.
No Supabase configuration or browser-side private provider keys are needed.

```sh
npm run lint
npm run build
```

Pages and the browser voice SDK load on demand. The production host must serve `index.html`
for frontend routes such as `/dashboard`. Keep frontend and API on the same site with HTTPS
for the HttpOnly session cookie (e.g. `app.validatecall.com` and `api.validatecall.com`).

## Research

Lead search and industry research use the API's Brave Search + DeepInfra integration. Results
include source links; contact details without supporting search evidence are left empty.
Search snippets can be incomplete or outdated, so review sources before using a contact.
CSV and pasted-data imports work without research provider keys.

Google sign-in uses only openid/email/profile. It does not read Gmail or request mailbox access.
