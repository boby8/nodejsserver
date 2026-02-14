# Node.js Backend Explained - For React Developers

## 🏗️ Architecture Overview

Think of your backend like this React analogy:
- **React**: Components → Props → State → Render
- **Node.js**: Routes → Middleware → Controllers → Services → Database

Your backend uses **Layered Architecture** (also called MVC-ish):

```
Request → Routes → Middleware → Controllers → Services → Database
Response ← Routes ← Middleware ← Controllers ← Services ← Database
```

---

## 📁 File Structure Explained

### 1. **server.js** - Entry Point
```javascript
import app from "./app.js";
import { env } from "./config/env.js";
import "./config/db.js"; // Initialize DB connection

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});
```

**React Analogy**: Like `index.js` or `main.tsx` - it's the entry point that starts your app.

**What it does**:
- Imports the Express app
- Initializes database connection (side effect import)
- Starts the HTTP server on a port (like React starts on port 3000/5173)
- `app.listen()` = Your server is now "running" (like React's dev server)

**Key Concept**: `app.listen()` is **blocking** - the server runs until you stop it (Ctrl+C).

---

### 2. **app.js** - Express App Configuration
```javascript
import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.route.js";
import authRoutes from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

app.use(errorHandler);

export default app;
```

**React Analogy**: Like your root `App.tsx` that sets up routing, providers, etc.

**What each part does**:

1. **`express()`**: Creates an Express application instance
   - Like `createRoot()` or creating a React app instance

2. **`app.use(cors())`**: Cross-Origin Resource Sharing middleware
   - Allows your React app (localhost:5173) to talk to backend (localhost:4000)
   - Without this, browser blocks requests (CORS error)

3. **`app.use(express.json())`**: JSON parsing middleware
   - Automatically parses JSON request bodies
   - Makes `req.body` available (like getting props in React)

4. **`app.use("/auth", authRoutes)`**: Mounts routes
   - All `/auth/*` requests go to `authRoutes`
   - Like React Router: `<Route path="/auth" element={AuthRoutes} />`

5. **`app.use(errorHandler)`**: Error handling middleware (MUST be last)
   - Catches any unhandled errors
   - Like React Error Boundaries

**Middleware Execution Order**: 
```
Request → cors → express.json() → routes → errorHandler → Response
```

---

### 3. **config/env.js** - Environment Variables
```javascript
import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "todo_db",
    user: process.env.DB_USER || "bobbysingh",
    password: process.env.DB_PASSWORD || "",
  },
};
```

**React Analogy**: Like `import.meta.env` in Vite or `.env` files

**What it does**:
- Loads variables from `.env` file
- Provides defaults with `||`
- Centralizes config (single source of truth)

**Why separate file?**: 
- Reusable across the app
- Easy to mock for testing
- Type safety (if using TypeScript)

**Security Note**: Never commit `.env` files! (They're in `.gitignore`)

---

### 4. **config/db.js** - Database Connection
```javascript
import pkg from "pg";
import { env } from "./env.js";

const { Pool } = pkg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
});
```

**React Analogy**: Like setting up a database context or API client

**What it does**:
- Creates a **connection pool** (reuses connections for performance)
- PostgreSQL driver (`pg` package)
- Event listeners for connection status

**Key Concepts**:

1. **Pool vs Single Connection**:
   ```javascript
   // Pool (good for servers):
   const pool = new Pool({ ... }); // Manages multiple connections
   await pool.query("SELECT ...");
   
   // Single connection (good for scripts):
   const client = new Client({ ... });
   await client.connect();
   ```

2. **Event Emitters**: 
   - `pool.on("connect", callback)` - Like React's `useEffect`
   - Fires when connection happens

3. **Why export `pool`?**: 
   - Shared across all services
   - Single connection pool (efficient)

---

## 🔄 Request Flow (The Complete Journey)

Let's trace a request: `POST /auth/login`

```
1. Request hits server (port 4000)
   ↓
2. app.js: cors middleware (allows request)
   ↓
3. app.js: express.json() middleware (parses JSON body)
   ↓
4. app.js: Routes matching → "/auth" matches → goes to authRoutes
   ↓
5. routes/auth.route.js: POST "/login" matches → calls login controller
   ↓
6. controllers/auth.controller.js: login() function
   - Extracts req.body (email, password)
   - Calls userService.loginUser()
   ↓
7. services/user.service.js: loginUser() function
   - Queries database
   - Hashes password
   - Generates JWT
   ↓
8. Back up the chain:
   - Service returns data → Controller → Route → Response
   ↓
9. If error anywhere: errorHandler middleware catches it
```

---

## 🛣️ Routes (routes/auth.route.js)

```javascript
import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
```

**React Analogy**: Like route definitions in React Router

**What it does**:
- `Router()` creates a mini-router (like `<Routes>` in React Router)
- `router.post()` = Handle POST requests
- `router.get()` = Handle GET requests
- `router.put()` = Handle PUT requests
- `router.delete()` = Handle DELETE requests

**HTTP Methods Explained**:
- **GET**: Read data (like `fetch(url)`)
- **POST**: Create data (like `fetch(url, { method: 'POST', body: ... })`)
- **PUT**: Update data (full replacement)
- **PATCH**: Update data (partial)
- **DELETE**: Delete data

**Route Parameters**:
```javascript
// In todo.route.js:
router.get("/:id", getTodoById); // :id is a parameter

// Access it:
req.params.id // Like useParams() in React Router
```

**Query Strings**:
```javascript
// URL: /todos?page=1&limit=10
req.query.page // "1"
req.query.limit // "10"
```

---

## 🎮 Controllers (controllers/auth.controller.js)

```javascript
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await userService.createUser({ email, password });
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ error: err.message });
    }
    next(err); // Pass to error handler
  }
};
```

**React Analogy**: Like event handlers or API functions in React components

**What `req`, `res`, `next` are**:

1. **`req` (Request)**: Incoming data
   ```javascript
   req.body      // Request body (from express.json())
   req.params    // URL parameters (:id)
   req.query     // Query strings (?page=1)
   req.headers   // HTTP headers
   req.user      // Custom (set by auth middleware)
   ```

2. **`res` (Response)**: Outgoing data
   ```javascript
   res.status(201).json({ ... })  // Send JSON with status code
   res.json({ ... })              // Send JSON (200 by default)
   res.send("text")               // Send text
   res.status(204).send()         // No content (delete)
   ```

3. **`next`**: Pass to next middleware/error handler
   ```javascript
   next()        // Continue to next middleware
   next(err)     // Pass error to error handler
   ```

**HTTP Status Codes**:
- `200` - OK (success)
- `201` - Created (successful creation)
- `204` - No Content (successful deletion)
- `400` - Bad Request (client error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error (server error)

**Error Handling Pattern**:
```javascript
try {
  // Do work
  res.json(data);
} catch (err) {
  if (err.message === "Specific error") {
    return res.status(400).json({ error: err.message });
  }
  next(err); // Generic error → error handler middleware
}
```

---

## 🔧 Services (services/user.service.js)

```javascript
export const createUser = async (data) => {
  const { email, password } = data;

  // Check if user exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
    [email, hashedPassword]
  );

  return result.rows[0];
};
```

**React Analogy**: Like utility functions or custom hooks that handle data logic

**What it does**:
- Contains **business logic** (what your app does)
- Database operations (queries)
- Data transformation
- No HTTP concerns (that's controllers)

**Why separate from controllers?**:
- **Reusability**: Service can be used by multiple controllers
- **Testability**: Easy to test without HTTP
- **Separation of Concerns**: Controllers = HTTP, Services = Business Logic

**Database Queries Explained**:

1. **Parameterized Queries** (SQL Injection Prevention):
   ```javascript
   // ❌ BAD (SQL Injection vulnerable):
   pool.query(`SELECT * FROM users WHERE email = '${email}'`);
   
   // ✅ GOOD (Parameterized):
   pool.query("SELECT * FROM users WHERE email = $1", [email]);
   ```
   - `$1`, `$2`, etc. are placeholders
   - Values passed as array (safe from injection)

2. **Query Result Structure**:
   ```javascript
   const result = await pool.query("SELECT * FROM users");
   result.rows        // Array of rows
   result.rows[0]     // First row
   result.rowCount    // Number of rows
   ```

3. **INSERT with RETURNING**:
   ```javascript
   // Returns the inserted row
   INSERT INTO users (...) VALUES (...) RETURNING id, email, created_at
   ```

**bcrypt Password Hashing**:
```javascript
// Hash password (one-way, can't reverse):
const hashed = await bcrypt.hash("password123", 10);
// 10 = salt rounds (higher = more secure but slower)

// Verify password:
const isValid = await bcrypt.compare("password123", hashed);
// Returns true/false
```

**JWT (JSON Web Tokens)**:
```javascript
// Sign (create) token:
const token = jwt.sign(
  { id: user.id, email: user.email },  // Payload (data in token)
  JWT_SECRET,                           // Secret key
  { expiresIn: "7d" }                   // Options
);

// Verify token:
const decoded = jwt.verify(token, JWT_SECRET);
// Returns { id: ..., email: ..., iat: ..., exp: ... }
```

**Token Structure**:
```
Header.Payload.Signature

Payload contains:
{
  id: 1,
  email: "user@example.com",
  iat: 1234567890,  // Issued at
  exp: 1234567890   // Expires at
}
```

---

## 🛡️ Middleware (middlewares/auth.middleware.js)

```javascript
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userService.getUserById(decoded.id);

    req.user = user; // Attach user to request
    next(); // Continue to next middleware/route handler
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    next(err);
  }
};
```

**React Analogy**: Like Higher-Order Components (HOC) or route guards

**What middleware does**:
- Runs **before** route handlers
- Can modify `req` or `res`
- Can stop request (`return res.status(...)`)
- Can continue (`next()`)

**Middleware Pattern**:
```javascript
// In a route file:
import { authenticate } from "../middlewares/auth.middleware.js";

// Protect a route:
router.get("/profile", authenticate, getProfile);
// Request → authenticate middleware → getProfile controller
```

**Authorization Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Standard format: `Bearer <token>`
- Client sends in headers: `headers: { Authorization: 'Bearer ' + token }`

**Common Middleware Types**:
1. **Authentication**: "Who are you?" (this middleware)
2. **Authorization**: "Can you do this?" (check permissions)
3. **Validation**: "Is data valid?" (check input)
4. **Logging**: "Log requests"
5. **Rate Limiting**: "Too many requests"

---

## ❌ Error Handling (middlewares/error.middleware.js)

```javascript
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: err.message || "Something went wrong",
  });
};
```

**React Analogy**: Like Error Boundaries

**Key Points**:
- **Must have 4 parameters**: `(err, req, res, next)`
- **Must be last middleware**: After all routes
- **Catches errors from**:
  - `next(err)` in controllers/middleware
  - Unhandled async errors
  - Thrown errors

**Error Flow**:
```javascript
// In controller:
try {
  await service.doSomething();
} catch (err) {
  next(err); // → Error handler
}

// Or:
throw new Error("Something went wrong"); // → Error handler
```

---

## 🔄 Async/Await in Backend

**Why async/await?**:
- Database queries are **asynchronous** (take time)
- Network requests are **asynchronous**
- Don't block the event loop

```javascript
// ❌ Without async/await (callback hell):
pool.query("SELECT * FROM users", (err, result) => {
  if (err) {
    // handle error
  } else {
    // handle result
    pool.query("SELECT * FROM todos", (err, todos) => {
      // nested callbacks...
    });
  }
});

// ✅ With async/await:
const users = await pool.query("SELECT * FROM users");
const todos = await pool.query("SELECT * FROM todos");
```

**Important**: 
- All route handlers should be `async`
- All service functions should be `async`
- Use `try/catch` for error handling

---

## 🎯 Advanced Concepts

### 1. **Transaction (Database)**
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO todos ...');
  
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```
- All or nothing: If one fails, all rollback
- Use for related operations

### 2. **Query Builder Pattern**
Instead of raw SQL, use libraries:
- **Prisma**: Type-safe, modern
- **Knex**: Query builder
- **Sequelize**: ORM (Object-Relational Mapping)

### 3. **Validation**
Use libraries like **Joi** or **Zod**:
```javascript
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.details[0].message });
```

### 4. **Environment-Specific Config**
```javascript
const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  // Production settings
} else {
  // Development settings
}
```

### 5. **File Upload**
Use **Multer**:
```javascript
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  req.file // File info
});
```

### 6. **Caching**
Use **Redis** for:
- Session storage
- API response caching
- Rate limiting

### 7. **Testing**
```javascript
import request from 'supertest';
import app from './app.js';

test('POST /auth/login', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({ email: 'test@test.com', password: '123456' });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
});
```

---

## 🔐 Security Best Practices

1. **Never store plain passwords** - Always hash (bcrypt)
2. **Use parameterized queries** - Prevent SQL injection
3. **Validate input** - Never trust client data
4. **Use HTTPS in production** - Encrypt traffic
5. **Set secure headers** - Use `helmet` package
6. **Rate limiting** - Prevent abuse
7. **CORS properly configured** - Only allow trusted origins
8. **Environment variables for secrets** - Never hardcode
9. **JWT expiration** - Set reasonable expiry times
10. **Error messages** - Don't leak sensitive info

---

## 📊 Request/Response Flow Diagram

```
┌─────────────┐
│   Client    │ (React App)
│  (Browser)  │
└──────┬──────┘
       │ HTTP Request
       │ POST /auth/login
       │ Body: { email, password }
       ▼
┌─────────────────────────────────┐
│        Express Server           │
│  ┌──────────────────────────┐   │
│  │  Middleware Stack        │   │
│  │  1. cors()               │   │
│  │  2. express.json()       │   │
│  └──────────┬───────────────┘   │
│             │                    │
│  ┌──────────▼───────────────┐   │
│  │     Route Handler        │   │
│  │  POST /auth/login        │   │
│  └──────────┬───────────────┘   │
│             │                    │
│  ┌──────────▼───────────────┐   │
│  │     Controller           │   │
│  │  login(req, res, next)   │   │
│  └──────────┬───────────────┘   │
│             │                    │
│  ┌──────────▼───────────────┐   │
│  │      Service             │   │
│  │  loginUser(data)         │   │
│  └──────────┬───────────────┘   │
│             │                    │
└─────────────┼────────────────────┘
              │
              ▼
      ┌───────────────┐
      │   Database    │
      │  PostgreSQL   │
      └───────┬───────┘
              │
              │ Query Result
              │
              ▼
      ┌───────────────┐
      │    Service    │
      │  Returns data │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │  Controller   │
      │  res.json()   │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │   Response    │
      │  { token, user }
      └───────┬───────┘
              │
              ▼
       ┌─────────────┐
       │   Client    │
       │  (Browser)  │
       └─────────────┘
```

---

## 🎓 Key Takeaways

1. **Layered Architecture**: Routes → Controllers → Services → Database
2. **Middleware**: Functions that run before route handlers
3. **Async/Await**: Essential for database operations
4. **Error Handling**: Use try/catch and error middleware
5. **Security**: Hash passwords, parameterized queries, validate input
6. **Environment Variables**: For configuration and secrets
7. **Request/Response**: `req` (incoming), `res` (outgoing)
8. **Status Codes**: Communicate success/failure
9. **JWT**: Stateless authentication tokens
10. **Connection Pooling**: Efficient database connections

---

## 🚀 Next Steps to Learn

1. **Add validation** (Joi/Zod)
2. **Add logging** (Winston/Pino)
3. **Add testing** (Jest/Supertest)
4. **Add TypeScript** (type safety)
5. **Add API documentation** (Swagger/OpenAPI)
6. **Add rate limiting**
7. **Add file uploads**
8. **Add email sending**
9. **Learn GraphQL** (alternative to REST)
10. **Learn WebSockets** (real-time)

---

This backend follows **RESTful API** principles and uses **Express.js** - the most popular Node.js framework. The architecture is clean, maintainable, and scalable! 🎉

