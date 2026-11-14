const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'users.db');
const JWT_SECRET = 'MY_SECRET_TOKEN';
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post('/register/', async (req, res) => {
  const { username, name, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).send({ message: 'Username is required' });
  }
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).send({ message: 'Name is required' });
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).send({ message: 'Password is required' });
  }
  if (password.length < 6) {
    return res.status(400).send({ message: 'Password is too short' });
  }

  try {
    const checkUserQuery = 'SELECT * FROM user WHERE username = ?;';
    const existingUser = await db.get(checkUserQuery, [username.trim()]);

    if (existingUser !== undefined) {
      return res.status(400).send({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserQuery = 'INSERT INTO user (username, name, password) VALUES (?, ?, ?);';
    await db.run(insertUserQuery, [username.trim(), name.trim(), hashedPassword]);

    res.status(200).send({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post('/login/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).send({ message: 'Username is required' });
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).send({ message: 'Password is required' });
  }

  try {
    const getUserQuery = 'SELECT * FROM user WHERE username = ?;';
    const dbUser = await db.get(getUserQuery, [username.trim()]);

    if (dbUser === undefined) {
      return res.status(400).send({ message: 'Invalid user' });
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordMatched) {
      return res.status(400).send({ message: 'Invalid password' });
    }

    const payload = { username: dbUser.username };
    const jwt_token = jwt.sign(payload, JWT_SECRET);
    res.status(200).send({ jwt_token });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = app;
