const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name:     String,
        price:    Number,
        quantity: Number,
        weight:   String,
      },
    ],
    shippingAddress: {
      name:         String,
      phone:        String,
      line1:        String,
      line2:        String,
      city:         String,
      state:        String,
      pincode:      String,
      instructions: String,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi", "cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayPaymentId: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);