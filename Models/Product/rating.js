const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    VendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RatingModel = mongoose.model("rating", RatingSchema);
module.exports = RatingModel;
