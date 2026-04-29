const rateLimit = require('express-rate-limit');

// Rate limiter for search endpoint
exports.searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Max 10 requests per minute per IP
  message: {
    success: false,
    message: 'Too many search requests. Please try again after a minute.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable deprecated headers
  skipFailedRequests: true, // Don't count failed requests
  skipSuccessfulRequests: false // Do count successful requests
});

// Rate limiter for OTP requests (if not already exists)
exports.otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after an hour.'
  }
});