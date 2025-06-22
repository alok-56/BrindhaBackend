const { validationResult } = require("express-validator");
const AppErr = require("../Helper/appError");
const RatingModel = require("../Models/Product/rating");

// Create Rating
const CreateRating = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { ProductId, VendorId, rating, remarks } = req.body;
    req.body.UserId = req.user;

    let rate = await RatingModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Rating created successfully",
      data: rate,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// Fetch rating of products
const FetchProductRating = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { ProductId } = req.body;

    let rate = await RatingModel.find({ ProductId: ProductId });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Rating fetched successfully",
      data: rate,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// Get All rating of vendor
const FetchVendorRating = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }


    let rate = await RatingModel.find({ VendorId: req.user })
      .populate("VendorId")
      .populate("UserId");

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Rating fetched successfully",
      data: rate,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

module.exports = {
  CreateRating,
  FetchProductRating,
  FetchVendorRating,
};
