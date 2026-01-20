const express = require("express");
const router = express.Router();

const {
  registerContestant,
  loginContestant,
  getContestants
} = require("../controllers/contestantController");

const protect = require("../middleware/authMiddleware");

// ONLY THESE 3 ROUTES SHOULD EXIST:
router.post("/register", registerContestant);
router.post("/login", loginContestant);
router.get("/", getContestants);

module.exports = router;