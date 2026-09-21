# INSPIRE — Indian Standards Procurement Intelligence & Recommendation Engine

## Overview

INSPIRE helps procurement teams turn an ordinary requirement into an explainable shortlist of relevant Indian Standards. It extracts product context, quantities, and technical requirements; retrieves and ranks standards; connects related references; reviews tender documents; records decisions; and generates a PDF recommendation report. It is decision support, not a legal compliance or procurement-award system.

## Key Features

- Procurement requirement capture and protected authentication
- Requirement extraction, including quantity and technical requirements
- Indian Standards retrieval, relevance scoring, and explainable recommendations
- Related and normative standard connections
- Tender review with missing, potentially outdated, and unresolved requirement detection
- Saved recommendations and an audit trail
- PDF recommendation reports

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, lucide-react, and shadcn/ui-inspired utility patterns.

**Backend:** Python, FastAPI, Pydantic, SQLAlchemy, JWT authentication, and ReportLab.

**Database:** SQLAlchemy supports SQLite for local development and PostgreSQL through Docker Compose for the containerized deployment architecture.

**AI:** `LLMProvider` abstraction with an `OpenAIProvider` when configured and a deterministic `DemoProvider` fallback.

**Document processing:** PDF, DOCX, and TXT extraction with OCR-ready error handling for scanned documents.

## System Architecture

```text
User
	-> React Frontend
	-> FastAPI Backend
	-> Requirement Processing
	-> Standards Retrieval & Ranking
	-> Recommendation Engine
	-> Tender Review
	-> Audit / Reports
```

Major backend components include `api` route modules, `ai` providers and extraction, `retrieval` and ranking, `document_processing`, SQLAlchemy `models`, and `seed` data. The frontend is organized into route pages, shared layouts, services, hooks, and styles.

## Core Workflow

```text
Requirement
	-> Extract
	-> Retrieve
	-> Rank
	-> Explain
	-> Recommend
	-> Connect Related Standards
	-> Review Tender
	-> Audit
	-> Generate Report
```

## Demo Scenario

For “500 industrial safety helmets for construction workers with impact protection for industrial use,” INSPIRE extracts the requirement context, ranks candidate standards such as IS 2925, explains the relevance score, shows related standards, and lets the user review a tender against the resulting recommendation set.

## Security

- JWT authentication and password hashing
- Protected API routes and input validation
- File type and size validation for document uploads
- Environment-based secrets and configurable CORS origins
- No secrets should be committed; use `.env.example` as the template for a local `.env`

## Running Locally

### Backend with local SQLite

From the repository root, create and activate a Python virtual environment, install the pinned dependencies, seed the local database, and start the API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend defaults to `backend/inspire.db` when `DATABASE_URL` is not set. Copy `.env.example` to `.env` to override settings. Keep real secrets out of Git.

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173`. FastAPI documentation is available at `http://localhost:8000/docs`.

### PostgreSQL with Docker Compose

Docker Compose provisions PostgreSQL and runs the backend/frontend services:

```powershell
docker compose up --build
```

The Compose defaults are development values only. Set production credentials in an uncommitted `.env` before using the stack outside local development.

## Testing

Backend tests:

```powershell
cd backend
pytest
```

The verified release state includes backend tests passing `8/8`, a passing frontend production build (`npm run build`), and browser verification of the core requirement workflow, Tender Review, and PDF recommendation report.

## Demo Account

The seed script creates the local demo account `admin@inspire.local` with password `Inspire123!`. Change or remove demo credentials before any non-local deployment.

## Data Disclaimer

The bundled standards data is a curated demonstration/prototyping dataset and is not an authoritative BIS dataset. Recommendation relevance does not itself establish legal applicability, BIS approval, certification, or compliance. Verify current standards, amendments, applicability, and procurement requirements against authoritative BIS sources before finalizing specifications.

## License

This project is provided for demonstration and internal evaluation purposes.
