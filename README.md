# AI Integration Demo for Norway

This repository contains the planning and implementation baseline for an English-only AI workflow demo aimed at the Norwegian SMB market.

Start here:

- [docs/PRODUCT_BRIEF.md](/d:/Coding%20Apps/AI-Integration/docs/PRODUCT_BRIEF.md)
- [docs/IMPLEMENTATION_PLAN.md](/d:/Coding%20Apps/AI-Integration/docs/IMPLEMENTATION_PLAN.md)

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

Language policy:

- Application UI, source code, API contracts, prompts, and new documentation are in English only.
- Norwegian will be added later as the default product language after the English MVP is stable.

Local setup baseline:

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d`.
3. Install workspace dependencies with `npm install`.
4. Initialize the database with `npm run db:setup`.
5. Run both services with `npm run dev`.

Optional:

- Run only the API with `npm run dev:api`.
- Run only the web app with `npm run dev:web`.

Frontend note:

- `API_BASE_URL` controls which backend the Next.js app reads from.
- `NEXT_PUBLIC_API_BASE_URL` controls which backend the browser upload form uses.
- The default is `http://localhost:4000`.

AI processing note:

- Set `OPENAI_API_KEY` to enable live OpenAI processing.
- `OPENAI_MODEL` defaults to `gpt-5.4`.
- If no API key is set, the app uses a deterministic fallback classifier so the demo still works locally.

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
