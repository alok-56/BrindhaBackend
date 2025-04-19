const AppErr = require("../../Helper/appError");
const ProductModel = require("../../Models/Product/product");

// Get All Product Based on Vendor
const FetchAllProduct = async (req, res, next) => {
  try {
    let {
      Status,
      CategoryId,
      SubcategoryId,
      Measturments,
      VendorId,
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query object
    const query = {};

    if (VendorId) query.VendorId = VendorId;
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

// Approve/Reject Product
const ApproveRejectProducts = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validate input
    if (!Array.isArray(productId) || productId.length === 0) {
      return next(new AppErr("No product data provided", 400));
    }

    // Fetch all products in parallel
    const products = await Promise.all(
      productId.map((item) => ProductModel.findById(item.productId))
    );

    // Check for missing products
    const missingProduct = products.find((p) => !p);
    if (missingProduct) {
      return next(new AppErr("One or more products not found", 404));
    }

    // Update and save each product
    await Promise.all(
      products.map((product, index) => {
        const { remarks, Commision } = productId[index];

        product.Status = "Approved";

        // Add remark
        if (remarks) {
          if (!Array.isArray(product.Remarks)) {
            product.Remarks = [];
          }
          product.Remarks.push(remarks);
        }

        product.Commision = Commision;

        return product.save();
      })
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Products approved with remarks and commission.",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchAllProduct,
  ApproveRejectProducts,
};
