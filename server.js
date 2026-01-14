const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const jwt = require("jsonwebtoken");

const users = [
    { id: 1, name: "Ada Lovelace", email: "ada@example.com", password: "12345678", role: "admin"},
    { id: 2, name: "Alan Turing", email: "alan@example.com", password: "12345678", role: "user"},
];

const products = [
    { id: 1, name: "Bicycle", cost: 400, userId: 1 },
    { id: 2, name: "Car", cost: 10000, userId: 2 },
    { id: 3, name: "Laptop", cost: 900, userId: 1 },
    { id: 4, name: "Headphones", cost: 120, userId: 2 },
];

const logger = require("./middleware/logger");
const debug = require("./middleware/debug");
const auth = require("./middleware/auth")

app.use(express.json());

app.get("/", debug, logger("requests.log"), (req, res) => {
    res.send("Hello World!");
});

// Get Products
app.get("/products", auth.auth, (req, res) => {
    res.json(products);
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Note: Passwords should be encrypted for real apps!
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).send("Invalid email or password");

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: "Logged in successfully" });
});

// User specific routes
app.get("/admin", auth.auth, auth.role("admin"), (req, res) => {
    res.json({ message: "Welcome to the admin panel" });
});

app.listen(port, () => {
    console.log(`Example app running at http://localhost:${port}`);
});
