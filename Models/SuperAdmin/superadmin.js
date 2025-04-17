const mongoose = require("mongoose");

const SuperadminSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Number: {
      type: Number,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Permission: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);

const SuperadminModel = mongoose.model("Superadmin", SuperadminSchema);

module.exports = SuperadminModel;
