const express = require("express");
const upload = require("../Middleware/fileUpload");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  FetchAllpaymentsforpayout,
  CreatePayout,
  FetchPaidPayouts,
  getPlatformFinanceSummary,
  PaidPayoutById,
} = require("../Controllers/SuperAdmin/payout");
const { IsVendor } = require("../Middleware/IsVendor");
const {
  FetchVendorPayouts,
  FetchVendorOrderPayments,
  FetchVendorPaymentAndPayoutCounts,
} = require("../Controllers/Vendor/payout");
const { IsVendorVerified } = require("../Middleware/IsVendorverified");

const PayoutRouter = express.Router();

PayoutRouter.get("/fetch/pending", IsSuperAdmin, FetchAllpaymentsforpayout);

PayoutRouter.post("/create/payout", IsSuperAdmin, CreatePayout);

PayoutRouter.get("/fetch/paid", IsSuperAdmin, FetchPaidPayouts);

PayoutRouter.get("/fetch/paid/:id", IsSuperAdmin, PaidPayoutById);

PayoutRouter.get("/summary/payout", IsSuperAdmin, getPlatformFinanceSummary);

// Vendor

PayoutRouter.get(
  "/fetch/vendor/payout",
  IsVendor,
  IsVendorVerified,
  FetchVendorPayouts
);

PayoutRouter.get(
  "/fetch/user/order/payment",
  IsVendor,
  IsVendorVerified,
  FetchVendorOrderPayments
);

PayoutRouter.get(
  "/fetch/vendor/payout/count",
  IsVendor,
  IsVendorVerified,
  FetchVendorPaymentAndPayoutCounts
);

module.exports = PayoutRouter;
