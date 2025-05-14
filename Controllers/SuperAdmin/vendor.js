const AppErr = require("../../Helper/appError");
const CompanyModel = require("../../Models/Vendor/companydetails");
const VendorModel = require("../../Models/Vendor/vendor");

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

module.exports = {
  GetVendorList,
  GetVendorById,
  ApproveRejectvendor,
  CountVendorsSummary,
};
