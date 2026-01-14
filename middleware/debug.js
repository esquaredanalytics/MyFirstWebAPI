function debug(req, res, next) {
    console.log("---- DEBUG ----");
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Body:", req.body);
    console.log("--------------");
    next();
}

module.exports = debug;
