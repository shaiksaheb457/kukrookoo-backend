const express = require("express");
const router  = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,updateProfile,
  addAddress, getAllCustomers,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/register",        register);
router.post("/verify-otp",      verifyOtp);
router.post("/resend-otp",      resendOtp);
router.post("/login",           login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.get ("/me",              protect, getMe);
router.put ("/profile", protect, updateProfile);
router.post("/address", protect, addAddress);
router.get("/admin/customers", protect, adminOnly, getAllCustomers);

module.exports = router;