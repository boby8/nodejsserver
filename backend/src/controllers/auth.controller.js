import * as userService from "../services/user.service.js";
import * as emailService from "../services/email.service.js";

// SIGNUP
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.createUser({ email, password });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, user.verification_token);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    res.status(201).json({
      message: "User created successfully. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await userService.loginUser({ email, password });
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: err.message });
    }
    if (err.message === "Email not verified") {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const result = await userService.verifyEmail(token);
    res.json(result);
  } catch (err) {
    if (
      err.message === "Invalid or expired verification token" ||
      err.message === "Email already verified" ||
      err.message === "Invalid verification token"
    ) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const resetToken = await userService.generatePasswordResetToken(email);

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr);
      // Don't reveal if user exists or not (security)
    }

    // Always return success (don't reveal if email exists)
    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    // Don't reveal if user exists
    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const result = await userService.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid or expired reset token") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

