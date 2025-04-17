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
    Measturments: {
      type: mongoose.Schema.Types.ObjectId,
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
      required: true,
    },
    Images: [],
    Commision: {
      type: String,
      required: true,
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
      enum: ["Pending", "Rejected", "Approved"],
    },
    Remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ Subcategoryname: 1 });
ProductSchema.createIndexes();

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
