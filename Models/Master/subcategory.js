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


const SubcategoryModel = mongoose.model("Subcategory", SubcategorySchema);
module.exports = SubcategoryModel;
