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
    
    // VOTING FIELDS (NEW)
    votelink: { type: String, unique: true, sparse: true }, // Unique voting slug
    voters: [{ type: String }], // Array of voter emails
    voteCount: { type: Number, default: 0 } // Renamed from 'votes' to match his code
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contestant", contestantSchema);