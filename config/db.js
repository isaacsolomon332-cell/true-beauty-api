const mongoose = require("mongoose");
const logger = require("../utils/winstonLogger")("database");

const connectDB = async () => {
  logger.info("Connecting to Database...");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Database Connected Successfully");
  } catch (error) {
    logger.error("Database Connection Failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;