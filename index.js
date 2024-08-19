const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Create and connect the database connection once
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'online_bookstore' // Assuming 'online_bookstore' has both books and users tables
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit the process if the connection fails
  }
  console.log('Connected to MySQL');
});

// Routes for Books
app.get('/list', (req, res) => {
  db.query('SELECT * FROM books', (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query' });
    }
    res.json(data);
  });
});

app.get('/german', (req, res) => {
  db.query('SELECT * FROM books where info = "German"', (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query' });
    }
    res.json(data);
    // console.log(data);
  });
});
app.get('/french', (req, res) => {
  db.query('SELECT * FROM books where info = "French"', (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query' });
    }
    res.json(data);
    // console.log(data);
  });
});
app.get('/spanish', (req, res) => {
  db.query('SELECT * FROM books where info = "Spanish"', (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query' });
    }
    res.json(data);
    // console.log(data);
  });
});

app.get('/book/:id', (req, res) => {
  const bookId = req.params.id;

  db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query' });
    }
    res.json(data);
  });
});

// User Registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    // Insert the new user into the database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hash], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Error registering the user' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// User Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error logging in' });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result[0];

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
        console.log('login');
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
        console.log('login fail');
      }
    });
  });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
