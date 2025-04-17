const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    OrderId: {
      type: String,
      required: true,
    },
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    TransactionId: {
      type: String,
      required: true,
    },
    Amount: {
      type: String,
      required: true,
    },
    PaymentMode: {
      type: String,
      enum: ["COD", "ONLINE", "CASH"],
      required: true,
    },
    PaymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModal = mongoose.model("payment", PaymentSchema);
module.exports = PaymentModal;
