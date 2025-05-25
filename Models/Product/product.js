const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    CategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    SubcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    Ecofriendly: {
      type: Boolean,
      required: true,
      default: false,
    },
    Measturments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Measurement",
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Discount: {
      type: String,
    },
    Features: {
      type: [],
      required: true,
    },
    Stock: {
      type: Number,
      required: true,
    },
    LockStock: {
      type: Number,
    },
    Images: [],
    Commision: {
      type: Number,
    },
    Yourprice: {
      type: Number,
      required: true,
    },
    SellingPrice: {
      type: Number,
      required: true,
    },
    Status: {
      type: String,
      required: true,
      enum: ["Pending", "SendForApprove", "Rejected", "Approved", "Live"],
      default: "Pending",
    },
    Remarks: [
      {
        type: String,
      },
    ],
    Tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
