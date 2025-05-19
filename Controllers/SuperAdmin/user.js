const AppErr = require("../../Helper/appError");
const orderModal = require("../../Models/Order/order");
const UserModel = require("../../Models/User/user");

// Fetch All User
const FetchAllUserbySuper = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        totalRecords: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Order of That Users
const FetchOrderbyUser = async (req, res, next) => {
  try {
    let { userid } = req.params;

    let order = await orderModal.find({ userId: userid });

    return res.status(200).json({
      status: true,
      message: "Users Orders fetched successfully",
      data: order,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchAllUserbySuper,
  FetchOrderbyUser,
};
