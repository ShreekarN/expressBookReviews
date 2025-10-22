const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. You can now login." });
});

public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn]);
});

public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  const results = {};
  Object.keys(books).forEach(isbn => {
    const b = books[isbn];
    if (b.author && b.author.toLowerCase() === authorParam) {
      results[isbn] = b;
    }
  });
  if (Object.keys(results).length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).json(results);
});

public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();
  const results = {};
  Object.keys(books).forEach(isbn => {
    const b = books[isbn];
    if (b.title && b.title.toLowerCase() === titleParam) {
      results[isbn] = b;
    }
  });
  if (Object.keys(results).length === 0) {
    return res.status(404).json({ message: "No books found for this title" });
  }
  return res.status(200).json(results);
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews || {});
});

module.exports.general = public_users;
