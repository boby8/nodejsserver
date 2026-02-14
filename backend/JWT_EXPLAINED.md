# 🔐 JWT Tokens Explained - Complete Guide

## What is a JWT Token?

**JWT = JSON Web Token**

Think of it like a **temporary ID card** that proves who you are.

### Simple Analogy:
- **Without JWT**: Every time you want something, you have to show your ID and password
- **With JWT**: You get a special card (token) that says "I'm verified, trust me for 7 days"

---

## 🎯 Why Do We Need JWT Tokens?

### Problem Without JWT:
```
User logs in → Server remembers them
User makes request → Server: "Who are you? Login again!"
User makes another request → Server: "Who are you? Login again!"
```

**Problem**: Server doesn't remember who you are between requests!

### Solution With JWT:
```
User logs in → Server gives them a token
User makes request → Shows token → Server: "Oh, I know you! ✅"
User makes another request → Shows token → Server: "Still know you! ✅"
```

**Solution**: Token proves your identity without logging in every time!

---

## 🔑 Key Aspects of JWT Tokens

### 1. **What's Inside a JWT Token?**

A JWT has 3 parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MTEyMDAwLCJleHAiOjE3MDQ3MTY4MDB9.signature
│──────────────────────││──────────────────────────────────────────────────────││──────────│
        Header                    Payload (data)                                    Signature
```

#### **Part 1: Header** (What algorithm is used)
```json
{
  "alg": "HS256",  // Algorithm: How to sign
  "typ": "JWT"     // Type: It's a JWT token
}
```

#### **Part 2: Payload** (The actual data)
```json
{
  "id": 1,                              // User ID
  "email": "user@example.com",          // User email
  "iat": 1704112000,                    // Issued at (when created)
  "exp": 1704716800                     // Expires at (when it expires)
}
```

#### **Part 3: Signature** (Proof it's real)
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

**What signature does:**
- Proves token wasn't tampered with
- Proves it came from your server
- Like a seal on a letter

---

## 🔄 Complete JWT Flow in Your Backend

### Step 1: User Logs In

**Location:** `src/services/user.service.js` (line 64)

```javascript
// Generate token
const token = jwt.sign(
  { id: user.id, email: user.email },  // Payload (data to store)
  JWT_SECRET,                           // Secret key (like a password)
  { expiresIn: "7d" }                   // Expires in 7 days
);
```

**What happens:**
1. Takes user data (id, email)
2. Signs it with secret key
3. Sets expiration (7 days)
4. Creates token string

**Result:**
```javascript
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Step 2: Token Sent to Frontend

**Location:** `src/controllers/auth.controller.js` (line 40)

```javascript
const result = await userService.loginUser({ email, password });
res.json(result);  // Returns: { token: "...", user: {...} }
```

**What happens:**
- Backend sends token to frontend
- Frontend stores it (localStorage)
- Frontend uses it for future requests

---

### Step 3: Frontend Uses Token

**Frontend sends token in header:**
```javascript
fetch("http://localhost:4000/todos", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
});
```

**Format:** `Bearer <token>`
- "Bearer" = type of authentication
- Token = the actual JWT

---

### Step 4: Backend Verifies Token

**Location:** `src/middlewares/auth.middleware.js`

```javascript
export const authenticate = async (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader.substring(7); // Remove "Bearer "

  // 2. Verify token
  const decoded = jwt.verify(token, JWT_SECRET);
  // Returns: { id: 1, email: "user@example.com", iat: ..., exp: ... }

  // 3. Get user from database
  const user = await userService.getUserById(decoded.id);

  // 4. Attach user to request
  req.user = user;
  next(); // Continue to controller
};
```

**What happens:**
1. Extracts token from header
2. Verifies signature (checks if it's real)
3. Checks expiration (is it still valid?)
4. Decodes payload (gets user id, email)
5. Fetches user from database
6. Attaches user to request

---

## 🎯 Key Aspects Explained

### Aspect 1: **Token Creation (Signing)**

```javascript
jwt.sign(payload, secret, options)
```

**What it does:**
- Takes data (user id, email)
- Signs it with secret key
- Creates token string

**Why secret key?**
- Like a password to create tokens
- Only your server knows it
- Prevents fake tokens

---

### Aspect 2: **Token Verification**

```javascript
jwt.verify(token, secret)
```

**What it does:**
- Checks signature (is it real?)
- Checks expiration (is it still valid?)
- Returns decoded data

**What can go wrong:**
- Invalid signature → Token was tampered with
- Expired → Token is too old
- Missing → No token provided

---

### Aspect 3: **Token Expiration**

```javascript
{ expiresIn: "7d" }  // Expires in 7 days
```

**Why expiration?**
- Security: Old tokens become invalid
- Limits damage if token is stolen
- Forces re-authentication

**Options:**
- `"7d"` = 7 days
- `"24h"` = 24 hours
- `"15m"` = 15 minutes
- `3600` = 3600 seconds

---

### Aspect 4: **Token Storage**

**Frontend stores:**
```javascript
localStorage.setItem("token", token);
```

**Why localStorage?**
- Persists across page refreshes
- Easy to access
- Survives browser restart

**Security note:**
- Vulnerable to XSS attacks
- But common practice for JWTs
- Alternative: httpOnly cookies (more secure)

---

### Aspect 5: **Token Usage**

**Every protected request:**
```javascript
headers: {
  "Authorization": "Bearer <token>"
}
```

**Backend checks:**
1. Is token present? ✅
2. Is token valid? ✅
3. Is token expired? ✅
4. Who is the user? ✅

---

## 🔒 Security Aspects

### 1. **Secret Key (JWT_SECRET)**

```javascript
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
```

**Why important:**
- Used to sign tokens
- Used to verify tokens
- Must be kept secret!

**Best practice:**
- Store in `.env` file
- Never commit to git
- Use strong random string

---

### 2. **Token Tampering Prevention**

**How it works:**
- Signature is created from header + payload + secret
- If anyone changes payload, signature won't match
- Verification fails → Token rejected

**Example:**
```
Original: { id: 1, email: "user@example.com" }
Tampered: { id: 999, email: "hacker@example.com" }
Result: Signature doesn't match → Token invalid ❌
```

---

### 3. **Token Expiration**

**Why needed:**
- Limits how long token is valid
- Reduces risk if token is stolen
- Forces periodic re-authentication

**In your code:**
```javascript
expiresIn: "7d"  // Token expires in 7 days
```

---

### 4. **Stateless Authentication**

**What it means:**
- Server doesn't store tokens
- Token contains all needed info
- Server just verifies it

**Benefit:**
- No database lookup for sessions
- Works across multiple servers
- Scalable

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  1. USER LOGS IN                                         │
│  POST /auth/login                                        │
│  { email: "user@example.com", password: "123456" }    │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  2. BACKEND VERIFIES PASSWORD                            │
│  - Checks email exists                                   │
│  - Verifies password (bcrypt.compare)                    │
│  - Password correct? ✅                                   │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  3. BACKEND CREATES JWT TOKEN                            │
│  jwt.sign(                                               │
│    { id: 1, email: "user@example.com" },               │
│    JWT_SECRET,                                           │
│    { expiresIn: "7d" }                                   │
│  )                                                       │
│                                                          │
│  Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."      │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  4. BACKEND SENDS TOKEN TO FRONTEND                     │
│  Response: {                                             │
│    token: "eyJhbGci...",                                 │
│    user: { id: 1, email: "user@example.com" }          │
│  }                                                       │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  5. FRONTEND STORES TOKEN                                │
│  localStorage.setItem("token", token)                   │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  6. USER MAKES REQUEST                                   │
│  GET /todos                                              │
│  Headers: {                                              │
│    Authorization: "Bearer eyJhbGci..."                 │
│  }                                                       │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  7. BACKEND VERIFIES TOKEN                               │
│  - Extract token from header                             │
│  - jwt.verify(token, JWT_SECRET)                         │
│  - Check signature ✅                                     │
│  - Check expiration ✅                                    │
│  - Decode payload → { id: 1, email: "..." }            │
│  - Get user from database                                │
│  - Attach user to request                                │
└──────────────────────┬──────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  8. REQUEST PROCESSED                                    │
│  Controller can access: req.user                         │
│  Returns todos for that user                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Concepts

### 1. **Stateless**
- Server doesn't store tokens
- Token is self-contained
- Server just verifies it

### 2. **Signed**
- Token has a signature
- Proves it came from your server
- Can't be tampered with

### 3. **Expires**
- Token has expiration time
- Becomes invalid after expiry
- User must login again

### 4. **Contains Data**
- Token has user info (id, email)
- No need to look up in database (but you still do for security)
- Can decode without secret (but can't verify)

---

## 🔍 What Each Part Does

### **jwt.sign()** - Creates Token
```javascript
jwt.sign(
  { id: 1, email: "user@example.com" },  // What to store
  JWT_SECRET,                              // Secret key
  { expiresIn: "7d" }                     // When it expires
)
```
**Result:** Token string

---

### **jwt.verify()** - Checks Token
```javascript
jwt.verify(token, JWT_SECRET)
```
**Checks:**
- Is signature valid? (was it signed by us?)
- Is it expired? (is it still valid?)
- What's the payload? (who is the user?)

**Returns:** Decoded payload or throws error

---

## 🛡️ Security Best Practices

### 1. **Keep Secret Safe**
```javascript
// ✅ GOOD: In .env file
JWT_SECRET=your-super-secret-key-here

// ❌ BAD: In code
const JWT_SECRET = "secret123";
```

### 2. **Use Expiration**
```javascript
// ✅ GOOD: Short expiration
{ expiresIn: "15m" }  // 15 minutes

// ⚠️ OK: Medium expiration
{ expiresIn: "7d" }   // 7 days (your current)

// ❌ BAD: No expiration
// No expiresIn option
```

### 3. **Verify on Every Request**
```javascript
// ✅ GOOD: Verify token
const decoded = jwt.verify(token, JWT_SECRET);

// ❌ BAD: Trust token without verification
// Don't do this!
```

### 4. **Use HTTPS in Production**
- Encrypts token in transit
- Prevents token theft
- Essential for security

---

## 📝 Summary

**JWT Token = Temporary ID Card**

1. **Created** when user logs in
2. **Contains** user information (id, email)
3. **Signed** with secret key (can't be faked)
4. **Expires** after set time (7 days in your case)
5. **Verified** on every request
6. **Stateless** (server doesn't store it)

**Flow:**
```
Login → Get Token → Store Token → Use Token → Verify Token → Access Granted
```

**Key Aspects:**
- Creation (signing)
- Verification (checking)
- Expiration (time limit)
- Security (signature, secret)
- Stateless (no server storage)

That's JWT tokens in a nutshell! 🎉
