const mongoose = require("mongoose");
const AppErr = require("../../Helper/appError");
const CompanyModel = require("../../Models/Vendor/companydetails");
const VendorModel = require("../../Models/Vendor/vendor");
const paymentmodal = require("../../Models/Order/payment");
const ProductModel = require("../../Models/Product/product");
const orderModal = require("../../Models/Order/order");

// Get Vendor List with filter
const GetVendorList = async (req, res, next) => {
  try {
    let { status, DateRange } = req.query;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    let query = {};
    if (status && status !== "all") {
      query.isCompanyVerified = status;
    }

    // 🔽 Date filtering based on createdAt
    if (DateRange) {
      const now = new Date();
      let start;

      switch (DateRange.toLowerCase()) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          const day = now.getDay(); // 0 = Sunday
          start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - day
          );
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = null;
      }

      if (start) {
        query.createdAt = { $gte: start, $lte: now };
      }
    }

    const totalVendors = await VendorModel.countDocuments(query);

    const vendors = await VendorModel.find(query)
      .populate("CompanyId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      code: 200,
      data: vendors,
      pagination: {
        totalRecords: totalVendors,
        currentPage: page,
        totalPages: Math.ceil(totalVendors / limit),
        perPage: limit,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Vendor by Id
const GetVendorById = async (req, res, next) => {
  try {
    let { id } = req.params;

    let vendor = await VendorModel.findById(id).populate("CompanyId");

    return res.status(200).json({
      status: true,
      code: 200,
      data: vendor,
    });
  } catch (error) {
    return next(new AppErr(error.message), 500);
  }
};

// Approve/Reject vendor
const ApproveRejectvendor = async (req, res, next) => {
  try {
    let { id, status } = req.params;
    let { remarks } = req.query;
    let vendor = await VendorModel.findById(id);

    if (!vendor) {
      return next(new AppErr("Vendor Not found"), 404);
    }

    await VendorModel.findByIdAndUpdate(id, {
      isCompanyVerified: status,
    });

    if (status === "Approved") {
      await CompanyModel.findByIdAndUpdate(vendor.CompanyId, {
        isVerfied: true,
        isrejected: false,
        $push: { rejectremark: remarks },
      });
    } else {
      await CompanyModel.findByIdAndUpdate(vendor.CompanyId, {
        isVerfied: false,
        isrejected: true,
        $push: { rejectremark: remarks },
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Status Updated successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message), 500);
  }
};

// Count Api
const CountVendorsSummary = async (req, res, next) => {
  try {
    const [total, approved, pending, rejected] = await Promise.all([
      VendorModel.countDocuments(),
      VendorModel.countDocuments({ isCompanyVerified: "Approved" }),
      VendorModel.countDocuments({ isCompanyVerified: "Pending" }),
      VendorModel.countDocuments({ isCompanyVerified: "rejected" }),
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Vendor counts fetched successfully",
      data: {
        totalVendors: total,
        approvedVendors: approved,
        pendingVendors: pending,
        rejectedVendors: rejected,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Revenue and commision graph
const getRevenueReport = async (req, res, next) => {
  try {
    const { vendorId, filter = "week" } = req.query;

    const matchStage = {
      paymentStatus: "Completed",
    };

    if (vendorId) {
      matchStage.vendorId = new mongoose.Types.ObjectId(vendorId);
    }

    let groupStage = {};
    let labels = [];
    let fullLabels = [];
    const sortStage = { _id: 1 };

    if (filter === "week") {
      groupStage = { _id: { $dayOfWeek: "$createdAt" } };
      fullLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else if (filter === "month") {
      groupStage = { _id: { $month: "$createdAt" } };
      fullLabels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    } else if (filter === "year") {
      groupStage = { _id: { $year: "$createdAt" } };
    } else {
      return res.status(400).json({ status: false, message: "Invalid filter" });
    }

    const result = await paymentmodal.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupStage._id,
          revenue: { $sum: "$amount" },
          commission: { $sum: "$commissionAmount" },
        },
      },
      { $sort: sortStage },
    ]);

    const revenue = [];
    const commission = [];

    if (filter === "year") {
      labels = result.map((r) => r._id.toString());
      result.forEach((r) => {
        revenue.push(r.revenue);
        commission.push(r.commission);
      });
    } else {
      const resultMap = {};
      result.forEach((r) => {
        resultMap[r._id] = { revenue: r.revenue, commission: r.commission };
      });

      for (let i = 1; i <= fullLabels.length; i++) {
        const data = resultMap[i] || { revenue: 0, commission: 0 };
        revenue.push(data.revenue);
        commission.push(data.commission);
        labels.push(fullLabels[i - 1]);
      }
    }

    return res.status(200).json({
      status: true,
      data: {
        revenue,
        commission,
        labels,
        filter,
      },
    });
  } catch (err) {
    console.error("Revenue aggregation error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

// Seller history
const getVendorStats = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { filter = "week" } = req.query;

    const matchStage = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
      paymentStatus: "Completed",
    };

    const groupStage = {};
    const labelMap = [];
    const sortStage = {};

    if (filter === "week") {
      groupStage._id = { $dayOfWeek: "$createdAt" };
      labelMap.push("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
      sortStage["_id"] = 1;
    } else if (filter === "month") {
      groupStage._id = { $month: "$createdAt" };
      labelMap.push(
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      );
      sortStage["_id"] = 1;
    } else if (filter === "year") {
      groupStage._id = { $year: "$createdAt" };
      sortStage["_id"] = 1;
    }

    groupStage.revenue = { $sum: "$amount" };
    groupStage.commission = { $sum: "$commissionAmount" };

    const [totalProducts, totalOrders, paymentStats, graphStats] =
      await Promise.all([
        ProductModel.countDocuments({ VendorId: vendorId }),
        orderModal.countDocuments({ "subOrders.vendorId": vendorId }),
        paymentmodal.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
              totalCommission: { $sum: "$commissionAmount" },
            },
          },
        ]),
        paymentmodal.aggregate([
          { $match: matchStage },
          { $group: groupStage },
          { $sort: sortStage },
        ]),
      ]);

    const revenue = [];
    const commission = [];
    const labels = [];

    if (filter === "week" || filter === "month") {
      graphStats.forEach((entry) => {
        labels.push(labelMap[entry._id - (filter === "week" ? 1 : 1)]);
        revenue.push(entry.revenue);
        commission.push(entry.commission);
      });
    } else if (filter === "year") {
      graphStats.forEach((entry) => {
        labels.push(entry._id.toString());
        revenue.push(entry.revenue);
        commission.push(entry.commission);
      });
    }

    const { totalRevenue = 0, totalCommission = 0 } = paymentStats[0] || {};

    return res.status(200).json({
      status: true,
      summary: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCommission,
      },
      graph: {
        revenue,
        commission,
        labels,
        filter,
      },
    });
  } catch (err) {
    console.error("Vendor Stats Error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = {
  GetVendorList,
  GetVendorById,
  ApproveRejectvendor,
  CountVendorsSummary,
  getRevenueReport,
  getVendorStats,
};
