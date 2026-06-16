const Product = require("../models/Product");

// Simple "AI" recommendation — based on category similarity & rating
exports.getRecommendations = async (req, res) => {
  try {
    const { category, exclude } = req.query;

    const filter = { isActive: true };
    if (exclude) filter._id = { $ne: exclude };
    if (category) filter.category = category;

    let products = await Product.find(filter)
      .sort({ rating: -1, reviews: -1 })
      .limit(4);

    // If not enough in same category, fill with top-rated overall
    if (products.length < 4) {
      const more = await Product.find({
        isActive: true,
        _id: { $ne: exclude },
      })
        .sort({ rating: -1 })
        .limit(4 - products.length);

      const existingIds = products.map((p) => p._id.toString());
      products = [...products, ...more.filter((p) => !existingIds.includes(p._id.toString()))];
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};