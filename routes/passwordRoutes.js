const express = require("express");
const router = express.Router();

const passwordController = require("../controllers/passwordController");
const {
  protect,
  otpRateLimiter
} = require("../middleware/authMiddleware");

router.post("/forgot-password", 
  otpRateLimiter, 
  passwordController.forgotPassword
);

router.post("/reset-password", 
  passwordController.resetPassword
);

router.put("/update-password", 
  protect, 
  passwordController.updatePassword
);

module.exports = router;