const express = require("express");
const router = express.Router();

const { verifyVoteLink, voteUser } = require("../controllers/voteController");

// GET /api/vote/:slug - Verify voting link
// PUT /api/vote/:slug - Submit a vote

router.route("/:slug")
  .get(verifyVoteLink)    // Check if link is valid
  .put(voteUser);         // Submit vote

module.exports = router;