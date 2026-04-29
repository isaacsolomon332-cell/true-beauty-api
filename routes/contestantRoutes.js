const express = require("express");
const router = express.Router();

const {
  registerContestant,
  loginContestant,
  getContestants,
  searchContestants
} = require("../controllers/contestantController");

const {
  validateRegistration,
  validateLogin,
  validateSearch
} = require("../middleware/validationMiddleware");

const {
  protect,
  searchRateLimiter
} = require("../middleware/authMiddleware");

router.post("/register", validateRegistration, registerContestant);
router.post("/login", validateLogin, loginContestant);
router.get("/search", validateSearch, searchRateLimiter, searchContestants);
router.get("/", protect, getContestants);

module.exports = router;