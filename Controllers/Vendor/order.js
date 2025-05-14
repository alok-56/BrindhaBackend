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


module.exports = {
  GetAllorder,
  GetVendorOrderById,
  UpdateOrderStatusByVendor,
  GetVendorDashboardStats,
};
