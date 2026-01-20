const Contestant = require("../models/Contestant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // ADD THIS LINE AT TOP

exports.registerContestant = async (req, res) => {
  try {
    const { name, email, phone, dob, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
 
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain letters and numbers and be at least 6 characters"
      });
    }

    // Check existing user
    const existingUser = await Contestant.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "please use a different email, email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ============ ADD THIS CODE ============
    // Generate unique voting link
    const nameSlug = name.toLowerCase().replace(/\s+/g, '-'); // "John Doe" -> "john-doe"
    const randomCode = uuidv4().split('-')[0]; // Get first part of UUID
    const votelink = `${nameSlug}-${randomCode}`; // Example: "john-doe-a1b2c3"
    // ============ END OF ADDED CODE ============

    const contestant = await Contestant.create({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
      votelink: votelink // ADD THIS FIELD
    });

    res.status(201).json({
      success: true,
      message: "Contestant registered successfully",
      data: contestant,
      votingLink: votelink // ADD THIS TO RESPONSE
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.loginContestant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const contestant = await Contestant.findOne({ email });
    if (!contestant) {
      return res.status(400).json({
        success: false,
        message: "Invalid email"
      });
    }

    const isMatch = await bcrypt.compare(password, contestant.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: contestant._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      contestant
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getContestants = async (req, res) => {
  try {
    const contestants = await Contestant.find();
    res.status(200).json({
      success: true,
      data: contestants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const updatePasword = (contestants) => {
  
}