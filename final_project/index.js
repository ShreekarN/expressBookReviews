const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
app.use(express.json());
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));
app.use("/customer/auth/*", function auth(req, res, next) {
  try {
    const authorization = req.session && req.session.authorization;
    if (!authorization) {
      return res.status(401).json({ message: "User not logged in (no session authorization)" });
    }
    const token = authorization['accessToken'] || authorization.accessToken;
    if (!token) {
      return res.status(401).json({ message: "No access token found in session" });
    }
    const SECRET = "access";
    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token", error: err.message });
    }
    req.user = payload;
    if (payload && payload.username) req.username = payload.username;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Authentication middleware error", error: err.message });
  }
});
const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.listen(PORT, () => console.log("Server is running on port " + PORT));
