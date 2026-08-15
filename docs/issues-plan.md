# Smart Blood Donation System — Issue Plan

**Last updated:** August 8, 2026  
**Stack:** React (web) · React Native + Expo (mobile) · Express.js (Node.js) · PostgreSQL · JWT + bcrypt

This backlog mirrors [roadmap.md](./roadmap.md) with detailed scope, time estimates, and acceptance criteria for each GitHub issue.

---

## Phase 1 — Backend Foundation ✅ Complete

### Issue #6: Define product scope and roles

- **Time:** 1 day
- **Status:** ✅ Done
- **Goal:** Confirm the core user roles and system boundaries.
- **Scope:**
  - Donor, hospital, and admin roles
  - Main workflows for request, match, accept, and complete
  - Minimum API and database contract
- **Done when:**
  - [scope.md](./scope.md) exists with agreed roles and workflow

### Issue #7: Harden database schema

- **Time:** 2 days
- **Status:** ✅ Done
- **Goal:** Make the schema ready for real application use.
- **Scope:**
  - Add missing constraints and indexes
  - Review foreign keys and data types
  - Add seed data for testing
- **Done when:**
  - Schema supports the main workflows
  - Basic sample records can be inserted cleanly

### Issue #8: Set up backend structure

- **Time:** 1 day
- **Status:** ✅ Done
- **Goal:** Prepare the backend for feature work.
- **Scope:**
  - Folder structure for routes, controllers, services, and middleware
  - Centralized error handling
  - Input validation setup
- **Done when:**
  - Backend has a clear module structure
  - Health route still works

### Issue #9: Implement authentication and authorization

- **Time:** 2 days
- **Status:** ✅ Done
- **Goal:** Secure access by role.
- **Scope:**
  - Register and login flow
  - Password hashing (bcrypt)
  - JWT issuance and role-based route protection
- **Done when:**
  - Users can authenticate
  - Protected routes reject unauthorized access

---

## Phase 2 — Core APIs 🔶 In Progress

### Issue #10: Build donor profile and availability APIs

- **Time:** 2 days
- **Status:** ✅ Done
- **Goal:** Let donors manage their profile and donation readiness.
- **Scope:**
  - GET/PUT `/api/donors/profile`
  - Toggle availability flag
  - Store blood group, phone, location, and last donation date
- **Done when:**
  - Donors can manage their profile state through APIs

### Issue #11: Build hospital and request creation APIs

- **Time:** 1 day
- **Status:** ✅ Done
- **Goal:** Allow hospitals to create blood requests.
- **Scope:**
  - GET/PUT `/api/hospitals/profile`
  - POST `/api/requests` — blood group, units needed, urgency, location
  - GET `/api/requests` — list hospital's own requests
- **Done when:**
  - Hospital users can create and view requests successfully

### Issue #12: Implement request lifecycle management

- **Time:** 2 days
- **Status:** ✅ Done
- **Goal:** Track request status through the full process.
- **Scope:**
  - Status state machine: open → assigned → completed / cancelled
  - PUT `/api/requests/:id/status` with transition validation
  - Reject invalid status jumps
- **Done when:**
  - Requests move through the expected lifecycle safely

### Issue #13: Implement donor matching logic

- **Time:** 2 days
- **Status:** ✅ Done
- **Depends on:** #10, #11, #12
- **Goal:** Find eligible donors for a request.
- **Scope:**
  - Match by blood group compatibility
  - Filter by availability and minimum days since last donation
  - Rank by distance (simple haversine or lat/lng delta for MVP)
  - GET `/api/requests/nearby` for donors
  - GET `/api/requests/:id/matches` for hospitals
- **Done when:**
  - A request can produce a usable, ranked donor list
  - Donors see nearby requests matching their blood group

### Issue #14: Implement donation tracking

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #12, #13
- **Goal:** Record accepted and completed donations.
- **Scope:**
  - POST `/api/requests/:id/accept` — donor accepts a request
  - Update request status to assigned on accept
  - Mark donation completion (ties into #12 complete transition)
  - Keep donation history per donor
- **Done when:**
  - Donation records are created and updated correctly
  - Hospital can see confirmed donor(s) for a request

### Issue #15: Add basic API tests, deployment notes, README update

- **Time:** 2 days
- **Status:** ⬜ Not started
- **Depends on:** #10–#14
- **Goal:** Prepare the API layer for handoff to frontend and deployment.
- **Scope:**
  - Basic integration tests for auth, donor, hospital, and request flows
  - Update README with run instructions and endpoint summary
  - Document local dev setup (env vars, DB seed)
- **Done when:**
  - Core flows are documented and testable
  - A new developer can run the backend from README alone

---

## Phase 3 — Simple Frontend

Goal: build the minimum UI needed to use every API from Phase 1–2. Functional only — no styling polish (deferred to Phase 5).

### Web (React) — Hospital & Admin

#### Issue #35: Web — Auth screens (register/login)

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #9
- **Goal:** Hospital and admin users can sign up and sign in via the web app.
- **Scope:**
  - Create React web app scaffold (Vite or CRA)
  - Register page with role selection (hospital; admin excluded from public signup)
  - Login page with email/password
  - JWT stored in memory or localStorage; attach to API requests
  - Redirect to role-appropriate home after login
  - Basic error display for failed auth
- **Done when:**
  - Hospital user can register, log in, and stay authenticated across page reloads
  - Unauthorized routes redirect to login

#### Issue #36: Web — Hospital dashboard (create & view requests)

- **Time:** 2 days
- **Status:** ⬜ Not started
- **Depends on:** #11, #12, #35
- **Goal:** Hospitals can create blood requests and see their list.
- **Scope:**
  - Hospital profile view/edit (name, address, phone)
  - Create-request form: blood group, units needed, urgency, location
  - Request list table/cards showing status, blood group, urgency, created date
  - Wire to POST/GET `/api/requests` and hospital profile endpoints
- **Done when:**
  - Hospital user can create a request and see it in their dashboard
  - Request list reflects live data from the API

#### Issue #37: Web — Request status controls

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #12, #36
- **Goal:** Hospitals can advance request status through the lifecycle.
- **Scope:**
  - Status badge on each request
  - Action buttons: mark completed, cancel (only valid transitions shown)
  - Confirmation before destructive actions (cancel)
  - Wire to PUT `/api/requests/:id/status`
- **Done when:**
  - Hospital can mark a request completed or cancelled from the UI
  - Invalid transitions are disabled or show an error

#### Issue #39: Web — Admin dashboard (basic stats)

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #10, #11, #35
- **Goal:** Admin can view system-wide counts at a glance.
- **Scope:**
  - Admin-only route (role guard)
  - Display counts: total donors, active requests, completed donations
  - Wire to a stats endpoint (add GET `/api/admin/stats` if not yet built)
  - Read-only — no user management in MVP
- **Done when:**
  - Admin login lands on a stats page with live counts from the API

### Mobile (React Native + Expo) — Donor

#### Issue #38: Mobile — Auth screens (register/login)

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #9
- **Goal:** Donors can sign up and sign in on mobile.
- **Scope:**
  - Create Expo project scaffold with basic navigation
  - Register screen (role fixed to donor)
  - Login screen with email/password
  - JWT stored securely (AsyncStorage for MVP)
  - Redirect to donor home after login
- **Done when:**
  - Donor can register, log in, and stay authenticated across app restart
  - Unauthenticated users cannot reach protected screens

#### Issue #40: Mobile — Donor profile screen

- **Time:** 2 days
- **Status:** ⬜ Not started
- **Depends on:** #10, #38
- **Goal:** Donors can manage their profile and availability.
- **Scope:**
  - Profile form: blood group, phone, location (lat/lng or address text for MVP)
  - Availability toggle (on/off)
  - Last donation date display/edit
  - Wire to GET/PUT `/api/donors/profile`
  - Loading and error states
- **Done when:**
  - Donor can update profile fields and toggle availability
  - Changes persist and reflect on next app open

#### Issue #41: Mobile — Nearby requests list + accept action

- **Time:** 2 days
- **Status:** ⬜ Not started
- **Depends on:** #13, #14, #40
- **Goal:** Donors see matching nearby requests and can accept one.
- **Scope:**
  - List of nearby/open requests filtered by blood group
  - Request detail: hospital name, blood group, urgency, distance
  - Accept button on a request (disabled if already assigned)
  - Wire to GET `/api/requests/nearby` and POST `/api/requests/:id/accept`
  - Pull-to-refresh or manual refresh
- **Done when:**
  - Available donor sees eligible requests and can accept one
  - Accepted request updates status and disappears from open list

---

## Phase 4 — Deployment

Rewritten for **Express/Node** — not FastAPI/Python.

### Issue #23: Define environment contracts for dev and prod

- **Time:** 0.5–1 day
- **Status:** ⬜ Not started
- **Goal:** Standardize local and cloud configuration.
- **Scope:**
  - Finalize `.env.example` with: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGINS`, `NODE_ENV`
  - Document Supabase-first with local Postgres fallback switching rule
  - Document variable purpose and sample values in README
- **Done when:**
  - Team can run app with one predictable env contract

### Issue #24: Dockerize the Express application

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #23
- **Goal:** Run the Express app in a container.
- **Scope:**
  - `Dockerfile` using Node slim base image
  - Multi-stage or single-stage build from `backend/package.json`
  - Expose app port; start with `node src/server.js`
  - Add `.dockerignore`
- **Done when:**
  - `docker build` succeeds
  - App starts from container and health endpoint responds

### Issue #25: docker-compose — Supabase-first with local Postgres fallback

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #24
- **Goal:** One-command local startup with flexible DB mode.
- **Scope:**
  - `docker-compose.yml` with `api` service
  - Optional `postgres` service for local DB fallback
  - Profile or override for Supabase vs local Postgres
  - Mount source for dev iteration
- **Done when:**
  - Developers can run one command for API + selected database mode

### Issue #26: Add DB migration approach + startup connectivity check

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #25
- **Goal:** Keep schema changes safe across environments.
- **Scope:**
  - Choose migration tool (e.g. node-pg-migrate or raw SQL version tracking)
  - Baseline migration from current `database/schema.sql`
  - Startup check that validates DB connectivity before serving traffic
  - Verify migrations run on Supabase and local Postgres
- **Done when:**
  - Schema version is trackable and reproducible in all environments

### Issue #27: Build CI pipeline (lint, tests, Docker image publish)

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #15, #24
- **Goal:** Every change produces a valid Docker image and passing tests.
- **Scope:**
  - GitHub Actions workflow: lint, tests, image build
  - Container-based smoke test against health endpoint
  - Publish image to registry (ECR or ACR — pick one)
- **Done when:**
  - Main branch automatically builds, tests, and publishes image

### Issue #28: Deploy Dockerized Express app to AWS or Azure

- **Time:** 1–2 days
- **Status:** ⬜ Not started
- **Depends on:** #27
- **Goal:** Publicly reachable production API connected to Supabase.
- **Scope:**
  - Pick **one** cloud for MVP (AWS ECS Fargate/App Runner **or** Azure Container Apps)
  - Configure secrets, env vars, security groups, TLS/domain
  - Confirm outbound connectivity to Supabase
  - Set `CORS_ORIGINS` for web and mobile clients
- **Done when:**
  - Public API is reachable and connected to Supabase

### Issue #29: Production hardening (logging, monitoring, rollback notes)

- **Time:** 1 day
- **Status:** ⬜ Not started
- **Depends on:** #28
- **Goal:** Make deployment stable and maintainable.
- **Scope:**
  - Structured logging and request IDs
  - Basic metrics/uptime alerts
  - Backup/restore notes for Supabase
  - Rollback procedure to last known good image
- **Done when:**
  - On-call basics are documented and rollback is tested

### Issue #30: Final release checklist and go-live validation

- **Time:** 0.5 day
- **Status:** ⬜ Not started
- **Depends on:** #35–#41, #29
- **Goal:** Confirm readiness before public use.
- **Scope:**
  - Verify CORS and auth settings for production frontend domains
  - End-to-end checks: donor mobile flow, hospital web flow, admin stats
  - Point web and mobile apps at production API URL
  - Freeze image tag and update release notes
- **Done when:**
  - Team signs off on functional and operational readiness

---

## Phase 5 — Polish (Post-Deployment)

Not yet filed as GitHub issues. Examples for after go-live:

- Visual design pass (styling, responsive layout, branding)
- Map integration (Leaflet/OpenStreetMap) for request/donor locations
- AI urgency analysis (Gemini) on request creation
- Push notifications for matched donors
- Admin user management

---

## Suggested Calendar

Assumes sequential work by one developer; parallel tracks noted where applicable.

| Week | Dates | Issues | Focus |
|------|-------|--------|-------|
| 1 | Aug 3–7 | #6–#9 | Backend foundation ✅ |
| 2 | Aug 10–14 | #10–#12 | Core APIs (mostly done) |
| 3 | Aug 17–21 | #13–#15 | Matching, tracking, API tests |
| 4 | Aug 24–28 | #35–#39 | Web frontend (hospital + admin) |
| 5 | Aug 31 – Sep 4 | #38–#41 | Mobile frontend (donor) |
| 6 | Sep 7–11 | #23–#27 | Containerization + CI |
| 7 | Sep 14–18 | #28–#30 | Deploy + go-live |

### Parallel tracks (multi-developer)

- **Backend dev:** #13 → #14 → #15, then support frontend integration
- **Web dev:** #35 → #36 → #37 → #39 (can start #35 as soon as #9 is done)
- **Mobile dev:** #38 → #40, then #41 after #13–#14 land

---

## Guiding Principles

1. **Backend before frontend** — every screen consumes an already-tested API.
2. **Simple before styled** — Phase 3 UI is functional only; polish is Phase 5.
3. **One deployment target for MVP** — pick AWS *or* Azure, not both.
4. **Stack stays Express/JS** — FastAPI is a separate learning exercise, not part of this plan.

## Notes

- Keep each issue small enough to finish in the stated time window.
- Issue #11 is built and tested — merge before starting #36 (hospital dashboard).
- Issue #41 (mobile accept flow) is blocked until #13 and #14 are complete.
- Existing open GitHub issues #3–#5 are early setup tasks and can be treated as prerequisites.
- Issue #31 was closed as duplicate of #30 (old FastAPI deployment plan).
