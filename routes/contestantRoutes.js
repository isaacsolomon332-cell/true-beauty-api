const express = require("express");
const contestantRouter = express.Router();

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

contestantRouter.post("/register", validateRegistration, registerContestant)
.post("/login", validateLogin, loginContestant)
.get("/search", validateSearch, searchRateLimiter, searchContestants)
.get("/", protect, getContestants)

module.exports = contestantRouter;