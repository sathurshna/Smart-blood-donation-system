# Project Roadmap

This roadmap uses the allocated issue durations from the backlog and turns them into a dated delivery table.

## Roadmap Table

| Week   | Issue                                      | GitHub Issue | Duration | Start Date   | Deadline     | Deliverable                                                       |
| ------ | ------------------------------------------ | ------------ | -------- | ------------ | ------------ | ----------------------------------------------------------------- |
| Week 1 | Define product scope and roles             | #6           | 1 day    | Aug 3, 2026  | Aug 3, 2026  | Confirm user roles, workflow, and system boundaries               |
| Week 1 | Harden database schema                     | #7           | 2 days   | Aug 4, 2026  | Aug 5, 2026  | Finalize schema constraints, indexes, and seed data               |
| Week 1 | Set up backend structure                   | #8           | 1 day    | Aug 6, 2026  | Aug 6, 2026  | Establish routes, controllers, services, and middleware structure |
| Week 2 | Implement authentication and authorization | #9           | 2 days   | Aug 10, 2026 | Aug 11, 2026 | Add register, login, hashing, and protected routes                |
| Week 2 | Build donor profile and availability APIs  | #10          | 2 days   | Aug 12, 2026 | Aug 13, 2026 | Let donors update profile, location, and availability             |
| Week 2 | Build hospital and request creation APIs   | #11          | 1 day    | Aug 14, 2026 | Aug 14, 2026 | Allow hospitals to create blood requests                          |
| Week 3 | Implement request lifecycle management     | #12          | 2 days   | Aug 17, 2026 | Aug 18, 2026 | Support open, assigned, completed, and cancelled states           |
| Week 3 | Implement donor matching logic             | #13          | 2 days   | Aug 19, 2026 | Aug 20, 2026 | Match eligible donors by blood group, availability, and distance  |
| Week 3 | Implement donation tracking                | #14          | 1 day    | Aug 21, 2026 | Aug 21, 2026 | Track accepted and completed donations                            |
| Week 3 | Add testing, deployment, and documentation | #15          | 2 days   | Aug 22, 2026 | Aug 23, 2026 | Add tests, deployment notes, and updated README instructions      |

## Weekly Milestones

| Week   | Date Range       | Milestone                                             |
| ------ | ---------------- | ----------------------------------------------------- |
| Week 1 | Aug 3 to Aug 6   | Foundation work completed                             |
| Week 2 | Aug 10 to Aug 14 | Core API layer completed                              |
| Week 3 | Aug 17 to Aug 23 | Matching, tracking, and release preparation completed |

## Preferred Deployment Flow Roadmap

This table maps the new flow issues to concrete calendar deadlines.

| Phase    | Issue                                                                | GitHub Issue | Duration | Start Date   | Deadline     | Deliverable                                                    |
| -------- | -------------------------------------------------------------------- | ------------ | -------- | ------------ | ------------ | -------------------------------------------------------------- |
| Phase 1  | Define environment contracts for dev and prod                        | #23          | 1 day    | Aug 24, 2026 | Aug 24, 2026 | Finalized env variable contract for development and production |
| Phase 2  | Dockerize FastAPI application for development                        | #24          | 1 day    | Aug 25, 2026 | Aug 25, 2026 | Working Dockerfile and containerized FastAPI startup           |
| Phase 3  | Add docker-compose for Supabase-first with local PostgreSQL fallback | #25          | 1 day    | Aug 26, 2026 | Aug 26, 2026 | One-command local startup with Supabase and local fallback     |
| Phase 4  | Add migrations and startup DB reliability checks                     | #26          | 1 day    | Aug 27, 2026 | Aug 27, 2026 | Migration baseline and startup connectivity verification       |
| Phase 5  | Build CI pipeline for lint, tests, and Docker image publishing       | #27          | 1 day    | Aug 28, 2026 | Aug 28, 2026 | Automated CI checks and publish-ready container image          |
| Phase 6A | Deploy Dockerized FastAPI to AWS                                     | #28          | 2 days   | Aug 31, 2026 | Sep 1, 2026  | Live AWS deployment connected to Supabase                      |
| Phase 6B | Deploy Dockerized FastAPI to Azure                                   | #29          | 2 days   | Sep 2, 2026  | Sep 3, 2026  | Live Azure deployment connected to Supabase                    |
| Phase 7  | Production hardening (logging, monitoring, rollback)                 | #30          | 1 day    | Sep 4, 2026  | Sep 4, 2026  | Monitoring and rollback runbook ready                          |
| Phase 8  | Final release checklist and go-live validation                       | #31          | 0.5 day  | Sep 7, 2026  | Sep 7, 2026  | Signed-off go-live checklist                                   |

## Preferred Flow Milestones

| Milestone                                         | Date         | Outcome                      |
| ------------------------------------------------- | ------------ | ---------------------------- |
| Containerized development baseline complete       | Aug 26, 2026 | Phases 1 to 3 complete       |
| CI and deployment foundations complete            | Sep 1, 2026  | Phases 4, 5, and 6A complete |
| Multi-cloud readiness and go-live checks complete | Sep 7, 2026  | Phases 6B to 8 complete      |

## Notes

- The roadmap assumes work is done on business days with a short buffer between weeks.
- If the team works sequentially only, the deadlines stay the same but the calendar can shift by one day per task.
- Existing open GitHub issues #3 to #5 are earlier setup tasks and can be treated as prerequisites.
- New flow issues #23 to #31 are scheduled after the original 3-week core delivery sequence.
