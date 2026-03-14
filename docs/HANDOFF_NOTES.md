# Handoff Notes

## Current MVP Status

Implemented:

- inbox list
- case detail page
- attachment upload
- local file storage
- text extraction for text files and simple PDFs
- AI processing endpoint
- strict AI output contract
- local fallback processing when no OpenAI key is present
- manual review workflow
- workflow status updates
- dashboard metrics
- audit trail
- lightweight role-based authentication
- localization preparation for a future Norwegian default
- automated test baseline for API and AI contract validation

## Runtime Expectations

- Web app: `http://localhost:3000`
- API: `http://localhost:4000`
- PostgreSQL: Docker container from `docker-compose.yml`

## Main Environment Variables

- `DATABASE_URL`
- `API_PORT`
- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `AUTH_SECRET`
- `DEMO_AUTH_EMAIL`
- `DEMO_AUTH_PASSWORD`
- `DEMO_REVIEWER_EMAIL`
- `DEMO_REVIEWER_PASSWORD`
- `DEMO_VIEWER_EMAIL`
- `DEMO_VIEWER_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`

## Known Gaps

- no live Gmail or Outlook integration
- no CRM, ERP, or ticketing integration
- no OCR pipeline for complex scanned documents
- no file cleanup lifecycle for uploaded local files
- no frontend browser e2e coverage yet
- no true background job runner yet
- no full dictionary-based localization layer yet

## Recommended Next Work

1. Expand the role model only if the demo needs permissions beyond viewer, operator, reviewer, and admin.
2. Add a background job queue if processing becomes asynchronous.
3. Add browser-level e2e coverage for login plus the main processing and review flow.
4. Add live OpenAI testing with a real key and prompt tuning based on actual outputs.
5. Add dictionary-based Norwegian localization after the English MVP behavior is stable.

## Current Cost-Oriented Default

- The default live model is `gpt-5-mini`.
- The code only sends `reasoning.effort` for `gpt-5.1` models, to avoid compatibility issues with other GPT-5 variants.

## Repository Pointers

- Product definition: [PRODUCT_BRIEF.md](/d:/Coding%20Apps/AI-Integration/docs/PRODUCT_BRIEF.md)
- Implementation baseline: [IMPLEMENTATION_PLAN.md](/d:/Coding%20Apps/AI-Integration/docs/IMPLEMENTATION_PLAN.md)
- Demo walkthrough: [DEMO_FLOW.md](/d:/Coding%20Apps/AI-Integration/docs/DEMO_FLOW.md)
