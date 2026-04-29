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
    
    // VOTING FIELDS
    votelink: { type: String, unique: true, sparse: true },
    voters: [{ type: String }],
    voteCount: { type: Number, default: 0 },
    
    // EMAIL VERIFICATION (PERMANENT)
    isEmailVerified: { 
      type: Boolean, 
      default: false 
    },
    
    // OTP ATTEMPTS TRACKING
    otpAttempts: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contestant", contestantSchema);