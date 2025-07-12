const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ShipingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shipingaddress",
      required: true,
    },
    subOrders: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "vendor",
          required: true,
        },
        products: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            commissionPercent: { type: Number, required: true },
            size: { type: Number, required: true },
            color: { type: String },
          },
        ],
        subtotal: { type: Number, required: true },
        deliveryCharge: { type: Number, required: true },
        total: { type: Number, required: true },
        status: {
          type: String,
          enum: ["Pending", "Processing", "Delivered", "Cancelled"],
          default: "Pending",
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    paymentMode: {
      type: String,
      enum: ["ONLINE", "COD"],
      required: true,
    },
  },
  { timestamps: true }
);

const orderModal = mongoose.model("order", OrderSchema);
module.exports = orderModal;
