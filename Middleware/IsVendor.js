const AppErr = require("../Helper/appError");
const { decryptData } = require("../Helper/crypto");
const verifyToken = require("../Helper/verifyToken");

const VendorModel = require("../Models/Vendor/vendor");

const IsVendor = async (req, res, next) => {
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
      req.user = vendor._id;
      req.company = vendor.CompanyId;
    } else {
      console.log(vendor.ReportAdmin)
      req.user = vendor.ReportAdmin;
      req.company = vendor.CompanyId;
    }

    next();
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  IsVendor,
};
