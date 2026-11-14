const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'users.db');

const sampleUsers = [
  { username: 'rahul_verma', name: 'Rahul Verma', password: 'Rahul@2026' },
  { username: 'priya_sharma', name: 'Priya Sharma', password: 'Priya@2026' },
  { username: 'ananya_reddy', name: 'Ananya Reddy', password: 'Ananya@2026' },
  { username: 'vikram_singh', name: 'Vikram Singh', password: 'Vikram@2026' },
  { username: 'sneha_patel', name: 'Sneha Patel', password: 'Sneha@2026' },
  { username: 'rohit_gupta', name: 'Rohit Gupta', password: 'Rohit@2026' },
  { username: 'kavya_nair', name: 'Kavya Nair', password: 'Kavya@2026' },
  { username: 'arjun_kumar', name: 'Arjun Kumar', password: 'Arjun@2026' },
  { username: 'pooja_iyer', name: 'Pooja Iyer', password: 'Pooja@2026' },
  { username: 'kiran_rao', name: 'Kiran Rao', password: 'Kiran@2026' }
];

const setupDatabase = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec('DROP TABLE IF EXISTS user;');

    await db.exec(`
      CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.run(
        'INSERT INTO user (username, name, password) VALUES (?, ?, ?);',
        [user.username, user.name, hashedPassword]
      );
    }

    console.log('Database successfully initialized with 10 sample users.');
    await db.close();
  } catch (error) {
    console.error(`Database setup error: ${error.message}`);
    process.exit(1);
  }
};

setupDatabase();
