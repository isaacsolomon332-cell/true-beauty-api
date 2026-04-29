const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contestant',
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    enum: ['email_verification', 'password_reset'],
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // Auto-delete after 5 minutes (300 seconds)
  }
});

module.exports = mongoose.model("Otp", otpSchema);