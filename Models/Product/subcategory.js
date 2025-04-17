const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema(
  {
    CategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    Subcategoryname: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SubcategorySchema.index({ Subcategoryname: 1 });
SubcategorySchema.createIndexes();

const SubcategoryModel = mongoose.model("Subcategory", SubcategorySchema);
module.exports = SubcategoryModel;
