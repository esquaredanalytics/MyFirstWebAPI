const fs = require("fs");
const path = require("path");

function logToFile(filename = "requests.log") {
    const filePath = path.join(filename);

    return (req, res, next) => {
        const start = Date.now();

        res.on("finish", () => {
            const ms = Date.now() - start;

            const line =
                `${new Date().toISOString()} ` +
                `${req.method} ${req.originalUrl} ` +
                `${res.statusCode} ${ms}ms\n`;

            fs.appendFile(filePath, line, (err) => {
                if (err) console.error("Failed to write log:", err.message);
            });
        });

        next();
    };
}

module.exports = logToFile;