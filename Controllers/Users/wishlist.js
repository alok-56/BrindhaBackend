const AppErr = require("../../Helper/appError");
const ProductModel = require("../../Models/Product/product");
const WishlistModel = require("../../Models/Product/wishlist");


// Add/Remove Product in wish list

const AddOrUpdateWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return next(new AppErr("Product not found", 404));
    }

    let wishlist = await WishlistModel.findOne({ UserId: userId });

    if (!wishlist) {
      wishlist = await WishlistModel.create({
        UserId: userId,
        ProductId: [productId],
      });
    } else {
      const index = wishlist.ProductId.findIndex(
        (id) => id.toString() === productId
      );

      if (index > -1) {
        wishlist.ProductId.splice(index, 1);
      } else {
        wishlist.ProductId.push(productId);
      }

      await wishlist.save();
    }

    return res.status(200).json({
      status: true,
      message: "Wishlist updated successfully",
      data: wishlist,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All Wishlist products
const GetWishlistByUserId = async (req, res, next) => {
  try {
    const userId = req.user;

    const wishlist = await WishlistModel.findOne({ UserId: userId }).populate({
      path: "ProductId",
      model: "Product",
    });

    if (!wishlist || wishlist.ProductId.length === 0) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Wishlist is empty",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Wishlist fetched successfully",
      data: wishlist.ProductId,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  AddOrUpdateWishlist,
  GetWishlistByUserId,
};
