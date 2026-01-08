import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

  // Generate verification token
  const verificationToken = jwt.sign({ email }, JWT_SECRET, {
    expiresIn: "24h",
  });

  // Create user
  const result = await pool.query(
    "INSERT INTO users (email, password, verification_token) VALUES ($1, $2, $3) RETURNING id, email, created_at, verification_token",
    [email, hashedPassword, verificationToken]
  );

  return result.rows[0];
};

export const loginUser = async (data) => {
  const { email, password } = data;

  // Find user
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Check if email is verified (optional - uncomment if you want to require verification)
  // if (!user.email_verified) {
  //   throw new Error("Email not verified");
  // }

  // Generate token
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_verified: user.email_verified || false,
    },
  };
};

export const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, email, created_at, email_verified FROM users WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

export const verifyEmail = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const user = await getUserByEmail(email);

    if (user.email_verified) {
      throw new Error("Email already verified");
    }

    if (user.verification_token !== token) {
      throw new Error("Invalid verification token");
    }

    await pool.query(
      "UPDATE users SET email_verified = true, verification_token = NULL WHERE email = $1",
      [email]
    );

    return { message: "Email verified successfully" };
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      throw new Error("Invalid or expired verification token");
    }
    throw err;
  }
};

export const generatePasswordResetToken = async (email) => {
  const user = await getUserByEmail(email);

  const resetToken = jwt.sign({ id: user.id, email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await pool.query(
    "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
    [resetToken, expiresAt, email]
  );

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()",
      [decoded.id, token]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [hashedPassword, decoded.id]
    );

    return { message: "Password reset successfully" };
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      throw new Error("Invalid or expired reset token");
    }
    throw err;
  }
};

export { JWT_SECRET };

