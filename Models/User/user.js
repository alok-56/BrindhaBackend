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
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    UserType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
