# Product Brief

## Document Purpose

This is the living source-of-truth document for the AI integration demo. It should be updated whenever scope, assumptions, architecture, workflows, or delivery priorities change during development.

## Working Rules

- All new documentation in this repository must be written in English.
- The application UI, source code, prompts, database naming, API contracts, and internal comments must be written in English.
- Norwegian language support will be added later and is expected to become the default product language after the English MVP is complete and stable.
- Existing planning documents may evolve during development. When they do, this document and the implementation plan must be updated to reflect the current decision.

## Project Summary

The goal is to build a demo application that shows practical AI workflow automation for small and medium-sized businesses in Norway. The demo should present a real internal business workflow, not a generic chatbot.

The product direction is:

- AI-powered email and document intake
- Structured extraction from text-heavy business inputs
- Business classification and routing
- Human review before final action
- Persistent storage and auditability

## Commercial Positioning

The demo should communicate this value clearly:

> Reduce manual work in inbox and document workflows through custom backend logic, integrations, and practical AI automation.

The demo is intended to support service businesses, B2B operations teams, administrative backoffice teams, and SMBs that handle a large volume of emails, PDFs, forms, and repetitive requests.

## Primary Demo Use Case

The first demo should be an `AI Intake Assistant`.

It must:

- receive a demo email
- support one or more attachments
- extract relevant text from the email and files
- classify the request into a business category
- extract useful structured fields
- generate a summary
- suggest the next team or workflow step
- generate an editable reply draft
- save the result in PostgreSQL
- expose the result in a simple dashboard and review workflow

## Non-Goals for MVP

- No live Gmail or Outlook integration in the first version
- No advanced OCR for difficult scanned documents
- No autonomous agents or complex tool-calling chains
- No multi-tenant production architecture
- No high-scale optimization
- No automatic outbound sending without human approval

## Technical Baseline

The initial implementation should use:

- Docker for local development
- PostgreSQL as the main database
- Node.js for backend and project tooling
- JavaScript for the application codebase
- Prisma for schema management and database access

Recommended structure:

- `apps/web` for the frontend
- `apps/api` for the backend API
- `packages/shared-types` for shared contracts
- `packages/prompts` for prompt templates and JSON schemas
- `docs` for project documentation

## Proposed MVP Feature Set

### Core Workflow

- Inbox list with seeded demo emails
- Email detail view
- Attachment upload
- Text extraction from email body and text-based attachments
- AI processing endpoint
- Structured JSON validation
- Saved AI result
- Manual review and status updates
- Dashboard with key metrics

### AI Output Contract

The AI result should include at minimum:

- `category`
- `priority`
- `summary`
- `suggested_route`
- `suggested_next_action`
- `suggested_reply`
- `confidence`
- `extracted_fields`

## Domain Categories

Suggested initial categories:

- `sales_inquiry`
- `support_request`
- `invoice_billing`
- `contract_agreement`
- `general_admin`
- `complaint`

Suggested routes:

- `sales`
- `support`
- `finance`
- `admin`
- `legal`

## Data Model Baseline

Required entities:

- `emails`
- `attachments`
- `ai_results`
- `processing_jobs`
- `audit_events`

The system must preserve traceability for every important workflow action.

## UX Principles

The UI should look like a real internal operations tool.

Key qualities:

- fast to demo in 2 to 3 minutes
- clear status visibility
- simple review flow
- visible AI confidence and editable output
- obvious business value, not just AI novelty

## Demo Dataset Requirements

The repository should eventually contain:

- at least 10 seeded demo emails
- at least 5 to 6 believable business attachments
- scenarios covering sales, support, invoice clarification, contract intake, and general admin cases

## Acceptance Outcome

The MVP is successful when a user can process multiple demo cases end-to-end locally and clearly demonstrate:

- email intake
- attachment understanding
- AI classification and extraction
- suggested action and reply draft
- persistence in PostgreSQL
- human review and audit trail
- dashboard visibility

## Change Management

Update this document when any of the following changes:

- target user or target market
- core use case
- architecture direction
- data model
- AI output contract
- implementation priorities
- language policy
- acceptance criteria

When implementation decisions conflict with older planning notes, this document becomes the current reference after it is updated.
