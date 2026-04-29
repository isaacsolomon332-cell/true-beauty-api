const jwt = require("jsonwebtoken");
const Contestant = require("../models/Contestant");
const rateLimit = require('express-rate-limit');

// Authentication middleware
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Contestant.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "No token, authorization denied"
  });
};

// Rate limiters
const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after an hour.'
  }
});

const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many search requests. Please try again after a minute.'
  }
});

const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after a minute.'
  }
});

// Validation middleware
const validateEmailOTP = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }
  next();
};

const checkEmailVerified = async (req, res, next) => {
  try {
    const { email } = req.body;
    const contestant = await Contestant.findOne({ email });
    if (contestant && contestant.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  otpRateLimiter,
  searchRateLimiter,
  verifyRateLimiter,
  validateEmailOTP,
  checkEmailVerified
};