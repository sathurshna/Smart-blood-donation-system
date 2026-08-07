-- Sample hospital
INSERT INTO users (email, password_hash, role) VALUES
('cityhospital@test.com', '$2b$10$placeholderhashvalueforseeddata000000000', 'hospital');

INSERT INTO hospitals (user_id, name, address, phone) VALUES
(currval('users_id_seq'), 'City General Hospital', '123 Main St, Colombo', '0112345678');

-- Sample donors
INSERT INTO users (email, password_hash, role) VALUES
('donor2@test.com', '$2b$10$placeholderhashvalueforseeddata000000000', 'donor');

INSERT INTO donors (user_id, name, phone, blood_group, latitude, longitude, available, last_donation_date) VALUES
(currval('users_id_seq'), 'Nimal Perera', '0771234567', 'O+', 6.9271, 79.8612, TRUE, '2026-04-01');

-- Sample blood request
INSERT INTO blood_requests (hospital_id, blood_group, units_needed, urgency, latitude, longitude, status) VALUES
(1, 'O+', 2, 'critical', 6.9280, 79.8620, 'open');