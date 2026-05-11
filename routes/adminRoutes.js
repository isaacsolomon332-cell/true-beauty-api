const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protectAdmin, restrictToSuperAdmin } = require("../middleware/adminAuth");

// Public admin login
router.post("/login", adminController.adminLogin);

// Protected admin routes
router.use(protectAdmin);
router.get("/contestants", adminController.getAllContestants);
router.put("/contestants/:id/approve", adminController.approveContestant);
router.put("/contestants/:id/reject", adminController.rejectContestant);
router.get("/analytics", adminController.getVotingAnalytics);
router.post("/create", restrictToSuperAdmin, adminController.createAdmin); // only superadmin

module.exports = router;