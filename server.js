const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./utils/winstonLogger")("application");
const requestCounter = require("./models/requestCounter");
const { errorHandler } = require("./middleware/errorHandler");
const appRouter = require("./routes");

dotenv.config();

console.log("EMAIL_USER loaded:", process.env.EMAIL_USER ? "✅" : "❌");
console.log("EMAIL_PASS loaded:", process.env.EMAIL_PASS ? "✅" : "❌");
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);

process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", reason);
  process.exit(1);
});



const app = express();

app.use(cors());
app.use(express.json());
app.use(requestCounter);
app.use("/api/admin", require("./routes/adminRoutes"));
app.get("/status", (req, res) => {
  res.json({ message: "Test route works!" });
});


app.get("/api/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("<h1>❌ Missing token</h1>");

    const TempContestant = require("./models/TempContestant");
    const Contestant = require("./models/Contestant");

    // Find the temporary record
    const temp = await TempContestant.findOne({ verificationToken: token });
    if (!temp) {
      return res.status(400).send("<h1>❌ Invalid or expired verification link</h1>");
    }

    // Check if already verified (should not happen, but safe)
    const existingPerm = await Contestant.findOne({ email: temp.email });
    if (existingPerm) {
      await TempContestant.deleteOne({ _id: temp._id });
      return res.status(400).send("<h1>❌ Email already verified</h1>");
    }

    // Move data to permanent Contestant collection
    await Contestant.create({
      name: temp.name,
      email: temp.email,
      phone: temp.phone,
      dob: temp.dob,
      password: temp.password,  // already hashed
      votelink: temp.votelink,
      isEmailVerified: true,
      voters: [],
      voteCount: 0,
      hasPaid: false,
      photo: null
    });

    // Delete temporary record
    await TempContestant.deleteOne({ _id: temp._id });

    console.log(`✅ Verified and saved: ${temp.email}`);
    res.send("<h1 style='color:green'>✅ Email verified! Your account has been created. You can now log in.</h1>");
  } catch (err) {
    console.error(err);
    res.status(500).send(`<h1>❌ Error: ${err.message}</h1>`);
  }
});

app.use("/api", appRouter)

// app.get("/", (req, res) => {
//   res.send("Trueface Backend Running...");
// });

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  try{
    console.log("Connecting to Database...");
    connectDB();
    logger.info(`Server running on port ${PORT}`);
    console.log(`🔗 Register URL: http://localhost:${PORT}/api/contestants/register`);
    console.log(`🔗 Verification URL: http://localhost:${PORT}/api/verify/verify-email?token=YOUR_TOKEN`);
  } catch(error){
    logger.error("Server startup error:", error);
    process.exit(-1);
  }
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated!");
  });
});