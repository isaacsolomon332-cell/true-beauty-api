const Contestant = require("../models/Contestant");

// Helper 1: Find contestant by votelink
exports.findProfile = async (votelink) => {
  try {
    // Extract just the slug part from full URL if needed
    // Example: from "http://localhost:5000/vote/jane-123" get "jane-123"
    const slug = votelink.split('/').pop();
    
    const contestant = await Contestant.findOne({ votelink: slug });
    return contestant;
  } catch (error) {
    return { error: error.message };
  }
};

// Helper 2: Record a vote
exports.vote = async (votelink, email) => {
  try {
    // Extract slug from full URL
    const slug = votelink.split('/').pop();
    
    const contestant = await Contestant.findOne({ votelink: slug });
    if (!contestant) return { error: "Invalid vote link" };

    // Check if this email already voted
    const alreadyVoted = contestant.voters.includes(email);
    if (alreadyVoted) return { error: "User has already voted" };

    // Record the vote
    contestant.voters.push(email);
    contestant.voteCount += 1;
    await contestant.save();

    return { success: true, voteCount: contestant.voteCount };
  } catch (error) {
    return { error: error.message };
  }
};