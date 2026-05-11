const express = require("express");
const voteRouter = express.Router();

const { verifyVoteLink, voteUser } = require("../controllers/voteController");



voteRouter.route("/:slug")
  .get(verifyVoteLink)
  .put(voteUser);        

module.exports = voteRouter;