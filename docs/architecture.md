# IPRA Tracker — Architecture

## Overview

A two-tier web application for managing New Mexico IPRA public records requests.

```
frontend/    Next.js 14 (App Router) + TypeScript + Tailwind CSS  → port 3000
backend/     FastAPI (Python) + Pydantic                           → port 8000
```

## Directory Structure

```
frontend/
  app/              Next.js App Router pages
  components/
    layout/         Sidebar, AppLayout
    ui/             Shared UI (StatusBadge, Toast)
    dashboard/      StatCard
    requests/       SubmitModal
  lib/              API client, mock data, deadline utils
  types/            TypeScript types

backend/
  main.py           FastAPI app entrypoint + CORS
  database.py       DB session (Phase 2: SQLAlchemy)
  models/           SQLAlchemy ORM models (Phase 2)
  schemas/          Pydantic request/response schemas
  routers/          Route handlers (auth, requests, deadlines, documents, ai)
  services/         Business logic (deadline_service, ai_service)
  utils/            Mock data (Phase 1)
  uploads/          File storage for uploaded records

docs/
  architecture.md   (this file)
  api_contract.md   API endpoint reference
  setup.md          Local setup guide
```

## Clean Separation of Concerns

| Layer | Location | Responsibility |
|---|---|---|
| Frontend UI | `frontend/app/`, `frontend/components/` | Pages, layout, forms |
| API Client | `frontend/lib/api.ts` | HTTP calls to FastAPI |
| FastAPI Routes | `backend/routers/` | HTTP handlers, validation |
| Pydantic Schemas | `backend/schemas/` | Request/response shapes |
| Business Logic | `backend/services/` | Deadline calculation, AI |
| Data Access | `backend/utils/mock_data.py` → Phase 2: models + DB | CRUD operations |
| Auth | `backend/routers/auth.py` | Token issuance (Phase 2: JWT) |

## Deadline Logic

Implemented in `backend/services/deadline_service.py`:

- **3-business-day deadline**: Skips weekends. TODO: Add NM state holidays.
- **15-calendar-day deadline**: Includes weekends and holidays.
- Deadline tracking begins only when a request is explicitly marked as submitted.
- The frontend never auto-submits — user must go through the confirmation modal.

## Phase Roadmap

| Phase | Focus |
|---|---|
| 1 (current) | App shell, UI, mock data, request CRUD, deadline logic |
| 2 | PostgreSQL + SQLAlchemy + Alembic + real JWT auth |
| 3 | AI draft improvement (OpenAI) |
| 4 | Document upload + metadata + AI summarization |
| 5 | Follow-up suggestions + reminder system |
