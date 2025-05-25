const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const Razorpay = require("razorpay");
const orderModal = require("../../Models/Order/order");
const paymentmodal = require("../../Models/Order/payment");
const crypto = require("crypto");
const ProductModel = require("../../Models/Product/product");
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
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalCommission = sub.products.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;
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
            image: product.productId?.Images, // if exists
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


module.exports = {
  CreateOrder,
  VerifyOrder,
  GetMyorder,
};
