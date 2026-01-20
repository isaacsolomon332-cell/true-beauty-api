const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // ADD THIS

dotenv.config();
connectDB();

const app = express();

// MIDDLEWARE
app.use(cors()); // Enable CORS for frontend
app.use(express.json());

// ROUTES
app.use("/api/contestants", require("./routes/contestantRoutes"));
app.use("/api/vote", require("./routes/voteRoutes")); // ADD THIS LINE

// Test route
app.get("/", (req, res) => {
  res.send("Trueface Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));