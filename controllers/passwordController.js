const Contestant = require("../models/Contestant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/emailService");
const Otp = require("../models/Otp");
const { AppError } = require("../middleware/errorHandler");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      throw new AppError("No account found with this email", 404);
    }

    const otp = generateOTP();

    await Otp.create({
      userId: contestant._id,
      email: contestant.email,
      otp: otp,
      purpose: 'password_reset'
    });

    const emailResult = await sendOTPEmail(email, otp, 'password_reset');
    
    if (emailResult.error) {
      throw new AppError("Failed to send OTP email", 400);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email address"
    });

  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new AppError("Email, OTP, and new password are required", 400);
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new AppError("Password must be at least 6 characters with letters and numbers", 400);
    }

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      throw new AppError("Account not found", 404);
    }

    const otpRecord = await Otp.findOne({
      userId: contestant._id,
      email: email,
      otp: otp,
      purpose: 'password_reset'
    });

    if (!otpRecord) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    const createdAt = new Date(otpRecord.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    
    if (diffInMinutes > 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    contestant.password = hashedPassword;
    await contestant.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const contestantId = req.user.id;

    if (!currentPassword || !newPassword) {
      throw new AppError("Current and new password are required", 400);
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new AppError("New password must be at least 6 characters with letters and numbers", 400);
    }

    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, contestant.password);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    contestant.password = hashedPassword;
    await contestant.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    next(error);
  }
};