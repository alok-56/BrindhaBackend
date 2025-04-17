const mongoose = require("mongoose");

const TaxSchema = new mongoose.Schema(
  {
    Taxtype: {
      type: String,
      required: true,
    },
    Percentage: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TaxModel = mongoose.model("Tax", TaxSchema);
module.exports = TaxModel;
