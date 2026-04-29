const Contestant = require("../models/Contestant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { AppError } = require("../middleware/errorHandler");

exports.registerContestant = async (req, res, next) => {
  try {
    const { name, email, phone, dob, password } = req.body;

    const existingUser = await Contestant.findOne({ email });
    if (existingUser) {
      throw new AppError("Please use a different email, email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nameSlug = name.toLowerCase().replace(/\s+/g, '-');
    const randomCode = uuidv4().split('-')[0];
    const votelink = `${nameSlug}-${randomCode}`;

    const contestant = await Contestant.create({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
      votelink: votelink
    });

    // Email verification (non-blocking, errors don't fail registration)
    try {
      const Otp = require("../models/Otp");
      const { sendOTPEmail } = require("../utils/emailService");

      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      const verificationOTP = generateOTP();

      await Otp.create({
        userId: contestant._id,
        email: contestant.email,
        otp: verificationOTP,
        purpose: 'email_verification'
      });

      sendOTPEmail(contestant.email, verificationOTP, 'email_verification')
        .then(() => console.log(`Verification email sent to ${contestant.email}`))
        .catch(err => console.error(`Failed to send verification email: ${err.message}`));

    } catch (emailError) {
      console.error("Email verification setup failed:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Contestant registered successfully. Verification email sent.",
      data: contestant,
      votingLink: votelink
    });

  } catch (error) {
    next(error);
  }
};

exports.loginContestant = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!contestant.isEmailVerified) {
      throw new AppError(
        "Email not verified. Please check your email for verification OTP.",
        403
      );
    }

    const isMatch = await bcrypt.compare(password, contestant.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      { id: contestant._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      contestant: {
        _id: contestant._id,
        name: contestant.name,
        email: contestant.email,
        photo: contestant.photo,
        voteCount: contestant.voteCount,
        isEmailVerified: contestant.isEmailVerified
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getContestants = async (req, res, next) => {
  try {
    const contestants = await Contestant.find();
    res.status(200).json({
      success: true,
      data: contestants
    });
  } catch (error) {
    next(error);
  }
};

exports.searchContestants = async (req, res, next) => {
  try {
    const { q } = req.query;

    const searchTerm = q.replace(/[^\w\s@.-]/gi, '').trim();

    const contestants = await Contestant.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ],
      isEmailVerified: true
    }).select('name email photo voteCount votelink isEmailVerified');

    if (!contestants.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: "No contestants found",
        data: []
      });
    }

    const publicData = contestants.map(c => ({
      name: c.name,
      photo: c.photo,
      voteCount: c.voteCount,
      votingLink: c.votelink ? `/vote/${c.votelink}` : null,
      isVerified: c.isEmailVerified
    }));

    res.status(200).json({
      success: true,
      count: publicData.length,
      data: publicData
    });

  } catch (error) {
    next(error);
  }
};