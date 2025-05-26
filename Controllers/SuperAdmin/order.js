const AppErr = require("../../Helper/appError");
const orderModal = require("../../Models/Order/order");
const paymentmodal = require("../../Models/Order/payment");

// Fetch All order
const FetchAllorderbySuper = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await orderModal.aggregate([
      { $unwind: "$subOrders" },

      {
        $lookup: {
          from: "payments",
          let: {
            orderId: "$_id",
            vendorId: "$subOrders.vendorId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$orderId", "$$orderId"] },
                    { $eq: ["$vendorId", "$$vendorId"] },
                  ],
                },
              },
            },
          ],
          as: "payment",
        },
      },
      {
        $unwind: {
          path: "$payment",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          orderId: "$_id",
          userId: 1,
          ShipingAddress: 1,
          vendorId: "$subOrders.vendorId",
          products: "$subOrders.products",
          subOrderStatus: "$subOrders.status",
          subOrderTotal: "$subOrders.total",
          deliveryCharge: "$subOrders.deliveryCharge",
          returnStatus: "$subOrders.ReturnStatus",
          payment: "$payment",
        },
      },
      { $sort: { "payment.createdAt": -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await orderModal.aggregate([
      { $unwind: "$subOrders" },
      { $count: "total" },
    ]);

    return res.status(200).json({
      status: true,
      message: "SubOrders with payments fetched successfully",
      data,
      pagination: {
        totalRecords: total[0]?.total || 0,
        currentPage: page,
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
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

    const order = await paymentmodal.findById(id).populate("orderId");

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
