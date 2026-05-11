const mongoose = require("mongoose");

const tempContestantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  votelink: { type: String, required: true },
  verificationToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 1800 } // 30 minutes = 1800 seconds
});

module.exports = mongoose.model("TempContestant", tempContestantSchema);