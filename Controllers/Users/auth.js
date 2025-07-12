const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const { generateToken } = require("../../Helper/generateToken");
const UserModel = require("../../Models/User/user");
const SendEmail = require("../../Helper/Email/sendEmail");
const OtpModal = require("../../Models/User/otp");

// Create Super Admin
const CreateUser = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Username, Email, Number, Password, UserType } = req.body;

    // Email Check
    let email = await UserModel.findOne({ Email: Email });
    if (email) {
      return next(new AppErr("email already exists", 400));
    }

    // Number Check
    let number = await UserModel.findOne({ Number: Number });
    if (number) {
      return next(new AppErr("number already exists", 400));
    }

    // Create super admin
    let User = await UserModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Created Successfully",
      data: User,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update User
const UpdateUser = async (req, res, next) => {
  try {
    let { Username, Email, Number, Password, UserType } = req.body;
    let id = req.user;

    // Email Check
    if (Email) {
      let email = await UserModel.findOne({
        Email: Email,
        _id: { $ne: id },
      });
      if (email) {
        return next(new AppErr("email already exists", 400));
      }
    }

    // Number Check
    if (Number) {
      let number = await UserModel.findOne({
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
    if (Username) update.Username = Username;
    if (Password) update.Password = Password;
    if (UserType) update.UserType = UserType;

    // Create super admin
    let User = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Updated Successfully",
      data: User,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get MY Data
const GetMyData = async (req, res, next) => {
  try {
    let User = await UserModel.findById(req.user);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Fetched Successfully",
      data: User,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete User
const DeleteUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("User id is required ", 400));
    }
    let User = await UserModel.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Login User
const LoginUser = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, Password } = req.body;

    // Check user
    let User = await UserModel.findOne({
      Email: Email,
      Password: Password,
    });
    if (!User) {
      return next(new AppErr("invailed email or password", 400));
    }

    // generate token
    let token = await generateToken(User._id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Login Successfully",
      data: User,
      token: token,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Login With Google
const loginWithGoogle = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Username, Email, Password } = req.body;

    // Email Check
    let email = await UserModel.findOne({ Email: Email });
    if (!email) {
      let User = await UserModel.create({
        Username: Username,
        Email: Email,
        Password: Password,
      });

      let token = await generateToken(User._id);
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Login Successfully",
        data: User,
        token: token,
      });
    } else {
      let token = await generateToken(email._id);
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Login Successfully",
        data: email,
        token: token,
      });
    }
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Send Otp
const SendOtp = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email } = req.body;

    // Check if user exists
    let email = await UserModel.findOne({ Email: Email });
    if (!email) {
      return next(new AppErr("User Not Found", 400));
    }

    // Generate a random 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    await OtpModal.create({ otp: otp });
    await SendEmail(Email, "OTP", email.Username, { otp: otp });

    res
      .status(200)
      .json({ status: true, code: 200, message: "OTP sent successfully" });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// VeriFy Otp
const VerifyOtp = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { otp } = req.body;

    // Check if user exists
    let otpexists = await OtpModal.findOne({ otp: otp });
    if (!otpexists) {
      return next(new AppErr("Otp Expired", 400));
    }

    if (otpexists.otp !== Number(otp)) {
      return next(new AppErr("Invailed Otp", 400));
    }

    await OtpModal.findByIdAndDelete(otpexists._id);

    res
      .status(200)
      .json({ status: true, code: 200, message: "OTP Verified successfully" });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Forget Password
const ForgetPassword = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, Password } = req.body;

    let email = await UserModel.findOne({
      Email: Email,
    });
    if (!email) {
      return next(new AppErr("User Not Found", 400));
    }

    const update = {};
    if (Password) update.Password = Password;

    // Create super admin
    let User = await UserModel.findByIdAndUpdate(email._id, update, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateUser,
  UpdateUser,
  GetMyData,
  DeleteUser,
  LoginUser,
  SendOtp,
  ForgetPassword,
  loginWithGoogle,
  VerifyOtp,
};
