# Project Roadmap — Smart Blood Donation Coordination System

**Last updated:** August 8, 2026
**Actual tech stack:** React (web) · React Native + Expo (mobile) · Express.js (Node.js) · PostgreSQL · JWT + bcrypt · Git/GitHub

> Note: this roadmap replaces earlier drafts that referenced FastAPI/Python and TypeScript.
> The confirmed backend is **Node.js + Express**, written in **plain JavaScript**.
> FastAPI may be explored later as a *separate* learning exercise, not as a replacement.

---

## Phase 1 — Backend Foundation ✅ Complete

| Issue | Title | Status |
|-------|-------|--------|
| #6 | Define product scope and roles | ✅ Done |
| #7 | Harden database schema (constraints, indexes, seed data) | ✅ Done |
| #8 | Set up backend structure (routes/controllers/services/middleware) | ✅ Done |
| #9 | Implement authentication and authorization (JWT + bcrypt) | ✅ Done |

**Deliverable:** A running Express server connected to PostgreSQL, with a hardened schema and working register/login.

---

## Phase 2 — Core APIs 🔶 In Progress

| Issue | Title | Status |
|-------|-------|--------|
| #10 | Build donor profile and availability APIs | ✅ Done |
| #11 | Build hospital and request creation APIs | ✅ Done |
| #12 | Implement request lifecycle management (status state machine) | ✅ Done |
| #13 | Implement donor matching logic (blood group, availability, distance) | ✅ Done |
| #14 | Implement donation tracking (accept/complete history) | ⬜ Not started |
| #15 | Add basic API tests, deployment notes, README update | ⬜ Not started |

**Deliverable:** A complete, testable REST API covering the full donor–hospital–request–donation workflow.

---

## Phase 3 — Simple Frontend (NEW — not previously planned)

Goal: build the minimum UI needed to actually use every API from Phase 1–2. Kept intentionally simple — polish comes later, after deployment.

### Web (React) — Hospital & Admin

| Issue | Title | Depends on |
|-------|-------|------------|
| #35 | Web: Auth screens (register/login) | #9 |
| #36 | Web: Hospital dashboard — create & view requests | #11, #12 |
| #37 | Web: Request status controls (mark matched/completed/cancelled) | #12 |
| #39 | Web: Admin dashboard — basic stats (counts only) | #10, #11 |

### Mobile (React Native + Expo) — Donor

| Issue | Title | Depends on |
|-------|-------|------------|
| #38 | Mobile: Auth screens (register/login) | #9 |
| #40 | Mobile: Donor profile screen (edit details, toggle availability) | #10 |
| #41 | Mobile: Nearby/matching requests list + accept action | #13, #14 |

**Deliverable:** A functional, unstyled-but-working web app and mobile app that exercise every backend endpoint.

---

## Phase 4 — Deployment

Rewritten for the **actual stack (Express/Node)** — earlier drafts of this phase referenced FastAPI/Python and need this correction applied when work starts.

| Issue | Title | Notes |
|-------|-------|-------|
| #23 | Define environment contracts for dev and prod | `.env.example` with DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGINS |
| #24 | Dockerize the Express application | Node slim base image, not Python |
| #25 | docker-compose: Supabase-first with local Postgres fallback | |
| #26 | Add DB migration approach + startup connectivity check | |
| #27 | Build CI pipeline (lint, tests, Docker image publish) | |
| #28 | Deploy Dockerized Express app to AWS or Azure | Pick one cloud, not both, for MVP |
| #29 | Production hardening (logging, monitoring, rollback notes) | |
| #30 | Final release checklist and go-live validation | |

**Deliverable:** A live, publicly reachable deployment of the backend, connected to Supabase, with web/mobile pointing at it.

---

## Phase 5 — Polish (Post-Deployment)

Only after the app is live and demoable. Examples, not committed issues yet:
- Visual design pass (styling, responsive layout, branding)
- Map integration (Leaflet/OpenStreetMap or Google Maps) for request/donor locations
- AI urgency analysis (Gemini) on request creation
- Push notifications for matched donors
- Admin user management

---

## Guiding Principles

1. **Backend before frontend** — every screen consumes an already-tested API; no guessing at data shapes.
2. **Simple before styled** — Phase 3 frontend is functional only; visual polish is explicitly deferred to Phase 5.
3. **One deployment target for MVP** — pick AWS *or* Azure first; don't build both in parallel.
4. **Stack stays Express/JS** — any FastAPI work happens as a separate, clearly-labeled learning branch/repo, not inside this deployment plan.