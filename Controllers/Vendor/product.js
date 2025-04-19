const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const CategoryModel = require("../../Models/Master/category");
const MeasurementModel = require("../../Models/Master/Measurement");
const ProductModel = require("../../Models/Product/product");
const SubcategoryModel = require("../../Models/Master/subcategory");

// Add Product
const CreateProduct = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let {
      SubcategoryId,
      Measturments,
      Name,
      Description,
      Features,
      Stock,
      Images,
      Yourprice,
      SellingPrice,
    } = req.body;

    let subcateogery = await SubcategoryModel.findById(SubcategoryId);
    if (!subcateogery) {
      return next(new AppErr("Sub Cateogeries not Found", 404));
    }
    req.body.CategoryId = subcateogery.CategoryId;
    req.body.VendorId = req.user;

    let measurement = await MeasurementModel.findById(Measturments);
    if (!measurement) {
      return next(new AppErr("Measurement not Found", 404));
    }

    let product = await ProductModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product added Successfully",
      data: product,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Send Product For Verification
const SendProductForVerification = async (req, res, next) => {
  try {
    let { productId } = req.body;

    // Check if it's an array
    if (!Array.isArray(productId) || productId.length === 0) {
      return next(new AppErr("No product IDs provided", 400));
    }

    // Fetch all products in parallel
    const products = await Promise.all(
      productId.map((id) => ProductModel.findById(id))
    );

    // Check for any missing products
    const missingProduct = products.find((p) => !p);
    if (missingProduct) {
      return next(new AppErr("One or more products not found", 404));
    }

    // Update and save all in parallel
    await Promise.all(
      products.map((product) => {
        product.Status = "SendForApprove";
        return product.save();
      })
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product Send For Approval",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Make Product Live
const LiveProduct = async (req, res, next) => {
  try {
    let { productId } = req.body;

    // Check if it's an array
    if (!Array.isArray(productId) || productId.length === 0) {
      return next(new AppErr("No product IDs provided", 400));
    }

    // Fetch all products in parallel
    const products = await Promise.all(
      productId.map((id) => ProductModel.findById(id))
    );

    // Check for any missing products
    const missingProduct = products.find((p) => !p);
    if (missingProduct) {
      return next(new AppErr("One or more products not found", 404));
    }

    const notapproved = products.find((p) => p.Status !== "Approved");
    if (notapproved) {
      return next(new AppErr("Some Products are not approved", 400));
    }

    // Update and save all in parallel
    await Promise.all(
      products.map((product) => {
        product.Status = "Live";
        return product.save();
      })
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product is Successfully Available to sell",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All Product by Vendor Id
const AllProductbyVendor = async (req, res, next) => {
  try {
    let {
      Status,
      CategoryId,
      SubcategoryId,
      Measturments,
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query object
    const query = {
      VendorId: req.user,
    };

    if (Status) query.Status = Status;
    if (CategoryId) query.CategoryId = CategoryId;
    if (SubcategoryId) query.SubcategoryId = SubcategoryId;
    if (Measturments) query.Measturments = Measturments;

    // Fetch filtered and paginated products
    const products = await ProductModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await ProductModel.countDocuments(query);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product added Successfully",
      data: products,
      pagination: {
        totalRecords: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        perPage: limit,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Product by Id
const GetProductById = async (req, res, next) => {
  try {
    let { id } = req.params;

    let product = await ProductModel.findById(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product fetched Successfully",
      data: product,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateProduct,
  SendProductForVerification,
  LiveProduct,
  AllProductbyVendor,
  GetProductById,
};
