const express = require("express");
const { body } = require("express-validator");
const { IsUser } = require("../Middleware/IsUser");
const {
  CreateUser,
  UpdateUser,
  LoginUser,
  GetMyData,
  DeleteUser,
} = require("../Controllers/Users/auth");
const {
  CreateShippingAddress,
  UpdateAddress,
  GetMyAddresses,
  GetAddressById,
  DeleteAddress,
} = require("../Controllers/Users/shipingaddress");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const {
  FetchAllUserbySuper,
  FetchOrderbyUser,
} = require("../Controllers/SuperAdmin/user");
const UserRouter = express.Router();

// User create
UserRouter.post(
  "/create/User",
  body("Username").notEmpty().withMessage("Username is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Number").notEmpty().withMessage("Number is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  CreateUser
);

// update User
UserRouter.patch("/update/User", IsUser, UpdateUser);

// Login User
UserRouter.post(
  "/login/User",
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  LoginUser
);

// GetUserby Id
UserRouter.get("/myprofile", IsUser, GetMyData);

// Get Super Admin by Id
UserRouter.delete("/delete/User/:id", IsUser, DeleteUser);

// Create Shiping
UserRouter.post(
  "/create/shipingaddress",
  body("FullAddress").notEmpty().withMessage("FullAddress is required"),
  body("Country").notEmpty().withMessage("Country is required"),
  body("State").notEmpty().withMessage("State is required"),
  body("City").notEmpty().withMessage("City is required"),
  body("Pincode").notEmpty().withMessage("Pincode is required"),
  IsUser,
  CreateShippingAddress
);

// Update Shiping
UserRouter.patch("/update/shipingaddress/:id", IsUser, UpdateAddress);

// Get My Shiping
UserRouter.get("/get/shipingaddress", IsUser, GetMyAddresses);

// Get Address by Id
UserRouter.get("/get/shipingaddress/:id", IsUser, GetAddressById);

// Delete Address
UserRouter.delete("/delete/shipingaddress/:id", IsUser, DeleteAddress);

// Get All User
UserRouter.get("/get/allusers", IsSuperAdmin, FetchAllUserbySuper);

// Get All Users Orders
UserRouter.get("/get/allusers/orders/:userid", IsSuperAdmin, FetchOrderbyUser);

module.exports = UserRouter;
