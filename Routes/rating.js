const express = require("express");
const { body } = require("express-validator");
const { IsUser } = require("../Middleware/IsUser");
const { CreateRating, FetchProductRating, FetchVendorRating } = require("../Controllers/rating");
const { IsVendor } = require("../Middleware/IsVendor");

const RatingRouter = express.Router();

// Rating create
RatingRouter.post(
  "/create/Rating",
  body("ProductId").notEmpty().withMessage("ProductId is required"),
  body("VendorId").notEmpty().withMessage("VendorId is required"),
  body("rating").notEmpty().withMessage("rating is required"),
  body("remarks").notEmpty().withMessage("remarks is required"),
  IsUser,
  CreateRating
);

// fetch Product Rating
RatingRouter.get(
  "/fetch/product/Rating/:ProductId",
  FetchProductRating
);

// fetch Product Rating
RatingRouter.get("/fetch/vendor/Rating", IsVendor, FetchVendorRating);

module.exports = RatingRouter;
