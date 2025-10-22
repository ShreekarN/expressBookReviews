const axios = require('axios');
const BASE = "http://localhost:5000";

async function getAllBooksAsync() {
  try {
    const res = await axios.get(`${BASE}/`);
    console.log("Task10 - all books:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Task10 error:", err.message);
  }
}

function getBookByISBN_Promise(isbn) {
  return axios.get(`${BASE}/isbn/${isbn}`)
    .then(res => console.log("Task11 - book by ISBN:", JSON.stringify(res.data, null, 2)))
    .catch(err => console.error("Task11 error:", err.message));
}

function getBooksByAuthor(author) {
  return axios.get(`${BASE}/author/${encodeURIComponent(author)}`)
    .then(res => console.log("Task12 - books by author:", JSON.stringify(res.data, null, 2)))
    .catch(err => console.error("Task12 error:", err.message));
}

function getBooksByTitle(title) {
  return axios.get(`${BASE}/title/${encodeURIComponent(title)}`)
    .then(res => console.log("Task13 - books by title:", JSON.stringify(res.data, null, 2)))
    .catch(err => console.error("Task13 error:", err.message));
}

(async () => {
  await getAllBooksAsync();
  await getBookByISBN_Promise("1");
  await getBooksByAuthor("Jane Austen");
  await getBooksByTitle("Pride and Prejudice");
})();
