const { default: mongoose } = require("mongoose");
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
        .limit(limit)
        .populate("payments"),
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
// const FetchVendorOrderPayments = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const vendorObjectId = new mongoose.Types.ObjectId(req.user);

//     const [total, data] = await Promise.all([
//       paymentmodal.countDocuments({ vendorId: req.user }),

//       paymentmodal.aggregate([
//         { $match: { vendorId: vendorObjectId } },
//         { $sort: { createdAt: -1 } },
//         { $skip: skip },
//         { $limit: limit },

//         // Lookup order to get subOrders
//         {
//           $lookup: {
//             from: "orders",
//             localField: "orderId",
//             foreignField: "_id",
//             as: "order",
//           },
//         },
//         { $unwind: "$order" },

//         // Extract only the vendor's subOrder
//         {
//           $addFields: {
//             matchedSubOrder: {
//               $first: {
//                 $filter: {
//                   input: "$order.subOrders",
//                   as: "subOrder",
//                   cond: {
//                     $eq: ["$$subOrder.vendorId", vendorObjectId],
//                   },
//                 },
//               },
//             },
//           },
//         },

//         // Remove entire order object
//         {
//           $unset: "order",
//         },

//         // Populate vendor
//         {
//           $lookup: {
//             from: "vendors",
//             localField: "vendorId",
//             foreignField: "_id",
//             as: "vendor",
//           },
//         },
//         { $unwind: "$vendor" },

//         // Populate user
//         {
//           $lookup: {
//             from: "users",
//             localField: "userId",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         { $unwind: "$user" },
//       ]),
//     ]);

//     return res.status(200).json({
//       status: true,
//       code: 200,
//       message: "Order payments fetched successfully",
//       data,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     return next(new AppErr(error.message, 500));
//   }
// };

const moment = require("moment");

const FetchVendorOrderPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter;

    const vendorObjectId = new mongoose.Types.ObjectId(req.user);

    // Build createdAt filter
    const dateFilter = {};
    const now = moment();

    if (filter === "today") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("day").toDate(),
        $lt: now.clone().endOf("day").toDate(),
      };
    } else if (filter === "week") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("week").toDate(),
        $lt: now.clone().endOf("week").toDate(),
      };
    } else if (filter === "month") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("month").toDate(),
        $lt: now.clone().endOf("month").toDate(),
      };
    } else if (filter === "year") {
      dateFilter.createdAt = {
        $gte: now.clone().startOf("year").toDate(),
        $lt: now.clone().endOf("year").toDate(),
      };
    } else if (filter && !["today", "week", "month", "year"].includes(filter)) {
      return next(
        new AppErr("Invalid filter. Use 'today', 'week', 'month', or 'year'.", 400)
      );
    }

    const matchStage = {
      vendorId: vendorObjectId,
      ...(filter ? dateFilter : {}),
    };

    const [total, data] = await Promise.all([
      paymentmodal.countDocuments(matchStage),

      paymentmodal.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },

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
              $first: {
                $filter: {
                  input: "$order.subOrders",
                  as: "subOrder",
                  cond: {
                    $eq: ["$$subOrder.vendorId", vendorObjectId],
                  },
                },
              },
            },
          },
        },
        { $unset: "order" },

        {
          $lookup: {
            from: "vendors",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendor",
          },
        },
        { $unwind: "$vendor" },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ]),
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
