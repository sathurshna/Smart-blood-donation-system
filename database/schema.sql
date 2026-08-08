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
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date DATE
);

-- Hospitals: profile data specific to hospital role
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20)
);

-- Blood requests created by hospitals
CREATE TABLE blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    units_needed INTEGER NOT NULL CHECK (units_needed > 0),
    urgency VARCHAR(20) CHECK (urgency IN ('low','medium','high','critical')),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','completed','cancelled')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donations: a donor accepting a specific request
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id INTEGER NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    accepted_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for common lookups
CREATE INDEX idx_donors_blood_group_available ON donors(blood_group, available);
CREATE INDEX idx_requests_status ON blood_requests(status);
CREATE INDEX idx_requests_blood_group ON blood_requests(blood_group);