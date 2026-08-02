-- Users table: shared authentication for all roles
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'hospital', 'admin')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donors: profile data specific to donor role
CREATE TABLE donors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    blood_group VARCHAR(5) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE
);

-- Hospitals: profile data specific to hospital role
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20)
);

-- Blood requests created by hospitals
CREATE TABLE blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id),
    blood_group VARCHAR(5) NOT NULL,
    units_needed INTEGER NOT NULL,
    urgency VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donations: a donor accepting a specific request
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES blood_requests(id),
    donor_id INTEGER REFERENCES donors(id),
    accepted_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE
);