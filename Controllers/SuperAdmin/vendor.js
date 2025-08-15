const mongoose = require("mongoose");
const AppErr = require("../../Helper/appError");
const CompanyModel = require("../../Models/Vendor/companydetails");
const VendorModel = require("../../Models/Vendor/vendor");
const paymentmodal = require("../../Models/Order/payment");
const ProductModel = require("../../Models/Product/product");
const orderModal = require("../../Models/Order/order");
const SendEmail = require("../../Helper/Email/sendEmail");

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
        total: totalVendors,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalVendors / limit),
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
    let { remarks } = req.body;
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

    res.status(200).json({
      status: true,
      code: 200,
      message: "Status Updated successfully",
    });

    if (status === "Approved") {
     setImmediate(async () => {
        try {
          await SendEmail(
            vendor.Email,
            "VendorApproved",
            vendor.BussinessName,
            {}
          );
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr.message);
        }
      });
    } else {
     setImmediate(async () => {
        try {
          await SendEmail(
            vendor.Email,
            "VendorRejected",
            vendor.BussinessName,
            {}
          );
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr.message);
        }
      });
    }
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
      VendorModel.countDocuments({
        isCompanyVerified: "Requestsend" || "Pending",
      }),
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

    const matchStage = { paymentStatus: "Completed" };
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

    let report = [];

    if (filter === "year") {
      report = result.map((r) => ({
        period: r._id.toString(),
        revenue: r.revenue,
        commission: r.commission,
      }));
    } else {
      const resultMap = {};
      result.forEach((r) => {
        resultMap[r._id] = { revenue: r.revenue, commission: r.commission };
      });

      for (let i = 1; i <= fullLabels.length; i++) {
        const data = resultMap[i] || { revenue: 0, commission: 0 };
        report.push({
          [filter === "week" ? "day" : "month"]: fullLabels[i - 1],
          revenue: data.revenue,
          commission: data.commission,
        });
      }
    }

    return res.status(200).json({
      status: true,
      data: report,
      filter,
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

    let groupId,
      fullLabels = [],
      labelKey;

    if (filter === "week") {
      groupId = { $dayOfWeek: "$createdAt" };
      fullLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      labelKey = "day";
    } else if (filter === "month") {
      groupId = { $month: "$createdAt" };
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
      labelKey = "month";
    } else if (filter === "year") {
      groupId = { $year: "$createdAt" };
      labelKey = "period"; // For year, we'll just use the year number as a string
    } else {
      return res.status(400).json({ status: false, message: "Invalid filter" });
    }

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
          {
            $group: {
              _id: groupId,
              revenue: { $sum: "$amount" },
              commission: { $sum: "$commissionAmount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const resultMap = {};
    graphStats.forEach((entry) => {
      resultMap[entry._id] = {
        revenue: entry.revenue,
        commission: entry.commission,
      };
    });

    const graph = [];

    if (filter === "week" || filter === "month") {
      for (let i = 1; i <= fullLabels.length; i++) {
        const data = resultMap[i] || { revenue: 0, commission: 0 };
        graph.push({
          [labelKey]: fullLabels[i - 1],
          revenue: data.revenue,
          commission: data.commission,
        });
      }
    } else if (filter === "year") {
      graphStats.forEach((entry) => {
        graph.push({
          [labelKey]: entry._id.toString(),
          revenue: entry.revenue,
          commission: entry.commission,
        });
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
      graph,
      filter,
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
