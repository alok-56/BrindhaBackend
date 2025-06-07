const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    Username: {
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
    },
    Password: {
      type: String,
      required: true,
    },
    UserType: {
      type: String,
      default:"individual"
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
