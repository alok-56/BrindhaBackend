const AppErr = require("../../Helper/appError");
const orderModal = require("../../Models/Order/order");
const paymentmodal = require("../../Models/Order/payment");

// Fetch All order
const FetchAllorderbySuper = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status;

    const matchStage = statusFilter
      ? { $match: { "subOrders.status": statusFilter } }
      : { $match: {} };

    const data = await orderModal.aggregate([
      { $unwind: "$subOrders" },
      matchStage,

      // Join with payments collection
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

      // Join with users collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Join with shipping address collection
      {
        $lookup: {
          from: "shipingaddresses",
          localField: "userId",
          foreignField: "UserId",
          as: "shippingDetails",
        },
      },
      {
        $unwind: {
          path: "$shippingDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          orderId: "$_id",
          userId: 1,
          vendorId: "$subOrders.vendorId",
          products: "$subOrders.products",
          subOrderStatus: "$subOrders.status",
          subOrderTotal: "$subOrders.total",
          deliveryCharge: "$subOrders.deliveryCharge",
          returnStatus: "$subOrders.ReturnStatus",
          payment: "$payment",
          userDetails: {
            Username: "$userDetails.Username",
            Email: "$userDetails.Email",
            Number: "$userDetails.Number",
            UserType: "$userDetails.UserType",
          },
          shippingDetails: {
            FullAddress: "$shippingDetails.FullAddress",
            Country: "$shippingDetails.Country",
            State: "$shippingDetails.State",
            City: "$shippingDetails.City",
            Pincode: "$shippingDetails.Pincode",
          },
        },
      },

      { $sort: { "payment.createdAt": -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Count total with same match condition
    const total = await orderModal.aggregate([
      { $unwind: "$subOrders" },
      ...(statusFilter ? [{ $match: { "subOrders.status": statusFilter } }] : []),
      { $count: "total" },
    ]);

    return res.status(200).json({
      status: true,
      message: "SubOrders with payments, user, and shipping details fetched successfully",
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

   const order = await paymentmodal.findById(id)
  .populate({
    path: "orderId",
    populate: [
      {
        path: "userId",
        model: "user", 
      },
      {
        path: "ShipingAddress",
        model: "shipingaddress", 
      },
      {
        path: "subOrders.vendorId",
        model: "vendor", 
      },
      {
        path: "subOrders.products.productId",
        model: "Product", 
      }
    ]
  });



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
