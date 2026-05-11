const logger = require("../utils/winstonLogger")("error-handler");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.url}] - ${message}`, err);
  } else {
    logger.warn(`[${req.method} ${req.url}] - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = { errorHandler, AppError };