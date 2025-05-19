const mongoose = require("mongoose");

const PayoutSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment",
      },
    ],
    razorpayPayoutId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const payoutmodal = mongoose.model("payout", PayoutSchema);
module.exports = payoutmodal;
