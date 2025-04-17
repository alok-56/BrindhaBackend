const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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

RatingSchema.index({ rating: 1 });
RatingSchema.createIndexes();

const RatingModel = mongoose.model("rating", RatingSchema);
module.exports = RatingModel;
