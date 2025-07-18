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

    let { ProductId } = req.params;

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
// const FetchVendorRating = async (req, res, next) => {
//   try {
//     let err = validationResult(req);
//     if (err.errors.length > 0) {
//       return next(new AppErr(err.errors[0].msg, 403));
//     }

//     let rate = await RatingModel.find({ VendorId: req.user })
//       .populate("VendorId")
//       .populate("UserId").populate("ProductId")

//     return res.status(200).json({
//       status: true,
//       code: 200,
//       message: "Rating fetched successfully",
//       data: rate,
//     });
//   } catch (error) {
//     return next(new AppErr(error.message));
//   }
// };

const moment = require("moment");

const FetchVendorRating = async (req, res, next) => {
  try {
    const err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter;

    const vendorId = req.user;
    const dateFilter = {};
    const now = moment();

    // Time-based filter logic
    if (filter === "today") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("day").toDate(),
        $lt: now.clone().endOf("day").toDate(),
      };
    } else if (filter === "week") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("week").toDate(),
        $lt: now.clone().endOf("week").toDate(),
      };
    } else if (filter === "month") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("month").toDate(),
        $lt: now.clone().endOf("month").toDate(),
      };
    } else if (filter === "year") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("year").toDate(),
        $lt: now.clone().endOf("year").toDate(),
      };
    } else if (filter && !["today", "week", "month", "year"].includes(filter)) {
      return next(
        new AppErr("Invalid filter. Use 'today', 'week', 'month', or 'year'.", 400)
      );
    }

    const query = {
      VendorId: vendorId,
      ...(filter ? dateFilter : {}),
    };

    const [total, ratings] = await Promise.all([
      RatingModel.countDocuments(query),
      RatingModel.find(query)
        .populate("VendorId")
        .populate("UserId")
        .populate("ProductId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Rating fetched successfully",
      data: ratings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
