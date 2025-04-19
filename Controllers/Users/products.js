const AppErr = require("../../Helper/appError");
const ProductModel = require("../../Models/Product/product");

// fetch sub catogries

const FetchAllUserProduct = async (req, res, next) => {
  try {
    let { CategoryId, SubcategoryId, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query object
    const query = {};

    if (CategoryId) query.CategoryId = CategoryId;
    if (SubcategoryId) query.SubcategoryId = SubcategoryId;

    // Fetch filtered and paginated products
    const products = await ProductModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await ProductModel.countDocuments(query);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Product Fetched Successfully",
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

// get product by Id



module.exports = {
  FetchAllUserProduct,
};
