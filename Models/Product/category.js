const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    Categoryname: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ Categoryname: 1 });
CategorySchema.createIndexes();

const CategoryModel = mongoose.model("category", CategorySchema);
module.exports = CategoryModel;
