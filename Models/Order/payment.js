const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
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
    amount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    paymentMode: {
      type: String,
      enum: ["ONLINE", "COD", "CASH"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const paymentmodal = mongoose.model("payment", PaymentSchema);
module.exports=paymentmodal
