const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    OrderId: {
      type: String,
      required: true,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    OrderItems: [
      {
        ProductId: String,
        Quantity: Number,
        MeasturmentId: String,
        Price: Number,
      },
    ],
    TotalProductPrice: {
      type: Number,
      required: true,
    },
    DeliveryChanges: {
      type: Number,
      required: true,
    },
    Tax1: {
      type: Number,
      required: true,
    },
    TotalBill: {
      type: Number,
      required: true,
    },
    TotalCommision: {
      type: Number,
      required: true,
    },
    OrderStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    TrackingInfo: {
      trackingNumber: {
        type: String,
        default: "",
      },
      carrier: {
        type: String,
        default: "",
      },
    },
    PaymentMode: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    PaymentStatus: {
      type: String,
      enum: ["COD", "ONLINE", "CASH"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("order", OrderSchema);
module.exports = OrderModel;
