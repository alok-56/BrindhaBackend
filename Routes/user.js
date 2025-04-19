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

module.exports = UserRouter;
