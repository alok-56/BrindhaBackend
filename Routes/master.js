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
const {
  Createcateogries,
  Updatecateogries,
  GetAllcateogries,
  GetcateogriesById,
  Deletecateogries,
} = require("../Controllers/Master/cateogries");
const {
  Createsubcateogries,
  Updatesubcateogries,
  GetAllsubcateogries,
  GetsubcateogriesById,
  Deletesubcateogries,
} = require("../Controllers/Master/subcateogies");

const MasteradminRouter = express.Router();

// <!------------------------------------TAX---------------------------------------!>

// Tax create
MasteradminRouter.post(
  "/create/Tax",
  body("Taxtype").notEmpty().withMessage("Taxtype is required"),
  body("Percentage").notEmpty().withMessage("Percentage is required"),
  IsSuperAdmin,
  CreateTax
);

// Tax update
MasteradminRouter.patch("/update/Tax/:id", IsSuperAdmin, UpdateTax);

// Get Tax
MasteradminRouter.get("/get/Tax", IsSuperAdmin, GetAllTax);

// Get Tax by Id
MasteradminRouter.get("/get/Tax/:id", IsSuperAdmin, GetTaxById);

// Delete Tax
MasteradminRouter.delete("/delete/Tax/:id", IsSuperAdmin, DeleteTax);

// <!------------------------------------MEASUREMENT---------------------------------!>

// measurement create
MasteradminRouter.post(
  "/create/measurement",
  body("measurement").notEmpty().withMessage("measurement is required"),
  IsSuperAdmin,
  Createmeasurement
);

// measurement update
MasteradminRouter.patch(
  "/update/measurement/:id",
  IsSuperAdmin,
  Updatemeasurement
);

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

// <!------------------------------CATEOGRIES----------------------------------!>

// cateogries create
MasteradminRouter.post(
  "/create/cateogries",
  body("Categoryname").notEmpty().withMessage("Categoryname is required"),
  IsSuperAdmin,
  Createcateogries
);

// cateogries update
MasteradminRouter.patch(
  "/update/cateogries/:id",
  IsSuperAdmin,
  Updatecateogries
);

// Get cateogries
MasteradminRouter.get("/get/cateogries", IsSuperAdmin, GetAllcateogries);

// Get cateogries by Id
MasteradminRouter.get("/get/cateogries/:id", IsSuperAdmin, GetcateogriesById);

// Delete cateogries
MasteradminRouter.delete(
  "/delete/cateogries/:id",
  IsSuperAdmin,
  Deletecateogries
);

// <!------------------------------SUB CATEOGRIES----------------------------------!>

// sub cateogries create
MasteradminRouter.post(
  "/create/subcateogries",
  body("CategoryId").notEmpty().withMessage("CategoryId is required"),
  body("Subcategoryname").notEmpty().withMessage("Subcategoryname is required"),
  IsSuperAdmin,
  Createsubcateogries
);

// cateogries update
MasteradminRouter.patch(
  "/update/subcateogries/:id",
  IsSuperAdmin,
  Updatesubcateogries
);

// Get cateogries
MasteradminRouter.get("/get/subcateogries", IsSuperAdmin, GetAllsubcateogries);

// Get cateogries by Id
MasteradminRouter.get(
  "/get/subcateogries/:id",
  IsSuperAdmin,
  GetsubcateogriesById
);

// Delete cateogries
MasteradminRouter.delete(
  "/delete/subcateogries/:id",
  IsSuperAdmin,
  Deletesubcateogries
);

module.exports = MasteradminRouter;
