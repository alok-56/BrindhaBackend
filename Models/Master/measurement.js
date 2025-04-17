const mongoose = require("mongoose");

const MeasurementSchema = new mongoose.Schema(
  {
    measurement: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MeasurementModel = mongoose.model("Measurement", MeasurementSchema);
module.exports = MeasurementModel;
