# 🔐 Authentication Flow - Complete Detailed Explanation

This document explains the **complete flow** of how authentication works in your app, from user clicking a button to receiving a response.

---

## 📋 Table of Contents
1. [Signup Flow](#signup-flow)
2. [Login Flow](#login-flow)
3. [Protected Request Flow](#protected-request-flow)
4. [Logout Flow](#logout-flow)
5. [Token Storage & Usage](#token-storage--usage)

---

## 🆕 SIGNUP FLOW

### Complete Journey: User Clicks "Sign Up" → Database Saved → Auto Login

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Interaction
────────────────────────
User fills form and clicks "Sign Up" button

Location: src/components/Signup.tsx

Code:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    await signup({ email, password }); // ← Calls AuthContext
  };


Step 2: AuthContext Signup Function
────────────────────────────────────
Location: src/context/AuthContext.tsx

Code:
  const signup = async (data: SignupData) => {
    await authApi.signup(data);  // ← Step 3: API call
    await login(data);            // ← Step 7: Auto login after signup
  };


Step 3: API Service Call
─────────────────────────
Location: src/services/authApi.ts

Code:
  async signup(data: SignupData) {
    const response = await fetch("http://localhost:4000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),  // { email: "...", password: "..." }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to sign up");
    }

    return response.json();  // { message: "...", user: {...} }
  }

HTTP Request Sent:
──────────────────
POST http://localhost:4000/auth/signup
Headers:
  Content-Type: application/json
Body:
  {
    "email": "user@example.com",
    "password": "password123"
  }
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js/Express)                     │
└─────────────────────────────────────────────────────────────────────┘

Step 4: Request Arrives at Server
──────────────────────────────────
Location: src/app.js

Request hits Express server on port 4000

Middleware Execution Order:
1. cors() - Allows request from frontend origin
2. express.json() - Parses JSON body → req.body = { email, password }
3. Route matching: "/auth" matches → goes to authRoutes


Step 5: Route Handler
─────────────────────
Location: src/routes/auth.route.js

Code:
  router.post("/signup", signup);  // ← Calls controller

Route matched: POST /auth/signup
Controller function called: signup(req, res, next)


Step 6: Controller Processing
──────────────────────────────
Location: src/controllers/auth.controller.js

Code:
  export const signup = async (req, res, next) => {
    try {
      // Extract data from request body (parsed by express.json())
      const { email, password } = req.body;
      // req.body = { email: "user@example.com", password: "password123" }

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Call service layer
      const user = await userService.createUser({ email, password });
      // ← Step 7: Service function

      // Success response
      res.status(201).json({ 
        message: "User created successfully", 
        user: { id: 1, email: "user@example.com", created_at: "..." }
      });
    } catch (err) {
      if (err.message === "User already exists") {
        return res.status(409).json({ error: err.message });
      }
      next(err);  // Pass to error handler
    }
  };


Step 7: Service Layer - Business Logic
───────────────────────────────────────
Location: src/services/user.service.js

Code:
  export const createUser = async (data) => {
    const { email, password } = data;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    // ← Step 8: Database query

    if (existingUser.rows.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password (one-way encryption)
    const hashedPassword = await bcrypt.hash(password, 10);
    // "password123" → "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    // (salt rounds = 10, cannot be reversed)

    // Insert user into database
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, hashedPassword]
    );
    // ← Step 9: Database insert

    // Return created user (without password)
    return result.rows[0];
    // { id: 1, email: "user@example.com", created_at: "2024-01-01T12:00:00Z" }
  };


Step 8 & 9: Database Operations
────────────────────────────────
Location: PostgreSQL Database

Query 1: Check existing user
  SELECT id FROM users WHERE email = $1
  Parameters: ["user@example.com"]
  Result: [] (empty, user doesn't exist)

Query 2: Insert new user
  INSERT INTO users (email, password) 
  VALUES ($1, $2) 
  RETURNING id, email, created_at
  Parameters: ["user@example.com", "$2a$10$..."]
  
  Database stores:
    id: 1 (auto-increment)
    email: "user@example.com"
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye..." (hashed)
    created_at: "2024-01-01 12:00:00" (auto timestamp)

  Returns:
    { id: 1, email: "user@example.com", created_at: "2024-01-01T12:00:00Z" }


Step 10: Response Sent Back
────────────────────────────
HTTP Response:
  Status: 201 Created
  Headers:
    Content-Type: application/json
  Body:
    {
      "message": "User created successfully",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "created_at": "2024-01-01T12:00:00Z"
      }
    }
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React) - Continued                 │
└─────────────────────────────────────────────────────────────────────┘

Step 11: Response Received
───────────────────────────
Location: src/services/authApi.ts

Response received in fetch promise:
  {
    message: "User created successfully",
    user: { id: 1, email: "user@example.com", created_at: "..." }
  }

Returned to AuthContext.signup()


Step 12: Auto Login After Signup
─────────────────────────────────
Location: src/context/AuthContext.tsx

After signup succeeds, automatically calls login:

  const signup = async (data: SignupData) => {
    await authApi.signup(data);  // ✅ Signup complete
    await login(data);            // ← Automatically login user
  };

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    // ← Step 13: Login API call (see Login Flow)
    
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

After login completes:
  - Token stored in localStorage
  - User stored in localStorage
  - State updated (setToken, setUser)
  - Component re-renders
  - User sees Todo App (authenticated state)
```

---

## 🔑 LOGIN FLOW

### Complete Journey: User Enters Credentials → Token Received → Stored Locally

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Interaction
────────────────────────
User enters email/password and clicks "Login"

Location: src/components/Login.tsx

Code:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await login({ email, password }); // ← Calls AuthContext
  };


Step 2: AuthContext Login Function
───────────────────────────────────
Location: src/context/AuthContext.tsx

Code:
  const login = async (data: LoginData) => {
    const response = await authApi.login(data);  // ← Step 3: API call
    
    // Store authentication data
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };


Step 3: API Service Call
─────────────────────────
Location: src/services/authApi.ts

Code:
  async login(data: LoginData) {
    const response = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to login");
    }

    return response.json();
    // Returns: { token: "eyJhbGc...", user: { id, email, created_at } }
  }

HTTP Request:
─────────────
POST http://localhost:4000/auth/login
Headers:
  Content-Type: application/json
Body:
  {
    "email": "user@example.com",
    "password": "password123"
  }
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js/Express)                     │
└─────────────────────────────────────────────────────────────────────┘

Step 4: Request Processing
───────────────────────────
Location: src/app.js

Middleware:
1. cors() - Allows request
2. express.json() - Parses body → req.body = { email, password }
3. Route: "/auth" → authRoutes


Step 5: Route Handler
─────────────────────
Location: src/routes/auth.route.js

Code:
  router.post("/login", login);

Controller called: login(req, res, next)


Step 6: Controller Processing
──────────────────────────────
Location: src/controllers/auth.controller.js

Code:
  export const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Call service
      const result = await userService.loginUser({ email, password });
      // ← Step 7: Service function

      // Success response with token
      res.json(result);
      // Returns: { token: "...", user: {...} }
    } catch (err) {
      if (err.message === "Invalid credentials") {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  };


Step 7: Service Layer - Authentication Logic
─────────────────────────────────────────────
Location: src/services/user.service.js

Code:
  export const loginUser = async (data) => {
    const { email, password } = data;

    // Step 8: Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = result.rows[0];
    // user = {
    //   id: 1,
    //   email: "user@example.com",
    //   password: "$2a$10$N9qo8uLOickgx2ZMRZoMye...", (hashed)
    //   created_at: "2024-01-01T12:00:00Z"
    // }

    // Step 9: Verify password
    const isValid = await bcrypt.compare(password, user.password);
    // Compares: "password123" (plain) vs "$2a$10$..." (hashed)
    // Returns: true/false

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Step 10: Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },  // Payload (data in token)
      JWT_SECRET,                           // Secret key
      { expiresIn: "7d" }                   // Expires in 7 days
    );
    // Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MTEyMDAwLCJleHAiOjE3MDQ3MTY4MDB9.signature"

    // Return token and user (without password)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    };
  };


Step 8: Database Query
──────────────────────
Location: PostgreSQL Database

Query:
  SELECT * FROM users WHERE email = $1
  Parameters: ["user@example.com"]
  
  Returns:
    {
      id: 1,
      email: "user@example.com",
      password: "$2a$10$N9qo8uLOickgx2ZMRZoMye...",
      created_at: "2024-01-01 12:00:00"
    }


Step 9: Password Verification
──────────────────────────────
Location: bcrypt library

Process:
  bcrypt.compare("password123", "$2a$10$N9qo8uLOickgx2ZMRZoMye...")
  
  bcrypt internally:
    1. Extracts salt from hashed password
    2. Hashes plain password with same salt
    3. Compares hashes
    4. Returns: true (match) or false (no match)

  Result: true ✅


Step 10: JWT Token Generation
──────────────────────────────
Location: jsonwebtoken library

JWT Structure:
  Header.Payload.Signature

  Header (base64):
    {
      "alg": "HS256",  // Algorithm
      "typ": "JWT"     // Type
    }

  Payload (base64):
    {
      "id": 1,
      "email": "user@example.com",
      "iat": 1704112000,  // Issued at (timestamp)
      "exp": 1704716800   // Expires at (timestamp, 7 days from now)
    }

  Signature:
    HMACSHA256(
      base64UrlEncode(header) + "." + base64UrlEncode(payload),
      JWT_SECRET
    )

  Final Token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MTEyMDAwLCJleHAiOjE3MDQ3MTY4MDB9.signature"


Step 11: Response Sent
──────────────────────
HTTP Response:
  Status: 200 OK
  Headers:
    Content-Type: application/json
  Body:
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "created_at": "2024-01-01T12:00:00Z"
      }
    }
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React) - Continued                 │
└─────────────────────────────────────────────────────────────────────┘

Step 12: Response Received & Stored
────────────────────────────────────
Location: src/context/AuthContext.tsx

Response received:
  {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: { id: 1, email: "user@example.com", created_at: "..." }
  }

Code executes:
  setToken(response.token);
  // Updates React state: token = "eyJhbGci..."

  setUser(response.user);
  // Updates React state: user = { id: 1, email: "...", ... }

  localStorage.setItem("token", response.token);
  // Browser storage: token = "eyJhbGci..."

  localStorage.setItem("user", JSON.stringify(response.user));
  // Browser storage: user = '{"id":1,"email":"...","created_at":"..."}'


Step 13: Component Re-render
─────────────────────────────
Location: src/App.tsx

AuthContext state updated → App component re-renders

Code check:
  if (!user) {
    return <Login />;  // Not authenticated
  }

  return <TodoApp />;  // ✅ Now authenticated - shows Todo App


Step 14: User Sees Authenticated UI
────────────────────────────────────
- Header shows: "user@example.com" and "Logout" button
- Todo list appears
- User can now create/edit/delete todos
```

---

## 🔒 PROTECTED REQUEST FLOW

### Complete Journey: Making API Call with Token → Server Validates → Returns Data

Example: Fetching todos after login

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────────┘

Step 1: API Call with Token
────────────────────────────
Location: src/services/api.ts

Code:
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  async getAll(): Promise<Todo[]> {
    const response = await fetch("http://localhost:4000/todos", {
      headers: getHeaders(),  // Includes: Authorization: "Bearer eyJhbGci..."
    });
    return response.json();
  }

HTTP Request:
─────────────
GET http://localhost:4000/todos
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js/Express)                     │
└─────────────────────────────────────────────────────────────────────┘

Step 2: Request Arrives
───────────────────────
Location: src/app.js

Middleware:
1. cors() - Allows request
2. express.json() - Parses body (if any)
3. Route: "/todos" → todoRoutes


Step 3: Route Handler (Currently No Auth Middleware)
─────────────────────────────────────────────────────
Location: src/routes/todo.route.js

Code:
  router.get("/", getTodos);  // No authenticate middleware

Note: Currently todos routes are public. To protect them, add:
  router.get("/", authenticate, getTodos);


Step 4: Controller
──────────────────
Location: src/controllers/todo.controller.js

Code:
  export const getTodos = async (req, res, next) => {
    try {
      const todos = await todoService.getTodos();
      res.json(todos);
    } catch (err) {
      next(err);
    }
  };


Step 5: Database Query
──────────────────────
Location: src/services/todo.service.js

Code:
  export const getTodos = async () => {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    return result.rows;
  };

Database returns todos, controller sends response.


If Auth Middleware Was Added:
──────────────────────────────
Location: src/middlewares/auth.middleware.js

Code:
  export const authenticate = async (req, res, next) => {
    try {
      // Step 1: Get token from header
      const authHeader = req.headers.authorization;
      // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      // Step 2: Extract token
      const token = authHeader.substring(7);  // Remove "Bearer "
      // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

      // Step 3: Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      // decoded = { id: 1, email: "user@example.com", iat: ..., exp: ... }
      // Throws error if: invalid signature, expired, malformed

      // Step 4: Get user from database
      const user = await userService.getUserById(decoded.id);
      // user = { id: 1, email: "user@example.com", created_at: "..." }

      // Step 5: Attach user to request
      req.user = user;
      // Now controller can access: req.user.id, req.user.email

      // Step 6: Continue to next middleware/controller
      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      next(err);
    }
  };

JWT Verification Process:
─────────────────────────
1. Extract token from "Bearer <token>"
2. Verify signature using JWT_SECRET
3. Check expiration (exp field)
4. Decode payload → get user id
5. Fetch user from database
6. Attach user to req.user
7. Continue to controller

If verification fails:
  - Invalid signature → 401 Unauthorized
  - Token expired → 401 Unauthorized
  - User not found → Error
```

---

## 🚪 LOGOUT FLOW

### Complete Journey: User Clicks Logout → Token Removed → Redirected to Login

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Clicks Logout Button
──────────────────────────────────
Location: src/App.tsx

Code:
  <button onClick={logout} className="btn btn-secondary">
    Logout
  </button>


Step 2: Logout Function Executed
─────────────────────────────────
Location: src/context/AuthContext.tsx

Code:
  const logout = () => {
    setToken(null);           // Clear React state
    setUser(null);            // Clear React state
    localStorage.removeItem("token");  // Remove from browser storage
    localStorage.removeItem("user");   // Remove from browser storage
  };


Step 3: State Updates
─────────────────────
React state changes:
  token: "eyJhbGci..." → null
  user: { id: 1, email: "..." } → null

localStorage changes:
  token: removed
  user: removed


Step 4: Component Re-render
────────────────────────────
Location: src/App.tsx

Code:
  if (!user) {
    return (
      <div className="app">
        <Login />  // ✅ Now shows login form
      </div>
    );
  }

  return <TodoApp />;  // Was showing this, now shows Login


Step 5: User Sees Login Screen
───────────────────────────────
- Login form displayed
- User must login again to access app
- No API call needed (client-side only)
```

**Important Notes:**
- Logout is **client-side only** (no backend call)
- Token is removed from localStorage (can't be used anymore)
- If user refreshes page, they'll see login (no token in localStorage)
- Server doesn't know user logged out (stateless JWT)
- Token remains valid until expiration (7 days), but client can't use it

---

## 💾 TOKEN STORAGE & USAGE

### How Tokens Are Stored and Used

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                                   │
└─────────────────────────────────────────────────────────────────────┘

1. Token Creation (Login)
─────────────────────────
   Backend generates JWT token
   ↓
   Frontend receives token
   ↓
   Stored in:
     - React state (token variable)
     - localStorage (persists across page refreshes)

2. Token Usage (Every API Request)
───────────────────────────────────
   Frontend reads token from localStorage
   ↓
   Adds to request header:
     Authorization: Bearer <token>
   ↓
   Backend receives header
   ↓
   Validates token (if auth middleware used)
   ↓
   Processes request

3. Token Storage Locations
──────────────────────────
   localStorage:
     - Persists across browser sessions
     - Survives page refreshes
     - Accessible via JavaScript
     - Vulnerable to XSS attacks (but common practice)
   
   React State:
     - Lost on page refresh
     - Faster access (no localStorage read)
     - Syncs with localStorage

4. Token Persistence
────────────────────
   On page refresh:
     1. App loads
     2. AuthContext reads from localStorage
     3. Sets state if token exists
     4. User stays logged in

   Code:
     const stored = getStoredAuth();
     const [token, setToken] = useState(stored.token);
     const [user, setUser] = useState(stored.user);

5. Token Expiration
───────────────────
   Token expires after 7 days (set in loginUser service)
   
   When expired:
     - Backend rejects token (401 Unauthorized)
     - Frontend should redirect to login
     - User must login again

6. Token Security
─────────────────
   ✅ Good:
     - Stored in localStorage (convenient)
     - Sent via HTTPS (encrypted in transit)
     - Has expiration (7 days)
     - Cannot be modified (signature verified)
   
   ⚠️ Considerations:
     - XSS vulnerability (if malicious script runs)
     - No server-side revocation (until expiration)
     - Consider httpOnly cookies for better security
```

---

## 📊 COMPLETE FLOW DIAGRAM

```
┌──────────────┐
│   BROWSER    │
│   (User)     │
└──────┬───────┘
       │
       │ 1. Clicks "Sign Up"
       │    Fills form
       ▼
┌─────────────────────────────────────┐
│      React Component                │
│  (Signup.tsx)                       │
│  - Form validation                  │
│  - Calls AuthContext.signup()       │
└──────┬──────────────────────────────┘
       │
       │ 2. authApi.signup()
       ▼
┌─────────────────────────────────────┐
│      API Service                    │
│  (authApi.ts)                       │
│  - fetch() POST /auth/signup        │
│  - Sends: { email, password }       │
└──────┬──────────────────────────────┘
       │
       │ 3. HTTP Request
       │    POST http://localhost:4000/auth/signup
       │    Body: JSON
       ▼
┌─────────────────────────────────────┐
│      Express Server                 │
│  (app.js)                           │
│  - cors() middleware                │
│  - express.json() middleware        │
│  - Route matching                   │
└──────┬──────────────────────────────┘
       │
       │ 4. Routes to /auth
       ▼
┌─────────────────────────────────────┐
│      Route Handler                  │
│  (auth.route.js)                    │
│  router.post("/signup", signup)     │
└──────┬──────────────────────────────┘
       │
       │ 5. Calls controller
       ▼
┌─────────────────────────────────────┐
│      Controller                     │
│  (auth.controller.js)               │
│  - Validates input                  │
│  - Calls userService.createUser()   │
└──────┬──────────────────────────────┘
       │
       │ 6. Business logic
       ▼
┌─────────────────────────────────────┐
│      Service                        │
│  (user.service.js)                  │
│  - Checks if user exists            │
│  - Hashes password (bcrypt)         │
│  - Calls database                   │
└──────┬──────────────────────────────┘
       │
       │ 7. SQL Query
       ▼
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  - INSERT INTO users                │
│  - Returns: user data               │
└──────┬──────────────────────────────┘
       │
       │ 8. User data returned
       ▼
┌─────────────────────────────────────┐
│      Service                        │
│  - Returns user object              │
└──────┬──────────────────────────────┘
       │
       │ 9. Controller response
       ▼
┌─────────────────────────────────────┐
│      Controller                     │
│  res.status(201).json({ user })     │
└──────┬──────────────────────────────┘
       │
       │ 10. HTTP Response
       │     Status: 201 Created
       │     Body: JSON
       ▼
┌─────────────────────────────────────┐
│      API Service                    │
│  - Receives response                │
│  - Returns data                     │
└──────┬──────────────────────────────┘
       │
       │ 11. AuthContext
       ▼
┌─────────────────────────────────────┐
│      AuthContext                    │
│  - Signup complete                  │
│  - Auto calls login()               │
│  - Stores token & user              │
└──────┬──────────────────────────────┘
       │
       │ 12. State update
       ▼
┌─────────────────────────────────────┐
│      React Component                │
│  (App.tsx)                          │
│  - Re-renders                       │
│  - Shows Todo App (authenticated)   │
└─────────────────────────────────────┘
```

---

## 🔑 KEY CONCEPTS SUMMARY

1. **Stateless Authentication**: JWT tokens (server doesn't store sessions)
2. **Password Hashing**: bcrypt (one-way, can't reverse)
3. **Token Storage**: localStorage (persists across refreshes)
4. **Token Validation**: JWT signature + expiration check
5. **Layered Architecture**: Routes → Controllers → Services → Database
6. **Middleware**: Functions that run before route handlers
7. **Error Handling**: try/catch + error middleware
8. **Auto Login**: After signup, automatically calls login
9. **Client-Side Logout**: Just removes token (no server call)
10. **Protected Routes**: Add auth middleware to require authentication

---

This is the complete flow of how authentication works in your application! 🎉

