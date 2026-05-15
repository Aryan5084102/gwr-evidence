# GWR Evidence Submission Platform

Monorepo containing the Guinness World Records submission platform — a witness portal,
adjudicator review console, organizer evidence workflow, and an operations admin
console with adjudicator assignment + live location tracking.

```
gwr-submission/
├── frontend/   React + Vite + TS + Tailwind + Redux Toolkit + react-query
└── backend/    FastAPI + SQLAlchemy (async) + JWT + SQLite (dev) / Postgres (prod)
```

## Quick start

**Backend** (FastAPI on :8000)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python seed_admin.py          # one-time: seeds demo events/adjudicators
python run.py
```

**Frontend** (Vite on :5173)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## Demo credentials

| Role        | Email                  | Password           |
|-------------|------------------------|--------------------|
| Organizer   | organizer@gwr.com      | Organizer@123      |
| Adjudicator | adjudicator@gwr.com    | Adjudicator@123    |
| Witness     | witness@gwr.com        | Witness@123        |
| Admin       | admin@gwr.com          | Admin@123          |

If they don't exist yet:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gwr.com","password":"Admin@123","role":"admin","full_name":"Vaigai Ramesh"}'
```

## Architecture

- Frontend talks to backend via `http://localhost:8000/api/v1` (override with `VITE_API_URL`).
- JWT access tokens stored in localStorage; refresh handled transparently by `src/lib/api.ts`.
- Admin role is a superset of organizer + adjudicator at the backend role guards.
- Live admin tracking polls `/admin/tracking/locations` every 8 seconds.

## Deployment

- Frontend: Vercel — set **Root Directory** to `frontend/`.
- Backend: any Python host; environment variables in `backend/.env.example`.
