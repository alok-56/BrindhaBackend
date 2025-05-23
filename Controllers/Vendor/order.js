const AppErr = require("../../Helper/appError");
const orderModal = require("../../Models/Order/order");
const paymentmodal = require("../../Models/Order/payment");
const ProductModel = require("../../Models/Product/product");
const moment = require("moment");

// Get All Order of Vendor
const GetAllorder = async (req, res, next) => {
  try {
    const vendorId = req.user; // assuming vendorId is injected via auth middleware

    const orders = await orderModal.find({
      "subOrders.vendorId": vendorId,
    });

    // Step 1: Collect all productIds from matching subOrders
    const allProductIds = [];
    orders.forEach((order) => {
      order.subOrders.forEach((subOrder) => {
        if (subOrder.vendorId.toString() === vendorId.toString()) {
          subOrder.products.forEach((product) => {
            allProductIds.push(product.productId.toString());
          });
        }
      });
    });

    // Step 2: Fetch product details
    const productDetails = await ProductModel.find({
      _id: { $in: allProductIds },
    }).lean();

    const productMap = {};
    productDetails.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // Step 3: Build response
    const vendorOrders = orders.map((order) => {
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

    // Match payments for vendor with completed status — no year filter
    const matchStage = {
      vendorId,
      paymentStatus: "Completed",
    };

    let groupStage, labelMap, formatLabel;

    if (filter === "week") {
      groupStage = { _id: { $dayOfWeek: "$createdAt" } };
      labelMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      formatLabel = (id) => labelMap[id - 1];
    } else if (filter === "month") {
      groupStage = { _id: { $month: "$createdAt" } };
      labelMap = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      formatLabel = (id) => labelMap[id - 1];
    }

    const payments = await paymentmodal.aggregate([
      { $match: matchStage },
      { $group: { _id: groupStage._id, totalAmount: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Vendor earnings stats fetched successfully",
      data: {
        labels: payments.map((p) => formatLabel(p._id)),
        data: payments.map((p) => p.totalAmount),
      },
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

    // Match all orders — no year filter here either
    const matchStage = {};

    let projectStage, groupStage, labelMap, formatLabel;

    if (filter === "week") {
      projectStage = { day: { $dayOfWeek: "$createdAt" }, "subOrders.vendorId": 1 };
      groupStage = { _id: "$day" };
      labelMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      formatLabel = (id) => labelMap[id - 1];
    } else if (filter === "month") {
      projectStage = { month: { $month: "$createdAt" }, "subOrders.vendorId": 1 };
      groupStage = { _id: "$month" };
      labelMap = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
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

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Vendor order stats fetched successfully",
      data: {
        labels: orders.map((o) => formatLabel(o._id)),
        data: orders.map((o) => o.count),
      },
    });
  } catch (err) {
    return next(new AppErr(err.message, 500));
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
};
