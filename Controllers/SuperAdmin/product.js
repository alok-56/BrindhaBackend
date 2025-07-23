const AppErr = require("../../Helper/appError");
const emailQueue = require("../../Helper/Email/emailjobs");
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
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
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

    if (!Array.isArray(productId) || productId.length === 0) {
      return next(new AppErr("No product data provided", 400));
    }

    // Fetch all products
    const products = await Promise.all(
      productId.map((item) => ProductModel.findById(item.productId))
    );

    const missingProduct = products.find((p) => !p);
    if (missingProduct) {
      return next(new AppErr("One or more products not found", 404));
    }

    // Update each product
    await Promise.all(
      products.map((product, index) => {
        const { remarks, Commision, status } = productId[index];

        if (!["Approved", "Rejected"].includes(status)) {
          throw new Error("Invalid status provided");
        }

        product.Status = status;

        if (remarks) {
          if (!Array.isArray(product.Remarks)) {
            product.Remarks = [];
          }
          product.Remarks.push(remarks);
        }

        if (status === "Approved") {
          product.Commision = Commision;
        }

        return product.save();
      })
    );

    // Add to email queue (can be customized further for each product)
    emailQueue.add({
      email: process.env.Email,
      subject: "ProductStatusUpdated",
      name: "",
      extraData: {
        productLink: "",
        status: "", // Optional: can loop and send status/product-specific emails
      },
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Products updated successfully with approval/rejection.",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// get Product By Id
const GetProductByIdSuper = async (req, res, next) => {
  try {
    let { id } = req.params;

    let product = await ProductModel.findById(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Products Fetched successfully.",
      data: product,
    });
  } catch (error) {
    return new AppErr(error.message, 500);
  }
};

// Update Product Tag

const UpdateTagOfProduct = async (req, res, next) => {
  try {
    let { ProductId, tag, empty } = req.query;

    let product = await ProductModel.findById(ProductId);

    if (empty) {
      product.Tags = [];
    } else {
      if (product.Tags.includes(tag)) {
        return next(new AppErr(`${tag} already present for this product`));
      }

      product.Tags.push(tag);
    }

    product.save();

    return res.status(200).json({
      status: true,
      message: "Product Tags Updated successfully",
      code: 200,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchAllProduct,
  ApproveRejectProducts,
  GetProductByIdSuper,
  UpdateTagOfProduct,
};
