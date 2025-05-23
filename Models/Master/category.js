const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    Categoryname: {
      type: String,
      required: true,
    },
    Image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CategoryModel = mongoose.model("category", CategorySchema);
module.exports = CategoryModel;
