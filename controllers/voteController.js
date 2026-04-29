const { findProfile, vote } = require("../utils/voteHelpers");

exports.verifyVoteLink = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    const check = await findProfile(fullUrl);
    
    if (check?.error) {
      return res.status(400).json({
        success: false,
        message: "Invalid voting link"
      });
    }
    
    if (!check) {
      return res.status(404).json({
        success: false,
        message: "Voting link does not exist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Valid voting link",
      contestant: {
        name: check.name,
        photo: check.photo,
        voteCount: check.voteCount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.voteUser = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to vote"
      });
    }

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    const check = await findProfile(fullUrl);
    
    if (check?.error) {
      return res.status(400).json({
        success: false,
        message: "Invalid voting link"
      });
    }
    
    if (!check) {
      return res.status(404).json({
        success: false,
        message: "Voting link does not exist"
      });
    }

    const result = await vote(fullUrl, email);
    
    if (result?.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to record vote, please try again"
      });
    }

    res.status(200).json({
      success: true,
      message: "You voted successfully!",
      voteCount: result.voteCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};