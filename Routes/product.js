const express = require("express");
const { body } = require("express-validator");
const { IsVendor } = require("../Middleware/IsVendor");
const {
  CreateProduct,
  SendProductForVerification,
  LiveProduct,
  AllProductbyVendor,
  GetProductById,
  UpdateProduct,
  getVendorProductStatsApi,
} = require("../Controllers/Vendor/product");
const { IsVendorVerified } = require("../Middleware/IsVendorverified");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  FetchAllProduct,
  ApproveRejectProducts,
  GetProductByIdSuper,
} = require("../Controllers/SuperAdmin/product");
const { IsUser } = require("../Middleware/IsUser");
const {
  FetchAllUserProduct,
  FetchUserProductById,
} = require("../Controllers/Users/products");
const ProductRouter = express.Router();

//Product add
ProductRouter.post(
  "/add/products",
  body("SubcategoryId").notEmpty().withMessage("SubcategoryId is required"),
  body("Measturments").notEmpty().withMessage("Measturments is required"),
  body("Name").notEmpty().withMessage("Name is required"),
  body("Description").notEmpty().withMessage("Description is required"),
  body("Features").notEmpty().withMessage("Features is required"),
  body("Stock").notEmpty().withMessage("Stock is required"),
  body("Yourprice").notEmpty().withMessage("Yourprice is required"),
  body("SellingPrice").notEmpty().withMessage("SellingPrice is required"),
  IsVendor,
  IsVendorVerified,
  CreateProduct
);

// Count Product Api
ProductRouter.get(
  "/count/products",
  IsVendor,
  IsVendorVerified,
  getVendorProductStatsApi
);

//Update Product
ProductRouter.patch(
  "/update/products/:id",
  IsVendor,
  IsVendorVerified,
  UpdateProduct
);

//Send for verification add
ProductRouter.patch(
  "/sendforverification",
  body("productId").notEmpty().withMessage("productId is required"),
  IsVendor,
  IsVendorVerified,
  SendProductForVerification
);

//Live Product
ProductRouter.patch(
  "/liveproduct",
  body("productId").notEmpty().withMessage("productId is required"),
  IsVendor,
  IsVendorVerified,
  LiveProduct
);

//Get My Product
ProductRouter.get(
  "/get/myproduct",
  IsVendor,
  IsVendorVerified,
  AllProductbyVendor
);

//Get Product Id
ProductRouter.get(
  "/get/myproduct/:id",
  IsVendor,
  IsVendorVerified,
  GetProductById
);

// Fetch All products super admin
ProductRouter.get("/get/products", IsSuperAdmin, FetchAllProduct);

// Fetch product by Id
ProductRouter.get("/get/products/:id", IsSuperAdmin, GetProductByIdSuper);

// Approve/Reject Products
ProductRouter.patch(
  "/approve/products",
  body("productId").notEmpty().withMessage("productId is required"),
  IsSuperAdmin,
  ApproveRejectProducts
);

// Fecth All Products for Users
ProductRouter.get("/users/get/products", IsUser, FetchAllUserProduct);

// Fetch Product by Id
ProductRouter.get("/users/get/product/:id", IsUser, FetchUserProductById);

module.exports = ProductRouter;
