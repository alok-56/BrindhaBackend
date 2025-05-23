const AppErr = require("../Helper/appError");
const { decryptData } = require("../Helper/crypto");
const verifyToken = require("../Helper/verifyToken");

const VendorModel = require("../Models/Vendor/vendor");

const IsVendorVerified = async (req, res, next) => {
  try {
    let { token } = req.headers;
    if (!token) {
      return next(new AppErr("unauthorized user", 401));
    }

    let decypttoken = decryptData(token);
    let { id } = await verifyToken(decypttoken);

    let vendor = await VendorModel.findById(id);
    if (!vendor) {
      return next(new AppErr("unauthorized user or invailed token", 401));
    }

    if (vendor.Isheadrole) {
      if (vendor.isCompanyVerified === "Approved") {
        req.user = vendor._id;
        req.company = vendor.CompanyId;
        next();
      } else {
        return next(new AppErr("Access denied! Verification pending", 401));
      }
    } else {
      if (vendor.isCompanyVerified === "Approved") {
        req.user = vendor.ReportAdmin;
        req.company = vendor.CompanyId;
        next();
      } else {
        return next(new AppErr("Access denied! Verification pending", 401));
      }
    }
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  IsVendorVerified,
};
