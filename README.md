# GWR Evidence Submission Platform — Frontend

Premium, enterprise-grade frontend for the **Guinness World Records Evidence Submission Platform** — an AI-powered evidence intelligence workspace for adjudicators, record holders, and verification teams.

## Tech stack

- React 19 · TypeScript · Vite
- TailwindCSS (custom navy + royal blue + gold design system)
- Redux Toolkit
- TanStack Query
- React Router v6
- Framer Motion (light micro-animations only)
- Recharts
- Lucide Icons

## Run

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173

## Routes

| Path | Page |
| --- | --- |
| `/login`, `/forgot-password` | Auth |
| `/dashboard` | Adjudication overview |
| `/submissions/new` | Stepper-based submission creation |
| `/evidence/upload` | Drag/drop & queue upload |
| `/ai/processing` | AI processing center (classification, OCR, STT…) |
| `/review` | Evidence review workspace |
| `/search` | AI smart semantic search |
| `/timeline` | AI-generated event timeline |
| `/collaboration` | Reviewer threads & presence |
| `/validation` | AI alerts & quality scoring |
| `/clarifications` | Clarification ticketing |
| `/report` | Adjudication report generation |
| `/package` | Submission package export |
| `/analytics` | Executive analytics |
| `/security` | Audit log & integrity |

## Project layout

```
src/
├── components/       # Reusable UI (Sidebar, EvidenceCard, AIInsightCard, …)
├── layouts/          # AuthLayout, DashboardLayout
├── pages/            # 15 product pages
├── redux/            # Toolkit store (auth, ui)
├── mock-data/        # Submissions, evidence, reviewers, alerts, timeline
├── types/            # Domain types
├── lib/              # cn, formatters
└── index.css         # Design tokens & component primitives
```

All data is mocked — no backend required.
