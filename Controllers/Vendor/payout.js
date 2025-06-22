const AppErr = require("../../Helper/appError");
const paymentmodal = require("../../Models/Order/payment");
const payoutmodal = require("../../Models/Order/payout");

// all payout - paginated
const FetchVendorPayouts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      payoutmodal.countDocuments({ vendorId: req.user }),
      payoutmodal
        .find({ vendorId: req.user })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Payouts fetched successfully",
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// all order payments - paginated
const FetchVendorOrderPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      paymentmodal.countDocuments({ vendorId: req.user }),
      paymentmodal
        .find({ vendorId: req.user })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Order payments fetched successfully",
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// payout count api
const FetchVendorPaymentAndPayoutCounts = async (req, res, next) => {
  try {
    const vendorId = req.user;

    const [payoutStats, paymentStats] = await Promise.all([
      payoutmodal.aggregate([
        { $match: { vendorId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
      paymentmodal.aggregate([
        { $match: { vendorId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);
    const totalPayoutAmount = payoutStats[0]?.totalAmount || 0;
    const totalPaymentAmount = paymentStats[0]?.totalAmount || 0;

    return res.status(200).json({
      status: true,
      message: "Stats fetched successfully",
      data: {
        totalPayoutAmount,
        totalPaymentAmount,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  FetchVendorPayouts,
  FetchVendorOrderPayments,
  FetchVendorPaymentAndPayoutCounts,
};
