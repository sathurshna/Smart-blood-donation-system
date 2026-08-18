# 🩸 Emergency Blood Donation & Matching System (LifeLink)

An AI-powered, real-time blood donor matching web platform designed to eliminate delay when hospitals urgently need blood. The platform connects hospitals directly with nearby, eligible donors using intelligent prioritization, red blood cell compatibility, and geolocation proximity.

---

## ⚡ Problem Statement

During medical emergencies, hospitals face severe bottlenecks:

- **Visibility:** Donors don't know _who_ needs blood or _where_.
- **Proximity:** Hospitals struggle to locate available donors _nearby_ in real time.
- **Screening:** Donors often don't know if they meet safety and time-based _eligibility criteria_ (e.g., minimum 56 days between donations).

---

## 💡 The Solution

A unified emergency coordination platform where:

1. **Hospitals** broadcast urgent blood requests with required blood types, units, and urgency levels.
2. **Donors** register their blood type, geographic location, availability status, and last donation date.
3. **Smart Matching Engine** evaluates blood compatibility, donation interval eligibility, and distance to rank the closest eligible donors using a comprehensive **Match Score**.
4. **AI Assistance** extracts, summarizes, and prioritizes life-threatening requests.

---

## 🛠 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Backend** | Express.js (Node.js) |
| **Database** | PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt |
| **Frontend (Web)** | React (Planned — Phase 3) |
| **Mobile (Donor)** | React Native + Expo (Planned — Phase 3) |
| **AI Engine** | Google Gemini API (Planned — Phase 5) |

---

## 📁 Repository Structure

```
Smart-blood-donation-system/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL pool connection (db.js)
│   │   ├── controllers/     # HTTP request handlers (auth, donor, hospital, request, matching)
│   │   ├── middleware/      # JWT verification & role-based access control (RBAC)
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Core business logic & database queries
│   │   ├── utils/           # Compatibility matrix, Haversine formula, Match Score
│   │   └── server.js        # Express app entry point
│   ├── tests/               # Integration test suites (auth, donor, hospital, request, matching, runAll)
│   ├── .env.example         # Template for environment variables
│   └── package.json         # Node dependencies & npm scripts
├── database/
│   ├── schema.sql           # Database schema definition (tables, constraints, indexes)
│   └── seed.sql             # Sample test data (users, donors, hospitals, requests)
├── docs/                    # Project roadmap, issues backlog, and scope definitions
├── web/                     # React web application (Hospital & Admin)
└── mobile/                  # React Native mobile application (Donor)
```

---

## 🚀 Local Development Setup

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher running locally (or Supabase/cloud instance)

---

### 2. Database Initialization

Create the database and execute the schema and seed scripts:

```bash
# Create the database
createdb smart_blood_donation

# Run schema migrations and seed sample records
psql -d smart_blood_donation -f database/schema.sql
psql -d smart_blood_donation -f database/seed.sql
```

---

### 3. Backend Setup & Configuration

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Configure your `.env` variables:

```env
PORT=5001
JWT_SECRET=your_super_secret_jwt_key_here
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_blood_donation
```

---

### 4. Running the Server

```bash
# Development mode (with nodemon auto-restart)
npm run dev

# Production start
npm start
```

The server will start at `http://localhost:5001`.

Check server health at:
- **Server status:** `GET http://localhost:5001/health`
- **Database connectivity:** `GET http://localhost:5001/db-test`

---

### 5. Running Automated Integration Tests

Run the complete integration test suite covering Auth, Donors, Hospitals, Blood Requests, Lifecycle state transitions, Proximity calculations, and Matching logic:

```bash
cd backend
npm test
```

---

## 📖 REST API Reference

Base URL: `http://localhost:5001/api`

### 1. Authentication (Public)

| Method | Endpoint | Description | Request Body | Response (200/201) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | `{ "email": "user@test.com", "password": "...", "role": "donor" \| "hospital" \| "admin" }` | `{ "message": "...", "user": { "id": 1, "email": "...", "role": "..." } }` |
| `POST` | `/auth/login` | Authenticate user & issue JWT | `{ "email": "user@test.com", "password": "..." }` | `{ "token": "<JWT_TOKEN>", "user": { "id": 1, "email": "...", "role": "..." } }` |

---

### 2. Donor Profile (`Authorization: Bearer <donor_jwt>`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/donors/profile` | Retrieve authenticated donor's profile | _None_ |
| `POST` | `/donors/profile` | Create donor profile | `{ "name": "John Doe", "phone": "0771234567", "blood_group": "O+", "latitude": 6.9271, "longitude": 79.8612 }` |
| `PUT` | `/donors/profile` | Update profile / toggle availability | `{ "available": false, "last_donation_date": "2026-06-01", "phone": "0779999999" }` |

---

### 3. Hospital Profile (`Authorization: Bearer <hospital_jwt>`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/hospitals/profile` | Retrieve authenticated hospital's profile | _None_ |
| `POST` | `/hospitals/profile` | Create hospital profile | `{ "name": "City General Hospital", "address": "123 Main St", "phone": "0112345678" }` |
| `PUT` | `/hospitals/profile` | Update hospital details | `{ "name": "...", "address": "...", "phone": "..." }` |

---

### 4. Blood Requests & Matching

| Method | Endpoint | Role | Description | Request Body / Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/requests` | `hospital` | Create a new emergency blood request | `{ "blood_group": "B+", "units_needed": 3, "urgency": "critical", "latitude": 6.9271, "longitude": 79.8612 }` |
| `GET` | `/requests/mine` | `hospital` | List all requests created by hospital | _None_ |
| `PUT` | `/requests/:id/status` | `hospital` | Advance request lifecycle | `{ "status": "matched" \| "completed" \| "cancelled" }` |
| `GET` | `/requests/:id/matches` | `hospital` | Get ranked eligible donors for request `:id` | Returns matched donors sorted by **Match Score** and distance |
| `GET` | `/requests/nearby` | `donor` | Get open requests matching donor's blood type | Returns open requests sorted by **Match Score**, urgency, and distance |

---

## 🎯 Smart Matching & Scoring Engine

The matching engine uses a 5-factor scoring model to rank donors and requests:

$$\textbf{Match Score} = \textbf{compatibility} + \textbf{eligibility} + \textbf{availability} + \textbf{proximity} + \textbf{urgency}$$

| Component | Max Pts | Logic |
| :--- | :--- | :--- |
| **1. Compatibility** | **30 pts** | Exact blood group match = **30**, compatible donor (e.g. `O-` $\to$ `B+`) = **25**, incompatible = **0** |
| **2. Proximity** | **25 pts** | Distance $\le 5$ km = **25 pts**, linearly decays to **5 pts** at 50 km, $> 50$ km = **2 pts** |
| **3. Urgency** | **20 pts** | `critical` = **20**, `high` = **15**, `medium` = **10**, `low` = **5** |
| **4. Eligibility** | **15 pts** | Last donation $\ge 56$ days ago or never donated = **15 pts**, $< 56$ days = **0 pts** |
| **5. Availability** | **10 pts** | `available: true` = **10 pts**, `available: false` = **0 pts** |

### Red Blood Cell Compatibility Matrix

- **Recipient O-**: O- only
- **Recipient O+**: O-, O+
- **Recipient A-**: O-, A-
- **Recipient A+**: O-, O+, A-, A+
- **Recipient B-**: O-, B-
- **Recipient B+**: O-, O+, B-, B+
- **Recipient AB-**: O-, A-, B-, AB-
- **Recipient AB+**: Universal recipient (accepts all blood types)

---

## 🔮 Roadmap & Next Steps

- **Phase 3**: Simple React Web (Hospital Dashboard) & React Native Mobile (Donor App)
- **Phase 4**: Production Dockerization, CI Pipeline & Cloud Deployment
- **Phase 5**: Google Gemini AI Urgency Analysis & Leaflet Interactive Maps