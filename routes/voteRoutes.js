const express = require("express");
const router = express.Router();

const { verifyVoteLink, voteUser } = require("../controllers/voteController");



router.route("/:slug")
  .get(verifyVoteLink)
  .put(voteUser);        

module.exports = router;