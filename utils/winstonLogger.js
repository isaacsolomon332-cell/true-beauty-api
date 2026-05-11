const winston = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, json } = winston.format;

const myFormat = printf(({ level, message, timestamp, category, stack }) => {
  if (stack) {
    return `${timestamp} [${level}] [${category}]  ${message} - ${stack}`;
  }
  return `${timestamp} [${level}] [${category}]  ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    myFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        myFormat
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: combine(timestamp(), json())
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: combine(timestamp(), json())
    })
  ]
});

module.exports = (category) => ({
  info: (message) => logger.info({ message, category }),
  error: (message, error = null) => {
    if (error && error.stack) {
      logger.error({ message: `${message} - ${error.message}`, category, stack: error.stack });
    } else {
      logger.error({ message, category });
    }
  },
  warn: (message) => logger.warn({ message, category }),
  debug: (message) => logger.debug({ message, category })
});