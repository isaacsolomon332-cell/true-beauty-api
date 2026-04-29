const Contestant = require("../models/Contestant");

exports.findProfile = async (votelink) => {
  try {
    
    const slug = votelink.split('/').pop();
    
    const contestant = await Contestant.findOne({ votelink: slug });
    return contestant;
  } catch (error) {
    return { error: error.message };
  }
};

exports.vote = async (votelink, email) => {
  try {
    const slug = votelink.split('/').pop();
    
    const contestant = await Contestant.findOne({ votelink: slug });
    if (!contestant) return { error: "Invalid vote link" };

    const alreadyVoted = contestant.voters.includes(email);
    if (alreadyVoted) return { error: "User has already voted" };

    contestant.voters.push(email);
    contestant.voteCount += 1;
    await contestant.save();

    return { success: true, voteCount: contestant.voteCount };
  } catch (error) {
    return { error: error.message };
  }
};