const mongoose = require("mongoose");

const ReturnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    subOrderIndex: {
      type: Number,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        refundedAmount: Number,
      },
    ],
    returnAmount: {
      type: Number,
      required: true,
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Refunded", "Failed"],
      default: "Requested",
    },
    reason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

 const ReturnModal= mongoose.model("Return", ReturnSchema);
 module.exports=ReturnModal
