const AppErr = require("../../Helper/appError");
const ProductModel = require("../../Models/Product/product");

// fetch All Products
const FetchAllUserProduct = async (req, res, next) => {
  try {
    let {
      CategoryId,
      SubcategoryId,
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      discount,
      search,
      tag,
      Ecofriendly,
      color,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (CategoryId) query.CategoryId = CategoryId;
    if (SubcategoryId) query.SubcategoryId = SubcategoryId;
    if (Ecofriendly) query.Ecofriendly = true;

    // Price range
    if (minPrice || maxPrice) {
      query.SellingPrice = {};
      if (minPrice) query.SellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.SellingPrice.$lte = parseFloat(maxPrice);
    }

    // Discount
    if (discount) {
      if (discount === "true") {
        query.Discount = { $exists: true, $ne: null };
      } else {
        query.Discount = discount;
      }
    }

    // Search by name
    if (search) {
      query.Name = { $regex: search, $options: "i" };
    }

    // Tag filtering (e.g., 'trending', 'bestseller')
    if (tag) {
      query.Tags = tag;
    }

    if (color) {
      query.color = color;
    }

    const products = await ProductModel.find(query)
      .populate({
        path: "VendorId",
        populate: {
          path: "CompanyId",
          model: "Company",
          select: "Address chargeperkm",
        },
      })
      .populate("Measturments")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await ProductModel.countDocuments(query);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product Fetched Successfully",
      data: products,
      pagination: {
        total: totalCount,
        page: page,
        totalPages: Math.ceil(totalCount / limit),
        limit: limit,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// get product by Id
const FetchUserProductById = async (req, res, next) => {
  try {
    let { id } = req.params;

    let product = await ProductModel.findById(id)
      .populate({
        path: "VendorId",
        populate: {
          path: "CompanyId",
          model: "Company",
          select: "Address chargeperkm",
        },
      })
      .populate("Measturments");
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product Fetched Successfully",
      data: product,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchAllUserProduct,
  FetchUserProductById,
};
