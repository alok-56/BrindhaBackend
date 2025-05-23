const express = require("express");
const upload = require("../Middleware/fileUpload");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  FetchAllpaymentsforpayout,
  CreatePayout,
  FetchPaidPayouts,
} = require("../Controllers/SuperAdmin/payout");
const { IsVendor } = require("../Middleware/IsVendor");
const { FetchVendorPayouts, FetchVendorOrderPayments } = require("../Controllers/Vendor/payout");

const PayoutRouter = express.Router();

PayoutRouter.get("/fetch/pending", IsSuperAdmin, FetchAllpaymentsforpayout);

PayoutRouter.post("/create/payout", IsSuperAdmin, CreatePayout);

PayoutRouter.get("/fetch/paid", IsSuperAdmin, FetchPaidPayouts);

// Vendor

PayoutRouter.get("/fetch/vendor/payout", IsVendor, FetchVendorPayouts);

PayoutRouter.get("/fetch/user/order/payment", IsVendor, FetchVendorOrderPayments);



module.exports = PayoutRouter;
