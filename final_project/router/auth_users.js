const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];

const isValid = (username) => {
  return typeof username === "string" && username.trim().length > 0;
};

const authenticatedUser = (username, password) => {
  if (!username || !password) return false;
  const user = users.find(u => u.username === username && u.password === password);
  return !!user;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken };
  req.session.username = username;
  return res.status(200).json({ message: "User successfully logged in", accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review || req.body.review;
  let username = (req.user && req.user.username) || (req.session && req.session.username);
  if (!username && req.session && req.session.authorization && req.session.authorization.accessToken) {
    try {
      const payload = jwt.verify(req.session.authorization.accessToken, "access");
      username = payload.username;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  if (!username) return res.status(401).json({ message: "Not authenticated" });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  if (!reviewText) return res.status(400).json({ message: "Review text is required" });
  if (!books[isbn].reviews) books[isbn].reviews = {};
  books[isbn].reviews[username] = reviewText;
  return res.status(200).json({ message: "Review added/modified", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let username = (req.user && req.user.username) || (req.session && req.session.username);
  if (!username && req.session && req.session.authorization && req.session.authorization.accessToken) {
    try {
      const payload = jwt.verify(req.session.authorization.accessToken, "access");
      username = payload.username;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  if (!username) return res.status(401).json({ message: "Not authenticated" });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on the given ISBN" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
