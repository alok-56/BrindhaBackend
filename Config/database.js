const mongoose = require("mongoose");
require("dotenv").config();

const ConnectDatabase = async () => {
  try {
    mongoose
      .connect(process.env.DATABASE_URL)
      .then((res) => {
        console.log("Database Connected Successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = ConnectDatabase;
