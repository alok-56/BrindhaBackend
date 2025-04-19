const AppErr = require("../Helper/appError");
const { decryptData } = require("../Helper/crypto");
const verifyToken = require("../Helper/verifyToken");
const UserModel = require("../Models/User/user");


const IsUser = async (req, res, next) => {
  try {
    let { token } = req.headers;
    if (!token) {
      return next(new AppErr("unauthorized user", 401));
    }

    let decypttoken = decryptData(token);
    let { id } = await verifyToken(decypttoken);

    let user = await UserModel.findById(id);
    if (!user) {
      return next(new AppErr("unauthorized user or invailed token", 401));
    }
   
    req.user = user._id;

    next();
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
    IsUser,
};
