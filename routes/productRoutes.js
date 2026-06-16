const express = require("express");
const router  = express.Router();
const {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getAllProductsAdmin,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/",     getProducts);
router.get("/:id",  getProductById);

// Admin
router.get("/admin/all", protect, adminOnly, getAllProductsAdmin);
router.post("/",          protect, adminOnly, createProduct);
router.put("/:id",         protect, adminOnly, updateProduct);
router.delete("/:id",      protect, adminOnly, deleteProduct);

module.exports = router;