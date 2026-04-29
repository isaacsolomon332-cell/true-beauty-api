const express = require("express");
const router = express.Router();

const {
  sendVerificationOTP,
  verifyEmail,
  resendVerificationOTP
} = require("../controllers/emailVerificationController");

const {
  otpRateLimiter,
  verifyRateLimiter,
  validateEmailOTP,
  checkEmailVerified
} = require("../middleware/authMiddleware");

router.post(
  "/send-verification",
  otpRateLimiter,
  validateEmailOTP,
  checkEmailVerified,      
  sendVerificationOTP
);

router.post(
  "/verify",
  verifyRateLimiter,      
  validateEmailOTP,
  verifyEmail
);

router.post(
  "/resend-verification",
  otpRateLimiter,          
  validateEmailOTP,
  checkEmailVerified,      
  resendVerificationOTP
);

module.exports = router;