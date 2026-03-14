# AI Integration Demo for Norway

This repository contains the planning and implementation baseline for an English-only AI workflow demo aimed at the Norwegian SMB market.

Start here:

- [docs/PRODUCT_BRIEF.md](/d:/Coding%20Apps/AI-Integration/docs/PRODUCT_BRIEF.md)
- [docs/IMPLEMENTATION_PLAN.md](/d:/Coding%20Apps/AI-Integration/docs/IMPLEMENTATION_PLAN.md)
- [docs/DEMO_FLOW.md](/d:/Coding%20Apps/AI-Integration/docs/DEMO_FLOW.md)
- [docs/HANDOFF_NOTES.md](/d:/Coding%20Apps/AI-Integration/docs/HANDOFF_NOTES.md)

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
- `/help`: usage guide and demo instructions
- `/overview`: business framing for presentations
- `/inbox`: operational case list
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

AI processing note:

- Set `OPENAI_API_KEY` to enable live OpenAI processing.
- `OPENAI_MODEL` defaults to `gpt-5-mini`.
- If no API key is set, the app uses a deterministic fallback classifier so the demo still works locally.

Seed dataset note:

- `npm run db:setup` loads 12 seeded demo emails with multiple business scenarios.
- The seed data is designed for sales, support, invoice, contract, complaint, and general admin walkthroughs.
- The seed also includes 4 ready-made AI results so the `Results` page is useful immediately after setup.

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
- `GET /emails`
- `GET /emails/:id`
- `GET /dashboard/stats`
- `POST /emails/:id/attachments`
- `POST /emails/:id/process`
- `PATCH /emails/:id/review`
- `PATCH /emails/:id/status`

Recommended demo flow:

1. Start on the home page or help page.
2. Open the inbox and choose a seeded case.
3. Review the email and attachment text.
4. Upload an extra file if needed.
5. Process the case with AI.
6. Edit the result in manual review.
7. Approve or complete the case.
8. Open the results page or dashboard to show business output and operational visibility.
