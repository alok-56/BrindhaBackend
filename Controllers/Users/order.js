const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const Razorpay = require("razorpay");
const orderModal = require("../../Models/Order/order");
const paymentmodal = require("../../Models/Order/payment");
const crypto = require("crypto");
const ProductModel = require("../../Models/Product/product");
const ReturnModal = require("../../Models/Order/return");
const UserModel = require("../../Models/User/user");
const SendEmail = require("../../Helper/Email/sendEmail");
const VendorModel = require("../../Models/Vendor/vendor");
const emailQueue = require("../../Helper/Email/emailjobs");
const notificationModal = require("../../Models/notification");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const saveMultiVendorOrder = async (
  orderData,
  razorpayOrderId,
  razorpayPaymentId
) => {
  const {
    userId,
    subOrders,
    totalAmount,
    taxAmount,
    grandTotal,
    paymentMode,
    ShipingAddress,
  } = orderData;

  const order = new orderModal({
    userId,
    subOrders,
    totalAmount,
    taxAmount,
    grandTotal,
    paymentMode,
    paymentStatus: "Completed",
    razorpayOrderId,
    razorpayPaymentId,
    ShipingAddress,
  });

  const savedOrder = await order.save();

  const bulkStockOps = [];

  for (const sub of subOrders) {
    const totalProductPrice = sub.products.reduce(
      (acc, item) => acc + item.price * item.quantity * item.size,
      0
    );
    const totalCommission = sub.products.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity * item.size;
      return acc + (itemTotal * item.commissionPercent) / 100;
    }, 0);
    const vendorAmount =
      totalProductPrice + sub.deliveryCharge - (totalCommission + taxAmount);

    await paymentmodal.create({
      vendorId: sub.vendorId,
      userId,
      orderId: savedOrder._id,
      amount: vendorAmount,
      commissionAmount: totalCommission,
      transactionId: razorpayPaymentId,
      paymentMode,
      paymentStatus: "Completed",
    });

    let vendor = await VendorModel.findById(sub.vendorId);

    emailQueue.add({
      email: vendor.Email,
      subject: "OrderCreatedVendor",
      name: "",
      orderData,
    });

    // Prepare bulk operations for product stock updates
    for (const item of sub.products) {
      bulkStockOps.push({
        updateOne: {
          filter: { _id: item.productId },
          update: {
            $inc: {
              Stock: -item.quantity,
            },
          },
        },
      });
    }
  }

  // Apply stock updates in bulk
  if (bulkStockOps.length > 0) {
    await ProductModel.bulkWrite(bulkStockOps);
  }

  return savedOrder;
};

// Create Order
const CreateOrder = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { amount, subOrders } = req.body;

    if (!amount) {
      return next(new AppErr("Amount is required", 404));
    }

    for (const sub of subOrders) {
      for (const item of sub.products) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          return next(new AppErr("Product not found", 404));
        }

        const availableStock = product.Stock - (product.LockStock || 0);
        if (availableStock < item.quantity) {
          return next(new AppErr(`${product.Name} is out of stock`, 400));
        }

        // Lock stock
        await ProductModel.updateOne(
          { _id: item.productId },
          {
            $inc: { LockStock: item.quantity },
          }
        );
      }
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      status: true,
      code: 200,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Verify Order
const VerifyOrder = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      const savedOrder = await saveMultiVendorOrder(
        orderData,
        razorpayOrderId,
        razorpayPaymentId
      );

      await notificationModal.create({
        userId: orderData.userId,
        title: "New Order Received",
        message: `Order has been placed Successfully.`,
      });

      let user = await UserModel.findById(orderData.userId).select("Email");

      emailQueue.add({
        email: user.Email,
        subject: "OrderCreatedUser",
        name: "",
        extraData: orderData,
      });

      return res.status(200).json({
        status: true,
        message: "order verified successfully",
        data: savedOrder,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All My Order
const GetMyorder = async (req, res, next) => {
  try {
    const orders = await paymentmodal
      .find({ userId: req.user })
      .populate({
        path: "orderId",
        populate: {
          path: "subOrders.products.productId",
        },
      })
      .populate("vendorId")
      .lean();

    const formattedOrders = [];

    for (let payment of orders) {
      const { orderId, vendorId, ...paymentInfo } = payment;

      if (!orderId?.subOrders) continue;

      for (let subOrder of orderId.subOrders) {
        const vendor = subOrder.vendorId;
        const products = subOrder.products.map((product) => {
          return {
            productId: product.productId?._id,
            name: product.productId?.name,
            price: product.price,
            quantity: product.quantity,
            commissionPercent: product.commissionPercent,
            image: product.productId?.Images,
            size: product?.size ? product?.size : "NA",
            color: product?.color ? product?.color : "NA",
          };
        });

        formattedOrders.push({
          vendor: {
            _id: vendor?._id,
            name: vendor?.name,
            email: vendor?.email,
            phone: vendor?.phone,
          },
          order: {
            orderId: orderId._id,
            paymentMode: orderId.paymentMode,
            paymentStatus: orderId.paymentStatus,
            grandTotal: orderId.grandTotal,
            razorpayPaymentId: orderId.razorpayPaymentId,
            razorpayOrderId: orderId.razorpayOrderId,
            createdAt: orderId.createdAt,
          },
          subOrder: {
            subOrderId: subOrder._id,
            status: subOrder.status,
            total: subOrder.total,
            deliveryCharge: subOrder.deliveryCharge,
            ReturnStatus: subOrder.ReturnStatus,
            products,
          },
          transaction: {
            amount: paymentInfo.amount,
            commissionAmount: paymentInfo.commissionAmount,
            payout: paymentInfo.payout,
            payoutStatus: paymentInfo.PayoutStatus,
          },
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Orders fetched and formatted successfully",
      data: formattedOrders,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Lockstock
const UpdateLockStock = async (req, res, next) => {
  try {
    const { subOrders } = req.body;

    if (!subOrders) {
      return next(new AppErr("subOrders is required", 404));
    }

    for (const sub of subOrders) {
      for (const item of sub.products) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          return next(new AppErr("Product not found", 404));
        }

        const availableStock = product.Stock - (product.LockStock || 0);
        if (availableStock < item.quantity) {
          return next(new AppErr(`${product.Name} is out of stock`, 400));
        }

        await ProductModel.updateOne(
          { _id: item.productId },
          {
            $inc: { LockStock: -item.quantity },
          }
        );
      }
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Lock Updated successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// cancel order
const CreateCancelorder = async (req, res, next) => {
  try {
    const { orderid, vendorid } = req.params;

    const order = await orderModal.findById(orderid);
    if (!order) return next(new AppErr("Order not found", 404));

    const subOrderIndex = order.subOrders.findIndex(
      (sub) => sub.vendorId.toString() === vendorid
    );

    if (subOrderIndex === -1) {
      return next(new AppErr("Vendor not found in this order", 404));
    }

    const subOrder = order.subOrders[subOrderIndex];

    if (subOrder.status !== "Pending") {
      return next(new AppErr("Only pending orders can be cancelled", 400));
    }

    let refundData = null;

    // 🔧 Manually define delivery charge (override subOrder.deliveryCharge)
    const deliveryCharge = 100; // Or apply logic here

    // Refund only product total (excluding delivery charge)
    let refundAmount = subOrder.total - deliveryCharge;

    if (refundAmount < 0) refundAmount = 0;

    // Refund via Razorpay if ONLINE payment completed
    if (order.paymentMode === "ONLINE" && order.paymentStatus === "Completed") {
      try {
        refundData = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100), // paise
          notes: {
            orderId: order._id.toString(),
            vendorId: vendorid,
          },
        });
      } catch (refundErr) {
        return next(new AppErr("Refund failed: " + refundErr.message, 500));
      }
    }

    // Update sub-order status
    order.subOrders[subOrderIndex].status = "Cancelled";
    await order.save();

    // Save return record
    const returnRecord = await ReturnModal.create({
      orderId: order._id,
      userId: order.userId,
      vendorId: subOrder.vendorId,
      subOrderIndex,
      products: subOrder.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        refundedAmount: p.price * p.quantity,
      })),
      returnAmount: refundAmount,
      razorpayRefundId: refundData?.id || null,
      razorpayPaymentId: order.razorpayPaymentId,
      status: "Approved",
      reason: "User cancelled order",
      notes: `Delivery charge of ₹${deliveryCharge} not refunded`,
    });

    await notificationModal.create({
      userId: order.userId,
      title: "Order Cancelled",
      message: `Your Order has been cancelled.`,
    });

    let user = await UserModel.findById(order.userId).select("Email");

    emailQueue.add({
      email: user.Email,
      subject: "OrderCancelled",
      name: "",
      extraData: {
        orderId: orderid.slice(0, 8),
        RefundAmount: refundAmount,
        refundid: refundData?.id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Order cancelled and refund initiated",
      data: refundData,
      refundrecord: returnRecord,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return next(new AppErr(error.message, 500));
  }
};

// get My all Canceled order
const getCancelledOrders = async (req, res, next) => {
  try {
    const userId = req.user;
    const { _id } = req.query;

    // Build query dynamically
    const query = { userId };
    if (_id) {
      query._id = _id;
    }

    // Fetch Return records
    const returns = await ReturnModal.find(query)
      .populate("orderId", "grandTotal paymentMode")
      .populate("vendorId", "name")
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    // Fetch refund status for each return
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
  CreateOrder,
  VerifyOrder,
  GetMyorder,
  UpdateLockStock,
  CreateCancelorder,
  getCancelledOrders,
};
