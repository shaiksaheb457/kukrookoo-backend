const express = require("express");
const router  = express.Router();
const {
  createOrder, getMyOrders, getAllOrders,
  updateOrderStatus, getAnalytics,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/",            protect, createOrder);
router.get ("/my-orders",   protect, getMyOrders);

// Admin
router.get ("/admin/all",       protect, adminOnly, getAllOrders);
router.put ("/admin/:id/status", protect, adminOnly, updateOrderStatus);
router.get ("/admin/analytics", protect, adminOnly, getAnalytics);

module.exports = router;