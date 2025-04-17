const express = require("express");
const { body } = require("express-validator");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  CreateTax,
  UpdateTax,
  GetAllTax,
  GetTaxById,
  DeleteTax,
} = require("../Controllers/Master/Tax");
const {
  Createmeasurement,
  Updatemeasurement,
  GetAllmeasurement,
  GetmeasurementById,
  Deletemeasurement,
} = require("../Controllers/Master/measurement");

const MasteradminRouter = express.Router();

// Tax create
MasteradminRouter.post(
  "/create/Tax",
  body("Taxtype").notEmpty().withMessage("Taxtype is required"),
  body("Percentage").notEmpty().withMessage("Percentage is required"),
  IsSuperAdmin,
  CreateTax
);

// Tax update
MasteradminRouter.post("/update/Tax", IsSuperAdmin, UpdateTax);

// Get Tax
MasteradminRouter.get("/get/Tax", IsSuperAdmin, GetAllTax);

// Get Tax by Id
MasteradminRouter.get("/get/Tax/:id", IsSuperAdmin, GetTaxById);

// Delete Tax
MasteradminRouter.delete("/delete/Tax/:id", IsSuperAdmin, DeleteTax);

// measurement create
MasteradminRouter.post(
  "/create/measurement",
  body("measurement").notEmpty().withMessage("measurement is required"),
  IsSuperAdmin,
  Createmeasurement
);

// measurement update
MasteradminRouter.post("/update/measurement", IsSuperAdmin, Updatemeasurement);

// Get measurement
MasteradminRouter.get("/get/measurement", IsSuperAdmin, GetAllmeasurement);

// Get measurement by Id
MasteradminRouter.get("/get/measurement/:id", IsSuperAdmin, GetmeasurementById);

// Delete measurement
MasteradminRouter.delete(
  "/delete/measurement/:id",
  IsSuperAdmin,
  Deletemeasurement
);

module.exports = MasteradminRouter;
