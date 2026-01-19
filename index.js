require('dotenv').config();
const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// --- Database Connection ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Required for Azure PostgreSQL connection
    }
});

const auth = require("./middleware/auth");

// --- Routes ---
app.get('/', async (req, res) => {
    res.send("Welcome to the SWE4213 API!");
});

// Get Products
app.get("/products", auth.auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Login with Parameterized Query
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use $1, $2 for parameterized queries in pg to prevent SQL injection
        const query = "SELECT id, role FROM users WHERE email = $1 AND password = $2";
        const result = await pool.query(query, [email, password]);

        const user = result.rows[0];

        if (!user) {
            return res.status(401).send("Invalid email or password");
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, message: "Logged in successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Login Error");
    }
});

// Admin Route
app.get("/admin", auth.auth, auth.role("admin"), (req, res) => {
    res.json({ message: "Welcome to the admin panel" });
});

app.get("/init-db", async (req, res) => {
    const createTablesQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user'
        );

        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2)
        );

        -- Optional: Seed a test user (password: 'password123')
        -- In a real app, use bcrypt to hash this!
        INSERT INTO users (email, password, role) 
        VALUES ('test@example.com', 'password123', 'admin')
        ON CONFLICT (email) DO NOTHING;

        INSERT INTO products (name, price) 
        VALUES ('Initial Product', 99.99)
        ON CONFLICT DO NOTHING;
    `;

    try {
        await pool.query(createTablesQuery);
        res.status(200).send("<h1>Success!</h1><p>Database tables created and seeded.</p>");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Init Error: " + err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});