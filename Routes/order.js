const express = require("express");
const { body } = require("express-validator");
const { IsUser } = require("../Middleware/IsUser");
const {
  CreateOrder,
  VerifyOrder,
  GetMyorder,
} = require("../Controllers/Users/order");
const { IsVendor } = require("../Middleware/IsVendor");
const {
  GetAllorder,
  GetVendorOrderById,
  UpdateOrderStatusByVendor,
  GetVendorDashboardStats,
  VendorsOrderCountApi,
  VendorOrderStatsApi,
  VendorEarningsStatsApi,
} = require("../Controllers/Vendor/order");
const {
  FetchAllorderbySuper,
  GetOrderByOrderId,
} = require("../Controllers/SuperAdmin/order");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const OrderRouter = express.Router();

// Order create
OrderRouter.post(
  "/create/order",
  IsUser,
  CreateOrder
);

// Order verify
OrderRouter.post(
  "/verify/order",
  body("razorpayOrderId").notEmpty().withMessage("razorpayOrderId is required"),
  body("razorpayPaymentId")
    .notEmpty()
    .withMessage("razorpayPaymentId is required"),
  body("razorpaySignature")
    .notEmpty()
    .withMessage("razorpaySignature is required"),
  body("orderData").notEmpty().withMessage("orderData is required"),
  //   IsUser,
  VerifyOrder
);

// My Order
OrderRouter.get("/my/order", IsUser, GetMyorder);

// <!--------------------------VENDOR----------------------------->

// Get All Order Of Vendor
OrderRouter.get("/vendor/my/order", IsVendor, GetAllorder);

// Get Order By OrderId
OrderRouter.get("/vendor/order/:orderId", IsVendor, GetVendorOrderById);

// Update Status
OrderRouter.patch(
  "/vendor/order/:orderId/status",
  IsVendor,
  UpdateOrderStatusByVendor
);

// Dashboard Count Api
OrderRouter.get("/vendor/stats", IsVendor, GetVendorDashboardStats);

// Order Dashboard count
OrderRouter.get("/vendor/count/dashbaord", IsVendor, VendorsOrderCountApi);

// order graph
OrderRouter.get("/vendor/stats/orders", IsVendor, VendorOrderStatsApi);

// earning graph
OrderRouter.get("/vendor/stats/earnings", IsVendor, VendorEarningsStatsApi);

// <!--------------------------SUPER ADMIN----------------------------->

// Get All Order Super admin
OrderRouter.get("/super/order", IsSuperAdmin, FetchAllorderbySuper);

// Get Order By Id
OrderRouter.get("/super/order/:id", IsSuperAdmin, GetOrderByOrderId);

module.exports = OrderRouter;
