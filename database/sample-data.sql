
-- Sample Departments
INSERT INTO departments (id, name, code, is_active) VALUES
(gen_random_uuid(), 'Human Resources', 'HR', true),
(gen_random_uuid(), 'Information Technology', 'IT', true),
(gen_random_uuid(), 'Finance', 'FIN', true),
(gen_random_uuid(), 'Marketing', 'MKT', true),
(gen_random_uuid(), 'Operations', 'OPS', true);

-- Sample Designations
INSERT INTO designations (id, title, level, department_id, is_active) VALUES
(gen_random_uuid(), 'HR Manager', 5, (SELECT id FROM departments WHERE code = 'HR'), true),
(gen_random_uuid(), 'HR Executive', 3, (SELECT id FROM departments WHERE code = 'HR'), true),
(gen_random_uuid(), 'Software Engineer', 3, (SELECT id FROM departments WHERE code = 'IT'), true),
(gen_random_uuid(), 'Senior Software Engineer', 4, (SELECT id FROM departments WHERE code = 'IT'), true),
(gen_random_uuid(), 'Tech Lead', 5, (SELECT id FROM departments WHERE code = 'IT'), true),
(gen_random_uuid(), 'Finance Manager', 5, (SELECT id FROM departments WHERE code = 'FIN'), true),
(gen_random_uuid(), 'Accountant', 3, (SELECT id FROM departments WHERE code = 'FIN'), true);

-- Sample Users (Password: 'password123' - hashed)
INSERT INTO users (id, email, password_hash, role, is_active) VALUES
(gen_random_uuid(), 'admin@payflow.com', '$2b$10$rOzJx3J3YX8qX6K2V8Y3WOu0qYpHxGW1gBz2QzY8J3K2V8Y3WOu0qY', 'super_admin', true),
(gen_random_uuid(), 'hr@payflow.com', '$2b$10$rOzJx3J3YX8qX6K2V8Y3WOu0qYpHxGW1gBz2QzY8J3K2V8Y3WOu0qY', 'hr_admin', true),
(gen_random_uuid(), 'payroll@payflow.com', '$2b$10$rOzJx3J3YX8qX6K2V8Y3WOu0qYpHxGW1gBz2QzY8J3K2V8Y3WOu0qY', 'payroll_admin', true);

-- Sample Leave Types
INSERT INTO leave_types (id, name, code, max_days_per_year, carry_forward_allowed, encashment_allowed) VALUES
(gen_random_uuid(), 'Annual Leave', 'AL', 21, true, true),
(gen_random_uuid(), 'Sick Leave', 'SL', 12, false, false),
(gen_random_uuid(), 'Casual Leave', 'CL', 12, false, false),
(gen_random_uuid(), 'Maternity Leave', 'ML', 180, false, false),
(gen_random_uuid(), 'Paternity Leave', 'PL', 15, false, false);
