const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    ProductId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WishlistModel = mongoose.model("wishlist", WishlistSchema);
module.exports = WishlistModel;
