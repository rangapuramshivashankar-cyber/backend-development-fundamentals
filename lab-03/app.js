const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(3000, () => {
      console.log('Server Running on port 3000');
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get('/books/', async (req, res) => {
  const {
    search_q = '',
    order_by = 'id',
    order = 'ASC',
    limit = 10,
    offset = 0,
    min_price,
    max_price
  } = req.query;

  const validColumns = ['id', 'title', 'author', 'price', 'pages'];
  const sanitizedOrderBy = validColumns.includes(order_by.toLowerCase()) ? order_by.toLowerCase() : 'id';
  const sanitizedOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let priceFilterQuery = '';
  const queryParams = [`%${search_q}%`];

  if (min_price !== undefined && max_price !== undefined) {
    priceFilterQuery = ' AND price BETWEEN ? AND ?';
    queryParams.push(Number(min_price), Number(max_price));
  } else if (min_price !== undefined) {
    priceFilterQuery = ' AND price >= ?';
    queryParams.push(Number(min_price));
  } else if (max_price !== undefined) {
    priceFilterQuery = ' AND price <= ?';
    queryParams.push(Number(max_price));
  }

  queryParams.push(Number(limit), Number(offset));

  const getBooksQuery = `
    SELECT *
    FROM book
    WHERE title LIKE ?${priceFilterQuery}
    ORDER BY ${sanitizedOrderBy} ${sanitizedOrder}
    LIMIT ? OFFSET ?;
  `;

  try {
    const books = await db.all(getBooksQuery, queryParams);
    res.status(200).send(books);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  const getBookQuery = 'SELECT * FROM book WHERE id = ?;';
  try {
    const book = await db.get(getBookQuery, [bookId]);
    if (book === undefined) {
      res.status(404).send({ message: 'Book Not Found' });
    } else {
      res.status(200).send(book);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post('/books/', async (req, res) => {
  const { title, author, price, pages } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).send({ message: 'Title is required' });
  }
  if (!author || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).send({ message: 'Author is required' });
  }
  if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
    return res.status(400).send({ message: 'Price must be a valid non-negative number' });
  }
  if (pages === undefined || pages === null || typeof pages !== 'number' || isNaN(pages) || pages < 0) {
    return res.status(400).send({ message: 'Pages must be a valid non-negative number' });
  }

  const addBookQuery = 'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);';
  try {
    const dbResponse = await db.run(addBookQuery, [title.trim(), author.trim(), price, pages]);
    res.status(201).send({
      bookId: dbResponse.lastID,
      message: 'Book Added Successfully'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.put('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  const { title, author, price, pages } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).send({ message: 'Title is required' });
  }
  if (!author || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).send({ message: 'Author is required' });
  }
  if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
    return res.status(400).send({ message: 'Price must be a valid non-negative number' });
  }
  if (pages === undefined || pages === null || typeof pages !== 'number' || isNaN(pages) || pages < 0) {
    return res.status(400).send({ message: 'Pages must be a valid non-negative number' });
  }

  try {
    const checkBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const book = await db.get(checkBookQuery, [bookId]);
    if (book === undefined) {
      return res.status(404).send({ message: 'Book Not Found' });
    }

    const updateBookQuery = 'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;';
    await db.run(updateBookQuery, [title.trim(), author.trim(), price, pages, bookId]);
    res.status(200).send({ message: 'Book Updated Successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  try {
    const checkBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const book = await db.get(checkBookQuery, [bookId]);
    if (book === undefined) {
      return res.status(404).send({ message: 'Book Not Found' });
    }

    const deleteBookQuery = 'DELETE FROM book WHERE id = ?;';
    await db.run(deleteBookQuery, [bookId]);
    res.status(200).send({ message: 'Book Deleted Successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = app;
