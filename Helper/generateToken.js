require("dotenv").config;
const jwt = require("jsonwebtoken");
const { encryptData } = require("./crypto");

const generateToken = async (data) => {
  let token = jwt.sign({ id: data }, process.env.JWT_SCRECT, {
    expiresIn: "24h",
  });

  let encryptedtoken = encryptData(token);
  return encryptedtoken;
};

module.exports = {
  generateToken,
};
