const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  logger.info("database", "Connecting to Database...");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("database", "Database Connected Successfully");
  } catch (error) {
    logger.error("database", error.message);
    process.exit(1);
  }
};

  module.exports = connectDB;