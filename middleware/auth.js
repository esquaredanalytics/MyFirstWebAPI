const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Missing Authorization header" });

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Use Authorization: Bearer <token>" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

function role(requiredRole) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: "Not authenticated" });
        
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: "Access forbidden" });
        }

        next();
    };
}

module.exports = { auth, role };