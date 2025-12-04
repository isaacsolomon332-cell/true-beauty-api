const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// ROUTES
app.use("/api/contestants", require("./routes/contestantRoutes"));


app.get("/", (req, res) => {
  res.send("Trueface Backend Running...");// test  route
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//“We are creating a backend that allows contestants to join a beauty contest, save their data, and log in.”