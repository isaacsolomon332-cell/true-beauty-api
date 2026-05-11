const Admin = require("../models/Admin");
const Contestant = require("../models/Contestant");
const jwt = require("jsonwebtoken");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/winstonLogger")("admin-service");

// Admin login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email and password required", 400);

    const admin = await Admin.findOne({ email });
    if (!admin) throw new AppError("Invalid credentials", 401);

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ success: true, token, admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (error) {
    next(error);
  }
};

// Get all contestants (admin view)
exports.getAllContestants = async (req, res, next) => {
  try {
    const contestants = await Contestant.find().select("-password");
    res.status(200).json({ success: true, count: contestants.length, data: contestants });
  } catch (error) {
    next(error);
  }
};

// Approve contestant
exports.approveContestant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contestant = await Contestant.findById(id);
    if (!contestant) throw new AppError("Contestant not found", 404);

    contestant.status = "approved";
    await contestant.save();

    logger.info(`Admin ${req.admin.email} approved contestant ${contestant.email}`);
    res.status(200).json({ success: true, message: "Contestant approved", data: contestant });
  } catch (error) {
    next(error);
  }
};

// Reject contestant
exports.rejectContestant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contestant = await Contestant.findById(id);
    if (!contestant) throw new AppError("Contestant not found", 404);

    contestant.status = "rejected";
    await contestant.save();

    logger.info(`Admin ${req.admin.email} rejected contestant ${contestant.email}`);
    res.status(200).json({ success: true, message: "Contestant rejected", data: contestant });
  } catch (error) {
    next(error);
  }
};

// Get voting analytics
exports.getVotingAnalytics = async (req, res, next) => {
  try {
    const totalVotes = await Contestant.aggregate([{ $group: { _id: null, total: { $sum: "$voteCount" } } }]);
    const topContestants = await Contestant.find().sort({ voteCount: -1 }).limit(10).select("name email voteCount photo");
    const totalContestants = await Contestant.countDocuments();
    const verifiedCount = await Contestant.countDocuments({ isEmailVerified: true });

    res.status(200).json({
      success: true,
      data: {
        totalVotes: totalVotes[0]?.total || 0,
        topContestants,
        totalContestants,
        verifiedEmails: verifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new admin (superadmin only)
exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) throw new AppError("Email and password required", 400);

    const existing = await Admin.findOne({ email });
    if (existing) throw new AppError("Admin already exists", 400);

    const admin = await Admin.create({ email, password, role: role || "admin" });
    res.status(201).json({ success: true, message: "Admin created", data: { email: admin.email, role: admin.role } });
  } catch (error) {
    next(error);
  }
};