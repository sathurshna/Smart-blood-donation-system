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

## Notes

- The roadmap assumes work is done on business days with a short buffer between weeks.
- If the team works sequentially only, the deadlines stay the same but the calendar can shift by one day per task.
- Existing open GitHub issues #3 to #5 are earlier setup tasks and can be treated as prerequisites.
