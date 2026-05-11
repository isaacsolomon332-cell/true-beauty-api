const express = require("express");
const emailRouter = express.Router();

const {
  verifyEmail,
  resendVerificationLink
} = require("../controllers/emailVerificationController");

const { otpRateLimiter } = require("../middleware/authMiddleware");

// THIS IS THE CORRECT ENDPOINT - matches what your email sends
emailRouter.get("/verify-email", verifyEmail);

// Resend link endpoint
emailRouter.post("/resend-verification", otpRateLimiter, resendVerificationLink);

module.exports = emailRouter; 