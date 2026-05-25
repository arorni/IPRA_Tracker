# IPRA Tracker — Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or pnpm

## Quick Start (Replit)

Two workflows run automatically:

- **FastAPI Backend** → `http://localhost:8000`
- **Next.js Frontend** → `http://localhost:3000`

Sign in with any email/password in Phase 1 — auth is mocked.

---

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at: `http://localhost:3000`

---

## Environment Variables

Create `backend/.env` (Phase 2):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ipra_tracker
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-...          # Phase 3: AI features
```

**Never hardcode secrets. Use environment variables only.**

---

## Phase 2: Database Setup

```bash
# Install Phase 2 dependencies (uncomment in requirements.txt first)
pip install -r requirements.txt

# Initialize Alembic
alembic init alembic

# Create first migration
alembic revision --autogenerate -m "initial"

# Run migrations
alembic upgrade head
```

---

## Phase 2: Auth

JWT tokens are issued on login. The frontend stores them in `localStorage`
and sends them as `Authorization: Bearer <token>` on every API request.

---

## Phase 3: AI

Set `OPENAI_API_KEY` in your environment. The AI service will automatically
use real OpenAI completions instead of placeholder responses.

Without an API key, the app continues to work — AI endpoints return clearly
labeled demo output. The app never crashes on missing AI credentials.

---

## Testing Data

Phase 1 ships with synthetic mock data:

- 5 sample IPRA requests in various statuses
- 3 fictional agencies (no real agencies or people)
- 2 sample documents (metadata only)

All synthetic data is labeled **FOR TESTING ONLY — SYNTHETIC SAMPLE DATA**.

---

## IPRA Legal Disclaimer

This tool helps draft and track public records requests but does not provide
legal advice. Deadline calculations are based on NMSA 1978, § 14-2-1 et seq.
Holiday exclusions are not currently implemented. Consult an attorney for
legal guidance on specific requests.
