-- 1. Create the Users table (needed for /login)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- 2. Create the Products table (needed for /products)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert a test admin user (so you can test the /login route)
-- NOTE: In production, you would hash this password!
INSERT INTO users (email, password, role) 
VALUES ('admin@unb.ca', 'password123', 'admin');

-- 4. Insert a test product
INSERT INTO products (name, description, price) 
VALUES ('Calculus Textbook', 'Slightly used, mandatory for MATH1003', 45.00);