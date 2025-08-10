const express = require("express");
const { body } = require("express-validator");
const {
  CreateContactUs,
  GetAllContactUs,
} = require("../Controllers/Public/contactus");

const publicrouter = express.Router();

// Validation middleware
const validateContact = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

publicrouter.post("/contact/create", validateContact, CreateContactUs);

publicrouter.get("/contact/get", GetAllContactUs);

module.exports = publicrouter;
