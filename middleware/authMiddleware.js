const jwt = require("jsonwebtoken");
const Contestant = require("../models/Contestant");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Contestant.findById(decoded.id).select("-password");

      return next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "No token, authorization denied"
  });
};

module.exports = protect;
