const express = require("express");
const {
  CreateSuperAdmin,
  UpdateSuperAdmin,
  LoginSuperadmin,
  GetSuperAdmin,
  GetSuperAdminById,
  DeleteSuperadmin,
} = require("../Controllers/SuperAdmin/auth");
const { body } = require("express-validator");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  GetVendorList,
  GetVendorById,
  ApproveRejectvendor,
  CountVendorsSummary,
  getRevenueReport,
  getVendorStats,
} = require("../Controllers/SuperAdmin/vendor");
const SuperadminRouter = express.Router();

// super admin create
SuperadminRouter.post(
  "/create/superadmin",
  body("Name").notEmpty().withMessage("Name is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Number").notEmpty().withMessage("Number is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  CreateSuperAdmin
);

// update super admin
SuperadminRouter.patch(
  "/update/superadmin/:id",
  IsSuperAdmin,
  UpdateSuperAdmin
);

// Login super admin
SuperadminRouter.post(
  "/login/superadmin",
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  LoginSuperadmin
);

// Get All Super Admin
SuperadminRouter.get("/getAll/superadmin", IsSuperAdmin, GetSuperAdmin);

// Get Super Admin by Id
SuperadminRouter.get("/get/superadmin/:id", IsSuperAdmin, GetSuperAdminById);

// Get Super Admin by Id
SuperadminRouter.delete(
  "/delete/superadmin/:id",
  IsSuperAdmin,
  DeleteSuperadmin
);

// Get All Vendor List
SuperadminRouter.get("/get/vendorlist", IsSuperAdmin, GetVendorList);

// Get Vendor By Id
SuperadminRouter.get("/get/vendorlist/:id", IsSuperAdmin, GetVendorById);

// Update Status
SuperadminRouter.patch(
  "/updatestatus/:id/:status",
  IsSuperAdmin,
  ApproveRejectvendor
);

// Count Dashbaord vendor Status
SuperadminRouter.get("/vendor/count", IsSuperAdmin, CountVendorsSummary);

// get revenue and commison history
SuperadminRouter.get(
  "/revenue/commision/history",
  IsSuperAdmin,
  getRevenueReport
);

// vendor history
SuperadminRouter.get(
  "/vendor/history/:vendorId",
  IsSuperAdmin,
  getVendorStats
);

module.exports = SuperadminRouter;
