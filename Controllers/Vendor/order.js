const Razorpay = require("razorpay");
const AppErr = require("../../Helper/appError");
const orderModal = require("../../Models/Order/order");
const paymentmodal = require("../../Models/Order/payment");
const ReturnModal = require("../../Models/Order/return");
const ProductModel = require("../../Models/Product/product");
const moment = require("moment");
const emailQueue = require("../../Helper/Email/emailjobs");
const UserModel = require("../../Models/User/user");
const notificationModal = require("../../Models/notification");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Get All Order of Vendor
// const GetAllorder = async (req, res, next) => {
//   try {
//     const vendorId = req.user;

//     const orders = await orderModal.find({
//       "subOrders.vendorId": vendorId,
//     });

//     // Step 1: Collect all productIds from matching subOrders
//     const allProductIds = [];
//     orders.forEach((order) => {
//       order.subOrders.forEach((subOrder) => {
//         if (subOrder.vendorId.toString() === vendorId.toString()) {
//           subOrder.products.forEach((product) => {
//             allProductIds.push(product.productId.toString());
//           });
//         }
//       });
//     });

//     // Step 2: Fetch product details
//     const productDetails = await ProductModel.find({
//       _id: { $in: allProductIds },
//     }).lean();

//     const productMap = {};
//     productDetails.forEach((product) => {
//       productMap[product._id.toString()] = product;
//     });

//     // Step 3: Build response
//     const vendorOrders = orders.map((order) => {
//       const matchingSubOrders = order.subOrders
//         .filter(
//           (subOrder) => subOrder.vendorId.toString() === vendorId.toString()
//         )
//         .map((subOrder) => {
//           const enrichedProducts = subOrder.products.map((product) => ({
//             ...product.toObject(),
//             productDetails: productMap[product.productId.toString()] || null,
//           }));

//           return {
//             ...subOrder.toObject(),
//             products: enrichedProducts,
//           };
//         });

//       return {
//         orderId: order._id,
//         userId: order.userId,
//         paymentMode: order.paymentMode,
//         paymentStatus: order.paymentStatus,
//         createdAt: order.createdAt,
//         vendorSubOrders: matchingSubOrders,
//       };
//     });

//     res.status(200).json({
//       status: 200,
//       message: "Orders fetched successfully",
//       data: vendorOrders,
//     });
//   } catch (error) {
//     return next(new AppErr(error.message, 500));
//   }
// };

// const GetAllorder = async (req, res, next) => {
//   try {
//     const vendorId = req.user;
//     const filter = req.query.filter;

//     const dateFilter = {};
//     const now = moment();

//     // Set date filter range if provided
//     if (filter === "today") {
//       dateFilter.createdAt = {
//         $gte: now.clone().startOf("day").toDate(),
//         $lt: now.clone().endOf("day").toDate(),
//       };
//     } else if (filter === "week") {
//       dateFilter.createdAt = {
//         $gte: now.clone().startOf("week").toDate(),
//         $lt: now.clone().endOf("week").toDate(),
//       };
//     } else if (filter === "month") {
//       dateFilter.createdAt = {
//         $gte: now.clone().startOf("month").toDate(),
//         $lt: now.clone().endOf("month").toDate(),
//       };
//     } else if (filter === "year") {
//       dateFilter.createdAt = {
//         $gte: now.clone().startOf("year").toDate(),
//         $lt: now.clone().endOf("year").toDate(),
//       };
//     } else if (filter && !["today", "week", "month", "year"].includes(filter)) {
//       return next(
//         new AppErr(
//           "Invalid filter. Use 'today', 'week', 'month', or 'year'.",
//           400
//         )
//       );
//     }

//     // Fetch orders with vendor's subOrders and optional date filter
//     const orders = await orderModal.find({
//       "subOrders.vendorId": vendorId,
//       ...dateFilter,
//     });

//     // Collect productIds from matching subOrders
//     const allProductIds = [];
//     orders.forEach((order) => {
//       order.subOrders.forEach((subOrder) => {
//         if (subOrder.vendorId.toString() === vendorId.toString()) {
//           subOrder.products.forEach((product) => {
//             allProductIds.push(product.productId.toString());
//           });
//         }
//       });
//     });

//     // Fetch product details
//     const productDetails = await ProductModel.find({
//       _id: { $in: allProductIds },
//     }).lean();

//     const productMap = {};
//     productDetails.forEach((product) => {
//       productMap[product._id.toString()] = product;
//     });

//     // Build response
//     const vendorOrders = orders.map((order) => {
//       const matchingSubOrders = order.subOrders
//         .filter(
//           (subOrder) => subOrder.vendorId.toString() === vendorId.toString()
//         )
//         .map((subOrder) => {
//           const enrichedProducts = subOrder.products.map((product) => ({
//             ...product.toObject(),
//             productDetails: productMap[product.productId.toString()] || null,
//           }));

//           return {
//             ...subOrder.toObject(),
//             products: enrichedProducts,
//           };
//         });

//       return {
//         orderId: order._id,
//         userId: order.userId,
//         paymentMode: order.paymentMode,
//         paymentStatus: order.paymentStatus,
//         createdAt: order.createdAt,
//         vendorSubOrders: matchingSubOrders,
//       };
//     });

//     res.status(200).json({
//       status: 200,
//       message: "Orders fetched successfully",
//       data: vendorOrders,
//     });
//   } catch (error) {
//     return next(new AppErr(error.message, 500));
//   }
// };

const GetAllorder = async (req, res, next) => {
  try {
    const vendorId = req.user;
    const filter = req.query.filter;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const dateFilter = {};
    const now = moment();

    if (filter === "today") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("day").toDate(),
        $lt: now.clone().endOf("day").toDate(),
      };
    } else if (filter === "week") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("week").toDate(),
        $lt: now.clone().endOf("week").toDate(),
      };
    } else if (filter === "month") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("month").toDate(),
        $lt: now.clone().endOf("month").toDate(),
      };
    } else if (filter === "year") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("year").toDate(),
        $lt: now.clone().endOf("year").toDate(),
      };
    } else if (filter && !["today", "week", "month", "year"].includes(filter)) {
      return next(
        new AppErr("Invalid filter. Use 'today', 'week', 'month', or 'year'.", 400)
      );
    }

    // Find all matching orders
    const allMatchingOrders = await orderModal.find({
      "subOrders.vendorId": vendorId,
      ...dateFilter,
    });

    const total = allMatchingOrders.length;
    const paginatedOrders = allMatchingOrders.slice(skip, skip + limit);

    // Collect productIds from matching subOrders
    const allProductIds = [];
    paginatedOrders.forEach((order) => {
      order.subOrders.forEach((subOrder) => {
        if (subOrder.vendorId.toString() === vendorId.toString()) {
          subOrder.products.forEach((product) => {
            allProductIds.push(product.productId.toString());
          });
        }
      });
    });

    // Fetch product details
    const productDetails = await ProductModel.find({
      _id: { $in: allProductIds },
    }).lean();

    const productMap = {};
    productDetails.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // Build response
    const vendorOrders = paginatedOrders.map((order) => {
      const matchingSubOrders = order.subOrders
        .filter(
          (subOrder) => subOrder.vendorId.toString() === vendorId.toString()
        )
        .map((subOrder) => {
          const enrichedProducts = subOrder.products.map((product) => ({
            ...product.toObject(),
            productDetails: productMap[product.productId.toString()] || null,
          }));

          return {
            ...subOrder.toObject(),
            products: enrichedProducts,
          };
        });

      return {
        orderId: order._id,
        userId: order.userId,
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        vendorSubOrders: matchingSubOrders,
      };
    });

    res.status(200).json({
      status: 200,
      message: "Orders fetched successfully",
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      data: vendorOrders,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};


// Get Vendor Order Id
const GetVendorOrderById = async (req, res, next) => {
  try {
    const vendorId = req.user; // from auth middleware
    const { orderId } = req.params;

    const order = await orderModal.findById(orderId);
    if (!order) return next(new AppErr("Order not found", 404));

    const vendorSubOrders = order.subOrders.filter(
      (sub) => sub.vendorId.toString() === vendorId.toString()
    );

    if (vendorSubOrders.length === 0) {
      return next(new AppErr("Vendor has no items in this order", 403));
    }

    const allProductIds = vendorSubOrders.flatMap((sub) =>
      sub.products.map((p) => p.productId.toString())
    );

    const productDetails = await ProductModel.find({
      _id: { $in: allProductIds },
    }).lean();

    const productMap = {};
    productDetails.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const enrichedSubOrders = vendorSubOrders.map((sub) => {
      const enrichedProducts = sub.products.map((p) => ({
        ...p.toObject(),
        productDetails: productMap[p.productId.toString()] || null,
      }));
      return {
        ...sub.toObject(),
        products: enrichedProducts,
      };
    });

    res.status(200).json({
      status: 200,
      message: "Order fetched",
      data: {
        orderId: order._id,
        userId: order.userId,
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        vendorSubOrders: enrichedSubOrders,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Order Status By Vendor
const UpdateOrderStatusByVendor = async (req, res, next) => {
  try {
    const vendorId = req.user;
    const { orderId } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ["Pending", "Processing", "Delivered", "Cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return next(new AppErr("Invalid status value", 400));
    }

    const order = await orderModal.findById(orderId);
    if (!order) return next(new AppErr("Order not found", 404));

    let updated = false;
    order.subOrders = order.subOrders.map((sub) => {
      if (sub.vendorId.toString() === vendorId.toString()) {
        sub.status = newStatus;
        updated = true;
      }
      return sub;
    });

    if (!updated) {
      return next(
        new AppErr("Vendor not authorized to update this order", 403)
      );
    }

    await order.save();

    await notificationModal.create({
      userId: order.userId,
      title: `Order ${newStatus}`,
      message: `Your Order has been ${newStatus}.`,
    });

    let user = await UserModel.findById(order.userId).select("Email");

    emailQueue.add({
      email: user.Email,
      subject: "OrderStatusUpdated",
      name: "",
      extraData: {
        orderId: orderId.slice(0, 8),
        status: newStatus,
      },
    });

    res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Count Api
const GetVendorDashboardStats = async (req, res, next) => {
  try {
    const vendorId = req.user;
    const { filter } = req.query;

    let startDate;

    if (filter === "year") {
      startDate = moment().startOf("year").toDate();
    } else if (filter === "month") {
      startDate = moment().startOf("month").toDate();
    } else if (filter === "week") {
      startDate = moment().startOf("week").toDate();
    }

    // 1. Get orders by vendor
    const orderQuery = {
      "subOrders.vendorId": vendorId,
    };
    if (startDate) orderQuery.createdAt = { $gte: startDate };

    const orders = await orderModal.find(orderQuery).lean();

    // 2. Get payments by vendor
    const paymentQuery = { vendorId };
    if (startDate) paymentQuery.createdAt = { $gte: startDate };

    const payments = await paymentmodal.find(paymentQuery).lean();

    // Stats calculation
    let totalOrders = 0;
    let totalAmount = 0;
    let totalCommission = 0;
    let returnRequested = 0;
    let returnCompleted = 0;

    orders.forEach((order) => {
      order.subOrders.forEach((sub) => {
        if (sub.vendorId.toString() === vendorId.toString()) {
          totalOrders++;
          totalAmount += sub.total;

          if (sub.ReturnStatus === "Requested") returnRequested++;
          if (sub.ReturnStatus === "Completed") returnCompleted++;
        }
      });
    });

    payments.forEach((p) => {
      totalCommission += p.commissionAmount;
    });

    return res.status(200).json({
      status: true,
      message: "Dashboard stats fetched",
      data: {
        totalOrders,
        totalAmount,
        totalCommission,
        returnRequested,
        returnCompleted,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Order Count api
const VendorsOrderCountApi = async (req, res, next) => {
  try {
    const orders = await orderModal.find({
      "subOrders.vendorId": req.user,
    });

    let totalOrders = 0;
    let totalPending = 0;
    let totalDelivered = 0;
    let totalCancelled = 0;
    let totalReturned = 0;
    let totalEarning = 0;

    orders.forEach((order) => {
      const vendorSubOrders = order.subOrders.filter(
        (sub) => sub.vendorId.toString() === req.user.toString()
      );

      vendorSubOrders.forEach((sub) => {
        totalOrders++;

        // Count by status
        if (sub.status === "Pending") totalPending++;
        if (sub.status === "Delivered") totalDelivered++;
        if (sub.status === "Cancelled") totalCancelled++;

        // Earnings from delivered orders
        if (sub.status === "Delivered") {
          const vendorAmount = sub.total;
          totalEarning += vendorAmount;
        }

        // Count returns
        if (sub.Returned === true) totalReturned++;
      });
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Order count success",
      data: {
        totalOrders,
        totalPending,
        totalDelivered,
        totalCancelled,
        totalReturned,
        totalEarning,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Vendor Earnings Stats - Week or Month filter only
const VendorEarningsStatsApi = async (req, res, next) => {
  try {
    const filter = req.query.filter;
    const vendorId = req.user;

    if (!filter || !["week", "month"].includes(filter)) {
      return next(new AppErr("Filter must be 'week' or 'month'", 400));
    }

    let groupField, labelMap, resultKey, formatLabel;

    if (filter === "week") {
      groupField = "$dayOfWeek";
      labelMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      resultKey = "day";
      formatLabel = (id) => labelMap[id - 1]; // dayOfWeek: 1 (Sun) to 7 (Sat)
    } else {
      groupField = "$month";
      labelMap = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      resultKey = "month";
      formatLabel = (id) => labelMap[id - 1]; // month: 1 (Jan) to 12 (Dec)
    }

    const earningsAgg = await paymentmodal.aggregate([
      {
        $match: {
          vendorId,
          paymentStatus: "Completed",
        },
      },
      {
        $group: {
          _id: { groupKey: { [groupField]: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.groupKey": 1 },
      },
    ]);

    const ordersAgg = await orderModal.aggregate([
      { $unwind: "$subOrders" },
      { $match: { "subOrders.vendorId": vendorId } },
      {
        $project: {
          groupKey: { [groupField]: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$groupKey",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Initialize full range with 0s
    const combinedMap = {};
    labelMap.forEach((label) => {
      combinedMap[label] = { earning: 0, orders: 0 };
    });

    earningsAgg.forEach((e) => {
      const label = formatLabel(e._id.groupKey);
      combinedMap[label].earning = e.totalAmount;
    });

    ordersAgg.forEach((o) => {
      const label = formatLabel(o._id);
      combinedMap[label].orders = o.count;
    });

    const result = labelMap.map((label) => ({
      [resultKey]: label,
      earning: combinedMap[label].earning,
      orders: combinedMap[label].orders,
    }));

    return res.status(200).json({
      status: true,
      data: result,
      filter,
    });
  } catch (err) {
    return next(new AppErr(err.message, 500));
  }
};

// Vendor Order Stats - Week or Month filter only
const VendorOrderStatsApi = async (req, res, next) => {
  try {
    const filter = req.query.filter;
    const vendorId = req.user;

    if (!filter || !["week", "month"].includes(filter)) {
      return next(new AppErr("Filter must be 'week' or 'month'", 400));
    }

    const matchStage = {};
    let projectStage, groupStage, labelMap, formatLabel, resultKey;

    if (filter === "week") {
      projectStage = {
        day: { $dayOfWeek: "$createdAt" },
        "subOrders.vendorId": 1,
      };
      groupStage = { _id: "$day" };
      labelMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      resultKey = "day";
      formatLabel = (id) => labelMap[id - 1];
    } else {
      projectStage = {
        month: { $month: "$createdAt" },
        "subOrders.vendorId": 1,
      };
      groupStage = { _id: "$month" };
      labelMap = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      resultKey = "month";
      formatLabel = (id) => labelMap[id - 1];
    }

    const orders = await orderModal.aggregate([
      { $match: matchStage },
      { $unwind: "$subOrders" },
      { $match: { "subOrders.vendorId": vendorId } },
      { $project: projectStage },
      { $group: { ...groupStage, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const ordersMap = {};
    labelMap.forEach((label) => {
      ordersMap[label] = 0;
    });

    orders.forEach((o) => {
      const label = formatLabel(o._id);
      ordersMap[label] = o.count;
    });

    const formatted = labelMap.map((label) => ({
      [resultKey]: label,
      orders: ordersMap[label],
    }));

    return res.status(200).json({
      status: true,
      data: formatted,
      filter,
    });
  } catch (err) {
    return next(new AppErr(err.message, 500));
  }
};

// get all Canceled order
const getCancelledOrdersofVendor = async (req, res, next) => {
  try {
    const vendorId = req.user;

    const returns = await ReturnModal.find({ vendorId })
      .populate("orderId", "grandTotal paymentMode")
      .populate("userId", "name email")
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    const enrichedReturns = await Promise.all(
      returns.map(async (r) => {
        let razorpayRefundStatus = null;

        if (r.razorpayRefundId) {
          try {
            const refund = await razorpay.refunds.fetch(r.razorpayRefundId);
            razorpayRefundStatus = refund.status;
          } catch (err) {
            console.warn("Error fetching Razorpay refund status:", err.message);
            razorpayRefundStatus = "fetch_failed";
          }
        }

        return {
          ...r.toObject(),
          razorpayRefundStatus,
        };
      })
    );

    return res.status(200).json({
      status: true,
      message: "Cancelled orders with refund status",
      count: enrichedReturns.length,
      data: enrichedReturns,
    });
  } catch (error) {
    console.error("Get Cancelled Orders Error:", error);
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  GetAllorder,
  GetVendorOrderById,
  UpdateOrderStatusByVendor,
  GetVendorDashboardStats,
  VendorsOrderCountApi,
  VendorEarningsStatsApi,
  VendorOrderStatsApi,
  getCancelledOrdersofVendor,
};
