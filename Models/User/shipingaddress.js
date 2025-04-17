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
  },
  {
    timestamps: true,
  }
);

ShipingAddressSchemaModel.index({ UserId: 1 });
ShipingAddressSchemaModel.index({ State: 1 });
ShipingAddressSchemaModel.index({ Pincode: 1 });

ShipingAddressSchemaModel.createIndexes();

const ShipingAddressSchemaModel = mongoose.model(
  "shipingaddress",
  ShipingAddressSchema
);
module.exports = ShipingAddressSchemaModel;
