const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");
const AppErr = require("../../Helper/appError");
const mongoose = require("mongoose");
const VendorModel = require("../../Models/Vendor/vendor");
const payoutmodal = require("../../Models/Order/payout");
const paymentmodal = require("../../Models/Order/payment");
require("dotenv").config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const FetchAllpaymentsforpayout = async (req, res, next) => {
  try {
    const result = await paymentmodal.aggregate([
      {
        $match: { payout: false },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $addFields: {
          matchedSubOrder: {
            $filter: {
              input: "$order.subOrders",
              as: "subOrder",
              cond: {
                $and: [
                  { $eq: ["$$subOrder.vendorId", "$vendorId"] },
                  { $eq: ["$$subOrder.status", "Delivered"] },
                ],
              },
            },
          },
        },
      },
      {
        $match: { matchedSubOrder: { $ne: [] } },
      },
      {
        $group: {
          _id: "$vendorId",
          totalPayoutAmount: { $sum: "$amount" },
          totalOrdersCount: { $sum: 1 },
          orderIds: { $addToSet: "$orderId" },
          payments: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendorInfo",
        },
      },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } },
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Pending payout fetched successfully",
      data: result,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const CreatePayout = async (req, res, next) => {
  try {
    const { vendorId } = req.body;

    // Fetch payments with payout: false and Delivered suborders
    const payments = await paymentmodal.aggregate([
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(vendorId),
          payout: false,
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $addFields: {
          matchedSubOrder: {
            $filter: {
              input: "$order.subOrders",
              as: "subOrder",
              cond: {
                $and: [
                  { $eq: ["$$subOrder.vendorId", "$vendorId"] },
                  { $eq: ["$$subOrder.status", "Delivered"] },
                ],
              },
            },
          },
        },
      },
      { $match: { matchedSubOrder: { $ne: [] } } },
    ]);

    if (payments.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No eligible payments found for payout",
      });
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0); // rupees
    const amountInPaise = totalAmount * 100; // convert to paise
    const paymentIds = payments.map((p) => p._id);

    const vendor = await VendorModel.findById(vendorId).populate("CompanyId");
    if (
      !vendor ||
      !vendor.CompanyId?.Bankdetails?.Accountnumber ||
      !vendor.CompanyId?.Bankdetails?.Ifsc
    ) {
      return next(new AppErr("Vendor bank details missing", 400));
    }

    // const authHeader = `Basic ${Buffer.from(
    //   `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    // ).toString("base64")}`;

    // // 1. Create Fund Account on RazorpayX
    // const fundAccountPayload = {
    //   account_type: "bank_account",
    //   bank_account: {
    //     name: vendor.CompanyId.Bankdetails.AccountHolderName,
    //     ifsc: vendor.CompanyId.Bankdetails.Ifsc,
    //     account_number: vendor.CompanyId.Bankdetails.Accountnumber,
    //   },
    //   contact: {
    //     name: vendor.Vendorname,
    //     email: vendor.Email,
    //     contact: vendor.Number,
    //   },
    // };

    // const fundAccountResponse = await axios.post(
    //   "https://api.razorpay.com/v1/fund_accounts",
    //   fundAccountPayload,
    //   { headers: { Authorization: authHeader } }
    // );

    // // 2. Create Payout using fund_account_id and correct amount
    // const payoutPayload = {
    //   fund_account_id: fundAccountResponse.data.id,
    //   amount: amountInPaise, // in paise
    //   currency: "INR",
    //   mode: "IMPS",
    //   purpose: "payout",
    //   queue_if_low_balance: true,
    // };

    // const payoutResponse = await axios.post(
    //   "https://api.razorpay.com/v1/payouts",
    //   payoutPayload,
    //   { headers: { Authorization: authHeader } }
    // );

    // 3. Create payout record in DB (store amount in rupees)
    const payoutRecord = await payoutmodal.create({
      vendorId,
      razorpayPayoutId: "testid1234",
      totalAmount: totalAmount,
      payments: paymentIds,
      status: "Pending",
    });

    // 4. Update payments as paid out
    await paymentmodal.updateMany(
      { _id: { $in: paymentIds } },
      { payout: true, PayoutStatus: "Completed" }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Payout created successfully",
      payout: payoutRecord,
    });
  } catch (error) {
    return next(
      new AppErr(error.response?.data?.error?.description || error.message, 500)
    );
  }
};

const FetchPaidPayouts = async (req, res, next) => {
  try {
    let response = await payoutmodal.find();
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Payment fetched successfully",
      data: response,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchAllpaymentsforpayout,
  FetchPaidPayouts,
  CreatePayout,
};
