const AppErr = require("../../Helper/appError");
const paymentmodal = require("../../Models/Order/payment");

// Get All Order
const FetchAllorderbySuper = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    // Get total count
    const total = await paymentmodal.countDocuments();

    // Fetch paginated results
    let orders = await paymentmodal
      .find()
      .populate("orderId") // Make sure 'OrderId' matches your schema field
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
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

// Get Order By Id
const GetOrderByOrderId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Order ID is required",
      });
    }

    const order = await paymentmodal
      .findById(id)
      .populate("orderId")

    if (!order || order.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No order found with this Order ID",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchAllorderbySuper,
  GetOrderByOrderId,
};
