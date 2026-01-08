import nodemailer from "nodemailer";

// Email configuration (using Gmail as example)
// For production, use environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// If no email config, create a test account (for development)
if (!process.env.EMAIL_USER) {
  console.log("⚠️  No email config found. Email functionality disabled.");
  console.log("   Set EMAIL_USER and EMAIL_PASSWORD in .env to enable emails");
}

export const sendEmail = async (to, subject, html) => {
  // Skip if no email config
  if (!process.env.EMAIL_USER) {
    console.log(`📧 [Email would be sent] To: ${to}, Subject: ${subject}`);
    return { success: true, message: "Email skipped (no config)" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send email");
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;

  const html = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    <p>This link will expire in 24 hours.</p>
  `;

  return await sendEmail(email, "Verify Your Email", html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  const html = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await sendEmail(email, "Reset Your Password", html);
};

