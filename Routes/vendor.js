const express = require("express");
const { body } = require("express-validator");
const { Isvendor, IsVendor } = require("../Middleware/IsVendor");
const {
  CreateVendor,
  LoginVendor,
  SendForverification,
  MyVerificationData,
  Verificationstatus,
  UpdatePassword,
  UpdateVendorProfile,
  CreateSupportVendor,
  UpdateSupportVendor,
  GetAllSupportVendors,
  GetSupportVendorById,
  DeleteSupportVendor,
} = require("../Controllers/Vendor/auth");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const { IsVendorVerified } = require("../Middleware/IsVendorverified");
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

// Create Support Vendor
VendoradminRouter.post(
  "/support/staff/vendor",
  body("Vendorname").notEmpty().withMessage("Vendorname is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Number").notEmpty().withMessage("Number is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  IsVendor,
  IsVendorVerified,
  CreateSupportVendor
);

// Update Support Vendor
VendoradminRouter.patch(
  "/support/staff/vendor/:VendorId",
  IsVendor,
  IsVendorVerified,
  UpdateSupportVendor
);

VendoradminRouter.get(
  "/support/staff/vendors",
  IsVendor,
  IsVendorVerified,
  GetAllSupportVendors
);

VendoradminRouter.get(
  "/support/staff/vendor/:VendorId",
  IsVendor,
  IsVendorVerified,
  GetSupportVendorById
);

VendoradminRouter.delete(
  "/support/staff/vendor/:VendorId",
  IsVendor,
  IsVendorVerified,
  DeleteSupportVendor
);

module.exports = VendoradminRouter;
