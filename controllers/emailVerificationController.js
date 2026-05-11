const { AppError } = require("../middleware/errorHandler");
const Contestant = require("../models/Contestant");
const Otp = require("../models/Otp");
const { sendVerificationEmail } = require("../utils/emailService");
const logger = require("../utils/winstonLogger")("verification-service");

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Verification token received:", token);

    if (!token) {
      return res.status(400).send(`
        <html><body style="font-family:Arial;text-align:center;padding:50px;">
          <h1 style="color:#dc2626;"> Invalid Link</h1>
          <p>No verification token provided.</p>
        </body></html>
      `);
    }

    const otpRecord = await Otp.findOne({ otp: token, purpose: 'email_verification' });
    if (!otpRecord) {
      return res.status(400).send(`
        <html><body style="font-family:Arial;text-align:center;padding:50px;">
          <h1 style="color:#dc2626;"> Invalid or Expired Link</h1>
          <p>The verification link is invalid or has expired.</p>
        </body></html>
      `);
    }

    const ageMinutes = (Date.now() - new Date(otpRecord.createdAt)) / (1000 * 60);
    if (ageMinutes > 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).send(`
        <html><body style="font-family:Arial;text-align:center;padding:50px;">
          <h1 style="color:#dc2626;"> Link Expired</h1>
          <p>The verification link has expired (5 minutes). Please request a new one.</p>
        </body></html>
      `);
    }

    const contestant = await Contestant.findById(otpRecord.userId);
    if (!contestant) {
      return res.status(404).send(`
        <html><body style="font-family:Arial;text-align:center;padding:50px;">
          <h1 style="color:#dc2626;"> Account Not Found</h1>
        </body></html>
      `);
    }

    contestant.isEmailVerified = true;
    await contestant.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    logger.info(`Email verified: ${contestant.email}`);
    res.send(`
      <html><body style="font-family:Arial;text-align:center;padding:50px;">
        <h1 style="color:#22c55e;"> Email Verified Successfully!</h1>
        <p>You can now close this window and log in.</p>
      </body></html>
    `);
  } catch (error) {
    console.error(" Verification error:", error);
    res.status(500).send(`
      <html><body style="font-family:Arial;text-align:center;padding:50px;">
        <h1 style="color:#dc2626;"> Server Error</h1>
        <p>${error.message}</p>
      </body></html>
    `);
  }
};

exports.resendVerificationLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required", 400);

    const contestant = await Contestant.findOne({ email });
    if (!contestant) throw new AppError("Account not found", 404);
    if (contestant.isEmailVerified) throw new AppError("Email already verified", 400);

    // Rate limiting: 3 requests per 30 minutes
    const now = new Date();
    const thirtyMinutes = 60 * 1000;

    if (contestant.lastVerificationRequestAt) {
      const timeSinceLast = now - contestant.lastVerificationRequestAt;
      if (timeSinceLast < thirtyMinutes) {
        if (contestant.verificationLinkRequests >= 3) {
          throw new AppError("Too many verification requests. Please try again after 30 minutes.", 429);
        }
      } else {
        // Reset count if window passed
        contestant.verificationLinkRequests = 0;
      }
    }

    // Increment request count
    contestant.verificationLinkRequests += 1;
    contestant.lastVerificationRequestAt = now;
    await contestant.save();

    // Generate new token and send email (your existing code)...
    const crypto = require("crypto");
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`;

    await Otp.deleteMany({ userId: contestant._id, purpose: 'email_verification' });
    await Otp.create({
      userId: contestant._id,
      email: contestant.email,
      otp: verificationToken,
      purpose: 'email_verification'
    });

    await sendVerificationEmail(email, verificationLink);

    res.status(200).json({ success: true, message: "New verification link sent" });
  } catch (error) {
    next(error);
  }
};