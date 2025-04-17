const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const SuperadminModel = require("../../Models/SuperAdmin/superadmin");
const { generateToken } = require("../../Helper/generateToken");

// Create Super Admin
const CreateSuperAdmin = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Name, Email, Number, Password, Permission } = req.body;

    // Email Check
    let email = await SuperadminModel.findOne({ Email: Email });
    if (email) {
      return next(new AppErr("email already exists", 400));
    }

    // Number Check
    let number = await SuperadminModel.findOne({ Number: Number });
    if (number) {
      return next(new AppErr("number already exists", 400));
    }

    // Create super admin
    let superadmin = await SuperadminModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Super Admin Created Successfully",
      data: superadmin,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Super Admin
const UpdateSuperAdmin = async (req, res, next) => {
  try {
    let { Name, Email, Number, Password } = req.body;
    let { id } = req.params;

    if (!id) {
      return next(new AppErr("Super admin id is required ", 400));
    }

    // Email Check
    if (Email) {
      let email = await SuperadminModel.findOne({
        Email: Email,
        _id: { $ne: id },
      });
      if (email) {
        return next(new AppErr("email already exists", 400));
      }
    }

    // Number Check
    if (Number) {
      let number = await SuperadminModel.findOne({
        Number: Number,
        _id: { $ne: id },
      });
      if (number) {
        return next(new AppErr("number already exists", 400));
      }
    }

    // Update Varibale

    const update = {};
    if (Email) update.Email = Email;
    if (Number) update.Number = Number;
    if (Name) update.Name = Name;
    if (Password) update.Password = Password;

    // Create super admin
    let superadmin = await SuperadminModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Super Admin Updated Successfully",
      data: superadmin,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Super Admin
const GetSuperAdmin = async (req, res, next) => {
  try {
    let superadmin = await SuperadminModel.find();
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Super Admin Fetched Successfully",
      data: superadmin,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get By Id Super Admin
const GetSuperAdminById = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Super admin id is required ", 400));
    }
    let superadmin = await SuperadminModel.findById(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Super Admin Fetched Successfully",
      data: superadmin,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete Super Admin
const DeleteSuperadmin = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Super admin id is required ", 400));
    }
    let superadmin = await SuperadminModel.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Super Admin Deleted Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Login Super Admin
const LoginSuperadmin = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, Password } = req.body;

    // Check user
    let superadmin = await SuperadminModel.findOne({
      Email: Email,
      Password: Password,
    });
    if (!superadmin) {
      return next(new AppErr("invailed email or password", 400));
    }

    // generate token
    let token = await generateToken(superadmin._id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Login Successfully",
      data: superadmin,
      token: token,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateSuperAdmin,
  UpdateSuperAdmin,
  GetSuperAdmin,
  GetSuperAdminById,
  DeleteSuperadmin,
  LoginSuperadmin,
};
