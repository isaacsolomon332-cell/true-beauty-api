const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/winstonLogger")("contestant-service");
const TempContestant = require("../models/TempContestant");
const Contestant = require("../models/Contestant");
const jwt = require("jsonwebtoken");

const sendVerificationEmail = async (to, link) => {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const html = `
    <html>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #4f46e5;">Welcome to Trueface!</h1>
        <p>Click the button below to verify your email:</p>
        <a href="${link}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
        <p>Or copy this link: ${link}</p>
        <p>This link expires in <strong>30 minutes</strong>.</p>
      </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `Trueface <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "Verify Your Email - Trueface",
    html: html
  });
};

// Helper: calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

exports.registerContestant = async (req, res, next) => {
  try {
    const { name, email, phone, dob, password } = req.body;
    
    logger.info(`Registration attempt for email: ${email}`);

    // 1. Validate email format and password strength
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new AppError("Invalid email format", 400);
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) throw new AppError("Password must be at least 6 characters with letters and numbers", 400);

    // 2. Age check (18–35)
    const age = calculateAge(dob);
    if (isNaN(age)) throw new AppError("Invalid date of birth", 400);
    if (age < 18 || age > 35) throw new AppError("You must be between 18 and 35 years old to participate", 400);

    // 3. Check if email already exists in permanent collection
    const existingPerm = await Contestant.findOne({ email });
    if (existingPerm) throw new AppError("Email already registered", 400);

    // 4. Check if there is already a pending temporary registration for this email
    const existingTemp = await TempContestant.findOne({ email });
    if (existingTemp) throw new AppError("A verification link has already been sent. Please check your email.", 400);

    // 5. Hash password and generate voting link
    const hashedPassword = await bcrypt.hash(password, 10);
    const nameSlug = name.toLowerCase().replace(/\s+/g, '-');
    const randomCode = uuidv4().split('-')[0];
    const votelink = `${nameSlug}-${randomCode}`;

    // 6. Create verification token and link (valid for 30 minutes)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`; // adjust port/host as needed

    // 7. Save to temporary collection (auto‑deletes after 30 min)
    await TempContestant.create({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
      votelink,
      verificationToken
    });

    // 8. Send verification email
    await sendVerificationEmail(email, verificationLink);

    logger.info(`Temporary registration created for ${email}. Link expires in 30 minutes.`);
    res.status(201).json({
      success: true,
      message: "Verification link sent. You have 30 minutes to verify. Your account will be created only after verification."
    });
  } catch (error) {
    next(error);
  }
};

// Login remains the same (only after permanent verification)
exports.loginContestant = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const contestant = await Contestant.findOne({ email });
    if (!contestant) throw new AppError("Invalid email or password", 401);
    if (!contestant.isEmailVerified) throw new AppError("Please verify your email first.", 403);
    const isMatch = await bcrypt.compare(password, contestant.password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);
    const token = jwt.sign({ id: contestant._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      contestant: {
        id: contestant._id,
        name: contestant.name,
        email: contestant.email,
        voteCount: contestant.voteCount,
        isEmailVerified: contestant.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all contestants (unchanged)
exports.getContestants = async (req, res, next) => {
  try {
    const contestants = await Contestant.find();
    res.status(200).json({ success: true, data: contestants });
  } catch (error) {
    next(error);
  }
};

// Search contestants (unchanged)
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
      return res.status(200).json({ success: true, count: 0, message: "No contestants found", data: [] });
    }
    const publicData = contestants.map(c => ({
      name: c.name,
      photo: c.photo,
      voteCount: c.voteCount,
      votingLink: c.votelink ? `/vote/${c.votelink}` : null,
      isVerified: c.isEmailVerified
    }));
    res.status(200).json({ success: true, count: publicData.length, data: publicData });
  } catch (error) {
    next(error);
  }
};