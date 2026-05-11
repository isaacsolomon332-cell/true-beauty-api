const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { AppError } = require("./errorHandler");

exports.protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return next(new AppError("Admin not found", 401));
    req.admin = admin;
    next();
  } catch (error) {
    return next(new AppError("Invalid token", 401));
  }
};

// Optional: restrict to superadmin only
exports.restrictToSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "superadmin") {
    return next(new AppError("Only superadmin can perform this action", 403));
  }
  next();
};