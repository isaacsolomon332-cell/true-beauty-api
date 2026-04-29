const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./utils/logger");
const requestCounter = require("./middleware/requestCounter");
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(requestCounter);

app.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

app.use("/api/contestants", require("./routes/contestantRoutes"));
app.use("/api/vote", require("./routes/voteRoutes"));
app.use("/api/auth", require("./routes/passwordRoutes"));
app.use("/api/verify", require("./routes/emailVerificationRoutes"));

app.get("/", (req, res) => {
  res.send("Trueface Backend Running...");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info("application", `server running on port ${PORT}`);
  console.log(`🔗 Register URL: http://localhost:${PORT}/api/contestants/register`);
});