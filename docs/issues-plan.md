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

## Suggested Calendar

- Aug 3 to Aug 7: Issues 1 to 3
- Aug 10 to Aug 14: Issues 4 to 6
- Aug 17 to Aug 21: Issues 7 to 10

## Notes

- Keep each issue small enough to finish in the stated time window.
- If the team is one person, merge Issue 2 and Issue 3 only if the schema is already close to final.
- If the team has more than one developer, Issue 4 and Issue 5 can run in parallel after Issue 3.
