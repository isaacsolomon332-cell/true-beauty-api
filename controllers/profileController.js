const Contestant = require("../models/Contestant");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/winstonLogger")("profile-service");

// Upload profile photo (authenticated user)
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const contestantId = req.user.id; // from auth middleware
    const photoPath = `/uploads/${req.file.filename}`; // relative URL for frontend

    const contestant = await Contestant.findByIdAndUpdate(
      contestantId,
      { photo: photoPath },
      { new: true, runValidators: true }
    );

    if (!contestant) {
      throw new AppError("Contestant not found", 404);
    }

    logger.info(`Profile photo updated for ${contestant.email}`);
    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      photoUrl: photoPath
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile (optional)
exports.getProfile = async (req, res, next) => {
  try {
    const contestant = await Contestant.findById(req.user.id).select("-password");
    if (!contestant) throw new AppError("User not found", 404);
    res.status(200).json({ success: true, data: contestant });
  } catch (error) {
    next(error);
  }
};

// Update profile fields (name, phone, etc.) – optional
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ["name", "phone", "dob"];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const contestant = await Contestant.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");
    if (!contestant) throw new AppError("User not found", 404);
    res.status(200).json({ success: true, data: contestant });
  } catch (error) {
    next(error);
  }
};