const { findProfile, vote } = require("../utils/voteHelpers");

// Verify if voting link is valid
exports.verifyVoteLink = async (req, res) => {
  try {
    // Construct full URL from request
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

    // Link is valid
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

// Process a vote
exports.voteUser = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to vote"
      });
    }

    // Construct full URL from request
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    // First verify the link exists
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

    // Process the vote
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

    // Vote successful
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