const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

// health check
app.get("/api/health", (req, res) => res.json({ status: "KukrooKoo API is live 🐓" }));

// routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));
app.use("/api/recommendations", require("./routes/recommendRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));