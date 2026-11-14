| Information | Details | Additional Information |
| :--- | :--- | :--- |
| Student Name | SHIVA SHANKAR RANGAPURAM | |
| Student Registration Number | 252U1R5126 | Class & Section: 313 AI DE 2B |
| Study Level : UG/PG/Doctorate | UG | Year & Term: 2 & 2 |
| Subject Name | Backend Development Fundamentals | |
| Teacher / Faculty Name | Mr Yugandhar Gurjalwar | |
| Name of the Assessment | LAB REPORT - 4 | |
| Date of Submission | 14/11/2026 | |

# Lab 4: Registration, Login and JWT

## Objective

The objective of this laboratory assignment is to design and implement a secure, production-grade authentication and user management system using Node.js, Express.js, SQLite, bcrypt, and JSON Web Tokens (JWT). Key technical objectives include:
1. Designing and initializing a persistent SQLite database table (`user`) with columns for `id`, unique `username`, `name`, and bcrypt-hashed `password`.
2. Populating the database with 10 pre-seeded sample user accounts storing cryptographically salted and hashed passwords using `bcrypt.hash()` with 10 salt rounds.
3. Implementing the `POST /register/` endpoint to validate user inputs, check for duplicate usernames using parameterized SQL queries, reject duplicates with HTTP `400 Bad Request`, and store newly registered credentials with bcrypt hashing.
4. Implementing the `POST /login/` endpoint to verify username existence, compare plaintext passwords against stored hashes using `bcrypt.compare()`, reject invalid users and mismatched passwords with HTTP `400 Bad Request`, and generate a signed JSON Web Token upon successful credential verification.
5. Constructing the JWT payload containing strictly non-sensitive identity claims (`username` only, never plaintext or hashed passwords) signed with a secret key using `jwt.sign()`.
6. Decoding and verifying the structure of generated JSON Web Tokens (Header, Payload, Signature) using the JWT.io debugger.
7. Conducting comprehensive API testing across all positive and negative test cases via Postman, capturing verified dark-theme response proofs, and documenting database integrity.

---

## Technologies Used

- **Runtime Environment:** Node.js (v18+ / v24+)
- **Web Application Framework:** Express.js (v4.18.2)
- **Database Engine:** SQLite (v3) via `sqlite` and `sqlite3`
- **Password Hashing:** `bcrypt` / `bcryptjs` (Blowfish-based one-way cryptographic hashing with adaptive work factor)
- **Token-Based Authentication:** `jsonwebtoken` (JWT implementation following RFC 7519)
- **API Testing:** Postman v11
- **Database Inspection:** SQLite3 Command Line Interface (CLI)

---

## Folder Structure

```
lab-04/
├── .gitignore
├── README.md
├── app.js
├── package.json
├── screenshots/
│   ├── 01_post_register_success.png
│   ├── 02_post_register_duplicate_username_error.png
│   ├── 03_post_register_short_password_error.png
│   ├── 04_post_register_missing_fields_error.png
│   ├── 05_post_login_success_seed_user.png
│   ├── 06_post_login_success_new_registered_user.png
│   ├── 07_post_login_unknown_user_error.png
│   ├── 08_post_login_wrong_password_error.png
│   ├── 09_post_login_missing_password_error.png
│   ├── 10_jwt_debugger_verification_jwt_io.png
│   └── 11_sqlite_cli_verification.png
├── setupDb.js
└── users.db
```

---

## Database Design

The database `users.db` contains a single table named `user`. The design enforces uniqueness on the `username` attribute and ensures that raw passwords are never persisted.

### Schema Definition

```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);
```

### Data Dictionary

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique numeric identifier for each user record. |
| `username` | `TEXT` | `UNIQUE`, `NOT NULL` | Unique login username; indexed implicitly via UNIQUE constraint. |
| `name` | `TEXT` | `NOT NULL` | Full display name of the user. |
| `password` | `TEXT` | `NOT NULL` | One-way cryptographic hash of the password generated via bcrypt (60 characters). |

---

## Installation and Running Instructions

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Step 1: Navigate to Project Directory
```bash
cd backend-development-fundamentals/lab-04
```

### Step 2: Install Project Dependencies
```bash
npm install
```

### Step 3: Initialize Database and Seed Sample Users
Execute the setup script to drop existing tables, create the `user` table, and populate it with 10 sample accounts hashed with bcrypt:
```bash
npm run setup
```
*(Alternatively: `node setupDb.js`)*

### Step 4: Start the Express Application Server
```bash
npm start
```
*(Alternatively: `node app.js`)*

The server will listen at:
```
http://localhost:3000/
```

---

## API Endpoints

| HTTP Method | Route | Request Body | Success Status | Error Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register/` | `{ "username": string, "name": string, "password": string }` | `200 OK` | `400 Bad Request`, `500 Internal Server Error` | Validates required fields, checks for duplicate usernames, hashes password with bcrypt (10 rounds), and stores new user. |
| `POST` | `/login/` | `{ "username": string, "password": string }` | `200 OK` | `400 Bad Request`, `500 Internal Server Error` | Validates input, verifies username in SQLite DB, verifies password via `bcrypt.compare()`, and returns signed `{ "jwt_token": string }`. |

---

## Complete Source Code

### `package.json`
```json
{
  "name": "lab-04-registration-login-jwt",
  "version": "1.0.0",
  "description": "Registration, Login and JWT Authentication API using Node.js, Express.js, SQLite, bcrypt and jsonwebtoken",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "setup": "node setupDb.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "sqlite": "^5.1.1",
    "sqlite3": "^5.1.6"
  }
}
```

### `.gitignore`
```
node_modules/
.env
```

### `setupDb.js`
```javascript
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
```

### `app.js`
```javascript
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
```

---

## Test Results and Screenshots

### 1. User Registration - Successful Registration (`200 OK`)
Testing `POST /register/` with valid username, full name, and a password >= 6 characters. The password is hashed using bcrypt, persisted in SQLite, and a success message is returned.
![User Registration - Successful Registration](screenshots/01_post_register_success.png)

### 2. User Registration - Duplicate Username Error (`400 Bad Request`)
Testing `POST /register/` attempting to register with an existing username (`rahul_verma`). The query detects the existing record and rejects registration with `"User already exists"`.
![User Registration - Duplicate Username Error](screenshots/02_post_register_duplicate_username_error.png)

### 3. User Registration - Password Too Short Error (`400 Bad Request`)
Testing `POST /register/` where the submitted password has fewer than 6 characters (`123`). The validation catches the violation and responds with `"Password is too short"`.
![User Registration - Password Too Short Error](screenshots/03_post_register_short_password_error.png)

### 4. User Registration - Missing Fields Validation (`400 Bad Request`)
Testing `POST /register/` when required fields (`username`) are omitted from the request body. The API catches missing attributes and returns `"Username is required"`.
![User Registration - Missing Fields Validation](screenshots/04_post_register_missing_fields_error.png)

### 5. User Login - Seed User Success (`200 OK`)
Testing `POST /login/` with valid pre-seeded credentials (`rahul_verma` / `Rahul@2026`). The server verifies the user, compares the bcrypt hash, generates a signed JWT, and returns `{ "jwt_token": "..." }`.
![User Login - Seed User Success](screenshots/05_post_login_success_seed_user.png)

### 6. User Login - Newly Registered User Success (`200 OK`)
Testing `POST /login/` using the credentials created in Step 1 (`siddharth_j` / `SidPassword@2026`). Proves that dynamically registered users with bcrypt hashes can authenticate seamlessly.
![User Login - Newly Registered User Success](screenshots/06_post_login_success_new_registered_user.png)

### 7. User Login - Unknown User Error (`400 Bad Request`)
Testing `POST /login/` with a non-existent username (`unknown_account`). The database query returns `undefined`, triggering an immediate `400 Bad Request` with `"Invalid user"`.
![User Login - Unknown User Error](screenshots/07_post_login_unknown_user_error.png)

### 8. User Login - Wrong Password Error (`400 Bad Request`)
Testing `POST /login/` with a valid username (`rahul_verma`) but incorrect password (`WrongPassword@2026`). `bcrypt.compare()` resolves to `false`, and the server returns `"Invalid password"`.
![User Login - Wrong Password Error](screenshots/08_post_login_wrong_password_error.png)

### 9. User Login - Missing Password Field (`400 Bad Request`)
Testing `POST /login/` where the request body provides only the username without a password. The validation handler catches the missing property and rejects the request.
![User Login - Missing Password Field](screenshots/09_post_login_missing_password_error.png)

### 10. JWT Verification & Debugging at JWT.io
Decoding the generated JWT token on the JWT.io debugger. The inspection confirms that the Header indicates `HS256`, the Payload contains strictly `{ "username": "rahul_verma", "iat": ... }` (never the password), and the HMACSHA256 signature validates with the shared secret.
![JWT Verification & Debugging at JWT.io](screenshots/10_jwt_debugger_verification_jwt_io.png)

### 11. SQLite CLI Database Verification
Terminal session in SQLite CLI inspecting `users.db`. Confirms table schema, displays all 10 pre-seeded accounts alongside newly registered accounts, and verifies that every password column strictly holds a 60-character bcrypt hash string.
![SQLite CLI Database Verification](screenshots/11_sqlite_cli_verification.png)

---

## JSON Web Token (JWT) Architecture and Explanation

### What is a JSON Web Token?
A JSON Web Token (RFC 7519) is a compact, URL-safe means of representing claims to be transferred between two parties. In client-server authentication architectures, it is commonly used for stateless authorization.

### Structure of a JWT
A standard JWT consists of three distinct parts separated by dots (`.`):
$$\text{JWT} = \text{Base64Url}(\text{Header}) + \text{"."} + \text{Base64Url}(\text{Payload}) + \text{"."} + \text{Signature}$$

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsX3Zlcm1hIiwiaWF0IjoxNzk0NjY0MTc3fQ.l633giWCep4cUZ7j9IQUc_TFnwIPqVGpdx4PuA2c7YE
[------------- HEADER -------------] [---------------- PAYLOAD -----------------] [---------------- SIGNATURE ----------------]
```

1. **Header:**
   Identifies the token type (`JWT`) and the cryptographic signing algorithm being used (such as HMAC SHA-256 or RSA):
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```
2. **Payload:**
   Contains the claims (statements about an entity and additional metadata). Standard claims include registered claims (like `iat` for issued-at time or `exp` for expiration), public claims, and private claims:
   ```json
   {
     "username": "rahul_verma",
     "iat": 1794664177
   }
   ```
   > **Security Imperative:** The payload is merely Base64Url-encoded, **not encrypted**. Anyone with access to the token string can decode and read the payload. Therefore, passwords, credit card numbers, or proprietary secrets must **never** be placed inside the payload.
3. **Signature:**
   Guarantees the integrity and authenticity of the token. To create the signature:
   ```
   HMACSHA256(
     base64UrlEncode(header) + "." +
     base64UrlEncode(payload),
     secret
   )
   ```
   If an attacker tampers with any character in either the Header or Payload, the signature recalculation on the server fails, and the request is rejected immediately.

### Authentication Workflow
```
[ Client ]                                     [ Express Server ]                    [ SQLite DB ]
    |                                                  |                                   |
    |---- 1. POST /login/ { username, password } ----->|                                   |
    |                                                  |---- 2. Query user by username --->|
    |                                                  |<--- 3. Return user record --------|
    |                                                  |                                   |
    |                                                  |-- 4. bcrypt.compare(pass, hash) --|
    |                                                  |-- 5. jwt.sign({ username }, key) -|
    |                                                  |                                   |
    |<--- 6. Return { jwt_token } ---------------------|                                   |
    |                                                  |                                   |
    |---- 7. Subsequent Requests (Bearer Token) ------>|                                   |
    |                                                  |-- 8. jwt.verify(token, key) ------|
    |                                                  |-- 9. Process protected route -----|
    |<--- 10. Protected Response ----------------------|                                   |
```

---

## Viva Questions and Answers

### Q1: Why POST for login?
**Answer:**
Login requests must always use the `POST` HTTP method rather than `GET` for the following fundamental security and architectural reasons:
1. **Exposure in URLs:** A `GET` request sends parameters inside the URL query string (`/login?username=...&password=...`). URL query strings are routinely cached by web browsers, recorded in plain text in browser history, written to web server access logs, network proxy logs, and transmitted via HTTP `Referer` headers. Using `POST` transmits credentials inside the HTTP request body, preventing exposure across logs and caching tiers.
2. **Semantics and State Creation:** In REST and web architecture, `GET` requests are specified as safe and idempotent (they should not alter server state or produce session side effects). A login action frequently creates an active authentication session or issues a fresh cryptographic token, which constitutes state generation.
3. **Payload Size and Complexity:** The request body in `POST` allows structured JSON or form-encoded payloads without URL character length limits or encoding constraints.

### Q2: Hash vs Encrypt?
**Answer:**
| Feature | Hashing | Encryption |
| :--- | :--- | :--- |
| **Directionality** | **One-way** mathematical transformation. It is computationally infeasible to reverse a hash back to its original input. | **Two-way** cryptographic transformation. Data can be decrypted back to plaintext using the appropriate key. |
| **Key Requirement** | Does not require a decryption key. Uses algorithms such as bcrypt, Argon2, PBKDF2, or SHA-256. | Requires cryptographic keys (symmetric like AES where encryption and decryption keys match, or asymmetric like RSA with public/private pairs). |
| **Primary Use Cases** | Password storage, digital signatures, message integrity checks, checksums. | Confidential data storage, encrypted communications (HTTPS/TLS), secret messaging. |
| **Password Application** | Passwords must **always be hashed** (with salt). If the database is compromised, attackers cannot read plaintext passwords. Verification is performed by hashing the attempted password and comparing the resulting hashes. | Storing passwords using encryption is insecure because anyone who obtains the decryption key can recover every user's original plaintext password. |

### Q3: What does `jwt.sign()` need?
**Answer:**
In the Node.js `jsonwebtoken` library, the `jwt.sign()` function requires the following core arguments:
1. **Payload (`payload`):** An object, buffer, or string containing the claims. In standard authentication, this is an object identifying the user (e.g., `{ username: user.username }`).
2. **Secret or Private Key (`secretOrPrivateKey`):** The secret key string (for symmetric HMAC algorithms like `HS256`) or the private key (for asymmetric algorithms like `RS256`).
3. **Options Object (Optional):** Configuration parameters including:
   - `algorithm`: The signing algorithm (defaults to `'HS256'`).
   - `expiresIn`: Token lifespan (e.g., `'1h'`, `'24h'`, `3600`).
   - `issuer`: String identifying the token issuer (`iss`).
   - `subject`: Subject of the token (`sub`).

Syntax:
```javascript
const jwtToken = jwt.sign(payload, secretKey, [options]);
```

### Q4: What should never go into the payload?
**Answer:**
The following types of data must **never** be placed inside a JWT payload:
1. **Passwords and Password Hashes:** Neither plaintext passwords nor hashed passwords should ever be included.
2. **Personally Identifiable & Sensitive Data (PII):** Social Security Numbers, government IDs, bank details, credit card numbers, or medical records.
3. **Proprietary Secrets and Keys:** API keys, database credentials, server private keys, or internal configuration secrets.
4. **Excessively Large Objects:** Since the JWT is transmitted in HTTP request headers on every subsequent request, putting massive objects into the payload introduces network latency and risks header size limit rejections (HTTP `431 Request Header Fields Too Large`).

*Reason:* The JWT payload is only Base64Url-encoded, not encrypted. Any client, proxy, or man-in-the-middle observer can instantly decode the payload into readable JSON.

---

## Debugging Notes & Failure Modes Addressed

1. **Native C++ Addon Compilation Failures on Node.js v24:**
   - *Problem:* Running native `sqlite3` and `bcrypt` modules compiled for earlier Node versions resulted in `ERR_DLOPEN_FAILED` DLL initialization errors on Windows due to binary ABI incompatibilities.
   - *Solution:* Implemented clean compatibility adapters utilizing Node 24's built-in `node:sqlite` DatabaseSync engine conforming to the SQLite3 callback API, and aliased pure JavaScript `bcryptjs` under the `bcrypt` namespace. This ensured full compliance with `package.json` specifications and zero-failure execution across modern Node runtimes.
2. **Duplicate Username Integrity Checks:**
   - *Problem:* Attempting to register an already taken username without explicit checks would trigger uncaught SQLite `SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username` database exceptions, terminating or returning unhandled 500 errors.
   - *Solution:* Added a pre-emptive query `SELECT * FROM user WHERE username = ?;` inside the `/register/` route to return an explicit, descriptive HTTP `400 Bad Request` with `{ "message": "User already exists" }`.
3. **Plaintext Password Leaks:**
   - *Problem:* Accidental inclusion of password fields in SQL queries or response payloads could expose user credentials.
   - *Solution:* Ensured that `setupDb.js` and `/register/` hash all passwords before executing SQLite `INSERT` statements. Confirmed that JWT token generation payload contains solely `{ username: dbUser.username }`.
4. **SQL Injection Vulnerabilities:**
   - *Problem:* Concatenating user inputs directly into SQL queries allows attackers to bypass authentication or extract sensitive tables.
   - *Solution:* Parameterized all SQLite statements using `?` placeholders with parameterized parameter arrays (`[username.trim()]`), completely preventing SQL injection.

---

## Conclusion

Lab 4 was completed successfully. The RESTful user registration, login, password hashing, and JWT issuance system was constructed, verified, and documented according to the course specifications. Key achievements include:
- A structured SQLite database (`users.db`) with unique username constraints and 10 pre-seeded accounts.
- Password security enforced via bcrypt one-way salted hashing.
- Standardized REST endpoints `/register/` and `/login/` with validation and error handling.
- RFC 7519-compliant JSON Web Token issuance containing non-sensitive identity claims.
- Complete Postman and SQLite CLI test verification documented with dark-theme screenshots.
