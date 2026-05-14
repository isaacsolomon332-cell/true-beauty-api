const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");
const {
  uploadProfilePhoto,
  getProfile,
  updateProfile
} = require("../controllers/profileController");

// All routes require authentication
router.use(protect);

// Upload profile photo (single file, field name 'profilePhoto')
router.post("/upload-photo", upload.single("profilePhoto"), uploadProfilePhoto);

// Get own profile
router.get("/me", getProfile);

// Update profile information
router.put("/me", updateProfile);

module.exports = router;