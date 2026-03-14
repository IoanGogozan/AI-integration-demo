# AI Integration Demo for Norway

This repository contains the planning and implementation baseline for an English-only AI workflow demo aimed at the Norwegian SMB market.

Start here:

- [docs/PRODUCT_BRIEF.md](/d:/Coding%20Apps/AI-Integration/docs/PRODUCT_BRIEF.md)
- [docs/IMPLEMENTATION_PLAN.md](/d:/Coding%20Apps/AI-Integration/docs/IMPLEMENTATION_PLAN.md)
- [docs/DEMO_FLOW.md](/d:/Coding%20Apps/AI-Integration/docs/DEMO_FLOW.md)
- [docs/HANDOFF_NOTES.md](/d:/Coding%20Apps/AI-Integration/docs/HANDOFF_NOTES.md)
- [docs/LOCALIZATION_PREP.md](/d:/Coding%20Apps/AI-Integration/docs/LOCALIZATION_PREP.md)

Current technical baseline:

- Docker for local development
- PostgreSQL
- Node.js
- JavaScript
- Prisma for schema management and database access

Repository structure:

- `apps/web`: Next.js frontend
- `apps/api`: Express API
- `packages/shared-types`: shared contracts
- `packages/prompts`: prompt assets and schemas
- `docs`: living project documentation

Frontend pages:

- `/`: home page with quick navigation and a featured case
- `/login`: demo sign-in page
- `/help`: usage guide and demo instructions
- `/overview`: business framing for presentations
- `/inbox`: operational case list
- `/queues`: team-based operational queues for routed cases
- `/results`: processed AI outputs
- `/dashboard`: aggregate workflow metrics

Language policy:

- Application UI, source code, API contracts, prompts, and new documentation are in English only.
- Norwegian will be added later as the default product language after the English MVP is stable.

Local setup baseline:

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d`.
3. Install workspace dependencies with `npm install`.
4. Initialize the database with `npm run db:setup`.
5. Run both services with `npm run dev`.
6. Run automated checks with `npm test`.

Optional:

- Run only the API with `npm run dev:api`.
- Run only the web app with `npm run dev:web`.
- Run the test watcher with `npm run test:watch`.

Frontend note:

- `API_BASE_URL` controls which backend the Next.js app reads from.
- `NEXT_PUBLIC_API_BASE_URL` controls which backend the browser upload form uses.
- The default is `http://localhost:4000`.
- `WEB_ORIGIN` should match the frontend origin when cookie-based auth is enabled.

Authentication note:

- The demo uses a backend session stored in an HttpOnly cookie.
- Shared auth/token logic now lives in `packages/shared-auth` to reduce drift between API and web.
- Set `AUTH_SECRET` in `.env` so the backend and Next.js server can verify the session cookie.
- `ENFORCE_API_AUTH=true` is the recommended demo setting so role-based access is enforced in both the UI and API.
- `ENFORCE_API_AUTH=false` is still acceptable for local development if you only want frontend-gated flows.
- Default demo roles are:
- `demo@norvix.ai` / `demo1234` as `operator`
- `reviewer@norvix.ai` / `review1234` as `reviewer`
- `viewer@norvix.ai` / `view1234` as `viewer`
- `admin@norvix.ai` / `admin1234` as `admin`
- `operator`, `reviewer`, and `admin` can upload attachments and process cases.
- Only `reviewer` and `admin` can edit review fields or change final case status.
- You can override the per-role defaults with the `DEMO_AUTH_*` variables or provide `DEMO_AUTH_USERS_JSON`.
- Log in at `/login` before using the protected pages.

AI processing note:

- Set `OPENAI_API_KEY` to enable live OpenAI processing.
- `OPENAI_MODEL` defaults to `gpt-5-mini`.
- If no API key is set, the app uses a deterministic fallback classifier so the demo still works locally.
- If OpenAI returns invalid structured output, the app now records an audit event and falls back to the deterministic classifier.

Workflow demo note:

- AI processing now applies a real team assignment (`assignedTeam`, `assignedAt`, `assignmentSource`).
- Processed cases include evidence snippets that explain the summary and route decision.
- Approved and completed cases cannot be reprocessed until they are moved back to `needs_review`.
- The case detail page includes a workflow record and simulated business actions such as internal task creation and queue handoff.
- The `Queues` page is the strongest view for demonstrating downstream routing and team ownership.

Attachment support note:

- Current extraction is designed for text-based attachments, simple PDFs, and structured intake documents.
- Do not position the current demo as OCR-heavy, image-first, or full Office document automation yet.

Seed dataset note:

- `npm run db:setup` loads 12 seeded demo emails with multiple business scenarios.
- The seed data is designed for sales, support, invoice, contract, complaint, and general admin walkthroughs.
- The seed also includes multiple ready-made AI results across different statuses so the `Results`, `Dashboard`, and role-based review flow are useful immediately after setup.

If port `5432` is already in use on your machine, start PostgreSQL with a different host port, for example:

```powershell
$env:POSTGRES_PORT='55432'
docker compose up -d
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:55432/ai_integration_demo'
npm run db:setup
```

Current backend endpoints:

- `GET /health`
- `GET /health/db`
- `GET /auth/config`
- `GET /auth/session`
- `GET /emails`
- `GET /emails/:id`
- `GET /dashboard/stats`
- `POST /emails/:id/attachments`
- `POST /emails/:id/process`
- `POST /emails/:id/actions`
- `PATCH /emails/:id/review`
- `PATCH /emails/:id/status`
- `PATCH /emails/:id/assignment`

Recommended demo flow:

1. Start on the home page or help page.
2. Open the inbox and choose a seeded case.
3. Review the email and attachment text.
4. Upload an extra file if needed.
5. Process the case with AI.
6. Show the routing decision, evidence snippets, and workflow record.
7. Edit the result in manual review.
8. Record a business action or open the `Queues` page to show team handoff.
9. Approve or complete the case.
10. Open the results page or dashboard to show business output and operational visibility.
