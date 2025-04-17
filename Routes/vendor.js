const express = require("express");
const { body } = require("express-validator");
const { Isvendor, IsVendor } = require("../Middleware/Isvendor");
const {
  CreateVendor,
  LoginVendor,
  SendForverification,
  MyVerificationData,
  Verificationstatus,
  UpdatePassword,
  UpdateVendorProfile,
} = require("../Controllers/Vendor/Auth");
const VendoradminRouter = express.Router();

// Vendor create
VendoradminRouter.post(
  "/create/vendor",
  body("BussinessName").notEmpty().withMessage("BussinessName is required"),
  body("Vendorname").notEmpty().withMessage("Vendorname is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Number").notEmpty().withMessage("Number is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  CreateVendor
);

// Login Vendor
VendoradminRouter.post(
  "/login/vendor",
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  LoginVendor
);

// Send Profile For Verification
VendoradminRouter.patch(
  "/sendverification/vendor",
  IsVendor,
  SendForverification
);

// My Verification Data
VendoradminRouter.get("/myverification", IsVendor, MyVerificationData);

// My Verification Status
VendoradminRouter.get("/myverification/status", IsVendor, Verificationstatus);

// Updated Password
VendoradminRouter.patch("/updatepassword", IsVendor, UpdatePassword);

// Update Vendor Profile
VendoradminRouter.patch(
  "/update/profile",
  body("Vendorname").notEmpty().withMessage("Vendorname is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Number").notEmpty().withMessage("Number is required"),
  IsVendor,
  UpdateVendorProfile
);

module.exports = VendoradminRouter;
