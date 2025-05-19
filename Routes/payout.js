const express = require("express");
const upload = require("../Middleware/fileUpload");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  FetchAllpaymentsforpayout,
  CreatePayout,
  FetchPaidPayouts,
} = require("../Controllers/SuperAdmin/payout");

const PayoutRouter = express.Router();

PayoutRouter.get("/fetch/pending", IsSuperAdmin, FetchAllpaymentsforpayout);

PayoutRouter.post("/create/payout", IsSuperAdmin, CreatePayout);

PayoutRouter.get("/fetch/paid", IsSuperAdmin, FetchPaidPayouts);

module.exports = PayoutRouter;
