const { AppError } = require("./errorHandler");

// Validate registration input
const validateRegistration = (req, res, next) => {
  const { name, email, phone, dob, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

  if (!name || !email || !phone || !dob || !password) {
    return next(new AppError("All fields are required", 400));
  }

  if (!emailRegex.test(email)) {
    return next(new AppError("Invalid email format", 400));
  }

  if (!passwordRegex.test(password)) {
    return next(new AppError(
      "Password must contain letters and numbers and be at least 6 characters",
      400
    ));
  }

  next();
};

// Validate login input
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  next();
};

// Validate search input
const validateSearch = (req, res, next) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return next(new AppError("Search term must be at least 2 characters", 400));
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateSearch,
};