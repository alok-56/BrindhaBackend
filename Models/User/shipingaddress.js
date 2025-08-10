const mongoose = require("mongoose");

const ShipingAddressSchema = new mongoose.Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    FullAddress: {
      type: String,
      required: true,
    },
    Country: {
      type: String,
      required: true,
    },
    State: {
      type: String,
      required: true,
    },
    City: {
      type: String,
      required: true,
    },
    Pincode: {
      type: Number,
      required: true,
    },
    lat: {
      type: String,
    },
    long: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ShipingAddressSchemaModel = mongoose.model(
  "shipingaddress",
  ShipingAddressSchema
);
module.exports = ShipingAddressSchemaModel;
