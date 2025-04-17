const AppErr = require("../Helper/appError");
const { decryptData } = require("../Helper/crypto");
const verifyToken = require("../Helper/verifyToken");
const SuperadminModel = require("../Models/SuperAdmin/superadmin");

const IsSuperAdmin = async (req, res, next) => {
  try {
    let { token } = req.headers;
    if (!token) {
      return next(new AppErr("unauthorized user", 401));
    }
  
    let decypttoken = decryptData(token);

    let { id } = await verifyToken(decypttoken);

    let superadmin = await SuperadminModel.findById(id);
    if (!superadmin) {
      return next(new AppErr("unauthorized user or invailed token", 401));
    }
    req.user = superadmin._id;

    next();
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  IsSuperAdmin,
};
