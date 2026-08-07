# Project Scope: Smart Blood Donation Coordination System

## User Roles

### Donor

- Registers an account (email, password, role: donor)
- Maintains a profile: blood group, phone, location, availability, last donation date
- Views nearby blood requests matching their blood group
- Accepts a request to donate

### Hospital

- Registers an account (email, password, role: hospital)
- Maintains a profile: hospital name, address, phone
- Creates blood requests (blood group, units needed, urgency, location)
- Views matched/nearby donors for their requests
- Marks a request as completed

### Admin

- Registers an account (role: admin) — created manually for now, not via public signup
- Views system-wide statistics (total donors, active requests, completed donations)
- Manages users (future scope)

## Core Workflow

1. Hospital creates a blood request
2. System identifies eligible donors: matching blood group, marked available,
   past minimum days since last donation, within a reasonable distance
3. Eligible donors see the request and can accept it
4. Hospital sees confirmed donor(s) for their request
5. Hospital marks the request completed once the donation happens

## Minimum API Contract (implemented or planned)

| Endpoint                   | Method  | Role required | Status  |
| -------------------------- | ------- | ------------- | ------- |
| /api/auth/register         | POST    | Public        | ✅ Done |
| /api/auth/login            | POST    | Public        | ✅ Done |
| /api/donors/profile        | GET/PUT | Donor         | Planned |
| /api/hospitals/profile     | GET/PUT | Hospital      | Planned |
| /api/requests              | POST    | Hospital      | Planned |
| /api/requests/nearby       | GET     | Donor         | Planned |
| /api/requests/:id/accept   | POST    | Donor         | Planned |
| /api/requests/:id/complete | PUT     | Hospital      | Planned |

## Out of Scope (for MVP)

- Admin user management UI (view-only stats for now)
- Push notifications (may be added later)
- Multi-language support
