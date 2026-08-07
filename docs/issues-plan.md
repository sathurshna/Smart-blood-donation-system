# Smart Blood Donation System Issue Plan

This backlog breaks the work into a continuous 3-week delivery plan with small, practical issue sizes.

## Week 1: Foundation

### Issue 1: Define product scope and roles

- Time: 1 day
- Goal: Confirm the core user roles and system boundaries.
- Scope:
  - Donor, hospital, and admin roles
  - Main workflows for request, match, accept, and complete
  - Minimum API and database contract
- Done when:
  - A short scope document exists
  - Roles and workflow are agreed

### Issue 2: Harden database schema

- Time: 2 days
- Goal: Make the schema ready for real application use.
- Scope:
  - Add missing constraints and indexes
  - Review foreign keys and data types
  - Add seed data for testing
- Done when:
  - Schema supports the main workflows
  - Basic sample records can be inserted cleanly

### Issue 3: Set up backend structure

- Time: 1 day
- Goal: Prepare the backend for feature work.
- Scope:
  - Folder structure for routes, controllers, services, and middleware
  - Centralized error handling
  - Input validation setup
- Done when:
  - Backend has a clear module structure
  - Health route still works

## Week 2: Core APIs

### Issue 4: Implement authentication and authorization

- Time: 2 days
- Goal: Secure access by role.
- Scope:
  - Register and login flow
  - Password hashing
  - Role-based route protection
- Done when:
  - Users can authenticate
  - Protected routes reject unauthorized access

### Issue 5: Build donor profile and availability APIs

- Time: 2 days
- Goal: Let donors manage their profile and donation readiness.
- Scope:
  - Update donor profile details
  - Toggle availability
  - Store location and last donation date
- Done when:
  - Donors can manage their profile state through APIs

### Issue 6: Build hospital and request creation APIs

- Time: 1 day
- Goal: Allow hospitals to create blood requests.
- Scope:
  - Hospital profile management
  - Create blood request endpoint
  - Store urgency, units needed, and location
- Done when:
  - Hospital users can create requests successfully

## Week 3: Matching, tracking, and release

### Issue 7: Implement request lifecycle management

- Time: 2 days
- Goal: Track request status through the full process.
- Scope:
  - Open, assigned, completed, cancelled states
  - Status transitions and validation
- Done when:
  - Requests move through the expected lifecycle safely

### Issue 8: Implement donor matching logic

- Time: 2 days
- Goal: Find eligible donors for a request.
- Scope:
  - Match by blood group
  - Filter by availability and distance
  - Return ranked donor candidates
- Done when:
  - A request can produce a usable donor list

### Issue 9: Implement donation tracking

- Time: 1 day
- Goal: Record accepted and completed donations.
- Scope:
  - Accept donation for a request
  - Mark donation completion
  - Keep donation history
- Done when:
  - Donation records are created and updated correctly

### Issue 10: Add testing, deployment, and documentation

- Time: 2 days
- Goal: Prepare the system for handoff and iteration.
- Scope:
  - Basic API tests
  - Deployment setup notes
  - README update with run instructions
- Done when:
  - Core flows are documented and testable

## Step-by-Step Implementation Plan for Preferred Flow

This section follows your preferred architecture:

- During development:
  - Docker packages the FastAPI app.
  - PostgreSQL runs on Supabase or locally as a fallback.
- During deployment:
  - Dockerized FastAPI is deployed to AWS or Azure.
  - Supabase remains the managed PostgreSQL database.

### Phase 1: Base setup and environment contracts

- Time: 0.5 to 1 day
- Goal: Standardize local and cloud configuration.
- Steps:
  - Define environment variables in `.env.example`:
    - `APP_ENV`, `PORT`, `DATABASE_URL`, `SUPABASE_DB_URL`, `LOCAL_DB_URL`, `CORS_ORIGINS`, `JWT_SECRET`
  - Decide environment switching rule:
    - Development default uses `SUPABASE_DB_URL`
    - If unavailable, switch to `LOCAL_DB_URL`
    - Production always uses `SUPABASE_DB_URL`
  - Document variable purpose and sample values in README.
- Done when:
  - Team can run app with one predictable env contract.

### Phase 2: Containerize FastAPI for development

- Time: 1 day
- Goal: Run the FastAPI app in Docker with hot-reload-friendly setup.
- Steps:
  - Create a `Dockerfile` for FastAPI using Python slim base image.
  - Add dependency install layer from `requirements.txt`.
  - Copy app source and expose app port.
  - Start server with Uvicorn command suitable for development.
  - Add `.dockerignore` to reduce build size.
- Done when:
  - `docker build` succeeds.
  - App starts from container and health endpoint responds.

### Phase 3: Compose setup for local development

- Time: 1 day
- Goal: Support both Supabase-first and local-Postgres fallback workflows.
- Steps:
  - Create `docker-compose.yml` with `api` service.
  - Add optional `postgres` service for local DB fallback.
  - Add profile or override strategy:
    - Default compose path uses Supabase connection string.
    - Local DB profile runs when Supabase is not accessible.
  - Mount source for fast iteration and configure restart policy.
- Done when:
  - Developers can run one command for API + selected database mode.

### Phase 4: Database migration and reliability setup

- Time: 1 day
- Goal: Keep schema changes safe across Supabase and local PostgreSQL.
- Steps:
  - Add migration tool (for example Alembic) and baseline migration.
  - Add startup check that validates DB connectivity before serving traffic.
  - Add seed script for local testing data.
  - Verify migrations run on both Supabase and local Postgres.
- Done when:
  - Schema version is trackable and reproducible in all environments.

### Phase 5: CI build and verification pipeline

- Time: 1 day
- Goal: Ensure every change produces a valid Docker image and passing tests.
- Steps:
  - Add CI workflow for lint, tests, and image build.
  - Run container-based smoke test against health endpoint.
  - Publish image to a registry (ECR for AWS or ACR for Azure).
- Done when:
  - Main branch automatically builds, tests, and publishes image.

### Phase 6A: Deploy Dockerized FastAPI to AWS

- Time: 1 to 2 days
- Goal: Deploy container on AWS with managed runtime.
- Steps:
  - Choose runtime: ECS Fargate or App Runner.
  - Create service/task config with image from ECR.
  - Set secrets and env vars in AWS secret/config store.
  - Configure security group and outbound access to Supabase.
  - Add domain/TLS and health check path.
- Done when:
  - Public API is reachable and connected to Supabase.

### Phase 6B: Deploy Dockerized FastAPI to Azure

- Time: 1 to 2 days
- Goal: Deploy container on Azure with managed runtime.
- Steps:
  - Choose runtime: Azure Container Apps or Azure App Service (Container).
  - Push image to ACR and reference it in deployment config.
  - Set env vars and secrets in Azure configuration.
  - Configure ingress, custom domain, and TLS.
  - Confirm outbound connectivity to Supabase.
- Done when:
  - Public API is reachable and connected to Supabase.

### Phase 7: Production hardening and operations

- Time: 1 day
- Goal: Make deployment stable and maintainable.
- Steps:
  - Add structured logging and request IDs.
  - Add metrics and uptime alerts.
  - Add backup/restore notes for Supabase and migration rollback steps.
  - Define rollback procedure to last known good image.
- Done when:
  - On-call basics are documented and rollback is tested.

### Phase 8: Final release checklist

- Time: 0.5 day
- Goal: Confirm readiness before public use.
- Steps:
  - Verify CORS and auth settings for production frontend domains.
  - Run end-to-end checks for donor, hospital, and admin flows.
  - Freeze image tag for release and update release notes.
- Done when:
  - Team signs off on functional and operational readiness.

## Suggested Calendar

- Aug 3 to Aug 7: Issues 1 to 3
- Aug 10 to Aug 14: Issues 4 to 6
- Aug 17 to Aug 21: Issues 7 to 10

## Notes

- Keep each issue small enough to finish in the stated time window.
- If the team is one person, merge Issue 2 and Issue 3 only if the schema is already close to final.
- If the team has more than one developer, Issue 4 and Issue 5 can run in parallel after Issue 3.
- For the preferred architecture, treat Supabase as the production source of truth and keep local PostgreSQL only as a development fallback.
