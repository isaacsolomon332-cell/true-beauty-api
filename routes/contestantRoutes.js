const express = require("express");
const router = express.Router();

const {
  registerContestant,
  loginContestant,
  getContestants
} = require("../controllers/contestantController");

const protect = require("../middleware/authMiddleware")

router.post("/register", registerContestant);
router.post("/login", loginContestant);
router.get("/", getContestants);

module.exports = router;
