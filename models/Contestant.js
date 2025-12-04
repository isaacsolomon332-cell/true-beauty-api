const mongoose = require("mongoose");

const contestantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },

    password: { type: String, required: true, minlength: 6 },

    photo: { type: String, default: null },
    hasPaid: { type: Boolean, default: false },
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contestant", contestantSchema);
