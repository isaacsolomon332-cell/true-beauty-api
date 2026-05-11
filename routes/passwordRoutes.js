const express = require("express");
const passwordRouter = express.Router();

const passwordController = require("../controllers/passwordController");
const {
  protect,
  otpRateLimiter
} = require("../middleware/authMiddleware");

passwordRouter.post("/forgot-password", otpRateLimiter, passwordController.forgotPassword)
.post("/reset-password", passwordController.resetPassword)
.put("/update-password", protect, passwordController.updatePassword)

module.exports = passwordRouter;