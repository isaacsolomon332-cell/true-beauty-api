const Contestant = require("../models/Contestant");
const Otp = require("../models/Otp");
const { sendOTPEmail } = require("../utils/emailService");
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }

    if (contestant.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    const otp = generateOTP();

    await Otp.create({
      userId: contestant._id,
      email: contestant.email,
      otp: otp,
      purpose: 'email_verification'
    });

    const emailResult = await sendOTPEmail(email, otp, 'email_verification');
    
    if (emailResult.error) {
      return res.status(400).json({ 
        success: false,
        message: "Failed to send verification email"
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email",
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (contestant.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    const MAX_OTP_ATTEMPTS = 5;
    if (contestant.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      });
    }

    const otpRecord = await Otp.findOne({ 
      userId: contestant._id,
      email: email,
      otp: otp,
      purpose: 'email_verification'
    });

    if (!otpRecord) {
      contestant.otpAttempts += 1;
      await contestant.save();
      
      const remaining = MAX_OTP_ATTEMPTS - contestant.otpAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempts remaining.`,
        attemptsRemaining: remaining
      });
    }

    contestant.isEmailVerified = true;
    contestant.otpAttempts = 0;
    await contestant.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
      isEmailVerified: true
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message
    });
  }
};

exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (contestant.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    await Otp.deleteMany({ 
      userId: contestant._id,
      purpose: 'email_verification'
    });

    const otp = generateOTP();
    await Otp.create({
      userId: contestant._id,
      email: contestant.email,
      otp: otp,
      purpose: 'email_verification'
    });

    const emailResult = await sendOTPEmail(email, otp, 'email_verification');
    
    if (emailResult.error) {
      return res.status(400).json({ 
        success: false,
        message: "Failed to resend verification email"
      });
    }

    res.status(200).json({
      success: true,
      message: "New verification OTP sent to your email"
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message
    });
  }
};