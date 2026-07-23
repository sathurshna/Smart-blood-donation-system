-- Donor table
CREATE TABLE donor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    phone VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE
);

-- Hospital table
CREATE TABLE hospital (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20)
);

-- Blood Request table
CREATE TABLE blood_request (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospital(id),
    blood_group VARCHAR(5) NOT NULL,
    units_needed INTEGER NOT NULL,
    urgency VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donation table
CREATE TABLE donation (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES blood_request(id),
    donor_id INTEGER REFERENCES donor(id),
    accepted_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE
)