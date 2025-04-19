const AppErr = require("../../Helper/appError");
const CompanyModel = require("../../Models/Vendor/companydetails");
const VendorModel = require("../../Models/Vendor/vendor");

// Get Vendor List with filter
const GetVendorList = async (req, res, next) => {
  try {
    let { status } = req.query;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.isCompanyVerified = status;
    }

    // Get total documents for pagination
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
        $push: { rejectremark: remarks }
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

module.exports = {
  GetVendorList,
  GetVendorById,
  ApproveRejectvendor,
};
