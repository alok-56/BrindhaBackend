const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const CompanyModel = require("../../Models/Vendor/companydetails");
const VendorModel = require("../../Models/Vendor/vendor");
const { generateToken } = require("../../Helper/generateToken");
const emailQueue = require("../../Helper/Email/emailjobs");

// Create Vendor
const CreateVendor = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { BussinessName, Vendorname, Email, Number, Password } = req.body;
    req.body.Isheadrole = true;
    // Email Check
    let email = await VendorModel.findOne({ Email: Email });
    if (email) {
      return next(new AppErr("email already exists", 400));
    }

    // Number Check
    let number = await VendorModel.findOne({ Number: Number });
    if (number) {
      return next(new AppErr("number already exists", 400));
    }

    // Create vendor
    let vendor = await VendorModel.create(req.body);

    emailQueue.add({
      email: Email,
      subject: "Welcomevendor",
      name: Vendorname,
      extraData: {},
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Vendor Created Successfully",
      data: vendor,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Login Vendor
const LoginVendor = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, Password } = req.body;

    // Check user
    let vendor = await VendorModel.findOne({
      Email: Email,
      Password: Password,
    });
    if (!vendor) {
      return next(new AppErr("invailed email or password", 400));
    }

    // generate token
    let token = await generateToken(vendor._id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Login Successfully",
      data: vendor,
      token: token,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Send For Verification
const validateRequiredFields = (fields) => {
  const missingFields = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      missingFields.push(key);
    }
  }
  if (missingFields.length > 0) {
    return `The following fields are required: ${missingFields.join(", ")}`;
  }
  return null;
};

const SendForverification = async (req, res, next) => {
  try {
    // take loged user id
    let id = req.user;
    console.log(id);
    let vendor = await VendorModel.findById(id);
    if (!vendor) {
      return next("Vendor not found", 404);
    }
    if (vendor.isCompanyVerified === "Pending") {
      let {
        BussinessName,
        BussinessEmail,
        BussinessNumber,
        BussinessWebsite,
        Bussinesstype,
        GstNumber,
        PanNumber,
        Bankdetails: { AccountholderName, BankName, Accountnumber, Ifsc },
        Address: { State, City, Country, Place, Pincode },
        Documents: { AddressProof, AadharCard, Pincard, BankPassbook },
      } = req.body;

      // Validation for all fields
      const requiredFields = {
        BussinessName,
        BussinessEmail,
        BussinessNumber,
        BussinessWebsite,
        Bussinesstype,
        GstNumber,
        PanNumber,
        AccountholderName,
        BankName,
        Accountnumber,
        Ifsc,
        State,
        City,
        Country,
        Place,
        Pincode,
        AddressProof,
        AadharCard,
        Pincard,
        BankPassbook,
      };
      const missingFieldError = validateRequiredFields(requiredFields);
      if (missingFieldError) {
        return res.status(400).json({
          status: false,
          code: 400,
          message: missingFieldError,
        });
      }

      // check company email
      let email = await CompanyModel.findOne({
        BussinessEmail: BussinessEmail,
      });
      if (email) {
        return next(new AppErr("Email already exists", 400));
      }

      // check company number
      let number = await CompanyModel.findOne({
        BussinessNumber: BussinessNumber,
      });
      if (number) {
        return next(new AppErr("Number already exists", 400));
      }
      // create comapny
      let company = await CompanyModel.create(req.body);

      // update status of vendor
      vendor.isCompanyVerified = "Requestsend";
      vendor.CompanyId = company._id;
      await vendor.save();

      emailQueue.add({
        email: process.env.Email,
        subject: "VendorRegisterednew",
        name: BussinessName,
        extraData: {},
      });

      emailQueue.add({
        email: vendor.Email,
        subject: "VendorRegistered",
        name: BussinessName,
        extraData: {},
      });

      return res.status(200).json({
        status: false,
        code: 200,
        message: "Successfully send for verification",
      });
    } else {
      let {
        BussinessName,
        BussinessEmail,
        BussinessNumber,
        BussinessWebsite,
        Bussinesstype,
        GstNumber,
        PanNumber,
        Bankdetails: { AccountholderName, BankName, Accountnumber, Ifsc },
        Address: { State, City, Country, Place, Pincode },
        Documents: { AddressProof, AadharCard, Pincard, BankPassbook },
      } = req.body;

      // check company email
      if (BussinessEmail) {
        let email = await CompanyModel.findOne({
          BussinessEmail: BussinessEmail,
        });
        if (email) {
          return next(new AppErr("Email already exists", 400));
        }
      }

      // check company number
      if (BussinessNumber) {
        let number = await CompanyModel.findOne({
          BussinessNumber: BussinessNumber,
        });
        if (number) {
          return next(new AppErr("Email already exists", 400));
        }
      }

      const updatedFields = {};

      if (BussinessName) updatedFields.BussinessName = BussinessName;
      if (BussinessEmail) updatedFields.BussinessEmail = BussinessEmail;
      if (BussinessNumber) updatedFields.BussinessNumber = BussinessNumber;
      if (BussinessWebsite) updatedFields.BussinessWebsite = BussinessWebsite;
      if (Bussinesstype) updatedFields.Bussinesstype = Bussinesstype;
      if (GstNumber) updatedFields.GstNumber = GstNumber;
      if (PanNumber) updatedFields.PanNumber = PanNumber;
      if (Bankdetails) updatedFields.Bankdetails = Bankdetails;
      if (Address) updatedFields.Address = Address;
      if (Documents) updatedFields.Documents = Documents;

      await CompanyModel.findByIdAndUpdate(vendor.CompanyId, updatedFields, {
        new: true,
      });

      vendor.isCompanyVerified = "Resend";
      await vendor.save();

      return res.status(200).json({
        status: false,
        code: 200,
        message: "Successfully send for verification",
      });
    }
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get My Data
const MyVerificationData = async (req, res, next) => {
  try {
    let id = req.company;
    let data = await CompanyModel.findById(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Company Data Fetched Successfully",
      data: data,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Check My Verfication Status
const Verificationstatus = async (req, res, next) => {
  try {
    let id = req.user;
    let status = await VendorModel.findById(id).select("isCompanyVerified");

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Status Fetched Successfully",
      data: status,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Password
const UpdatePassword = async (req, res, next) => {
  try {
    let id = req.user;

    let { Email, Number, Password } = req.body;

    if (!Email && !Number) {
      return next(
        new AppErr("Email Or Number is required for Password Update", 400)
      );
    }

    if (!Password) {
      return next(new AppErr("Password is required", 400));
    }

    let vendor = await VendorModel.findOne({
      $or: [{ Email: Email }, { Number: Number }],
    });

    if (!vendor) {
      return next(new AppErr("Vendor not Found", 400));
    }

    let updatepassword = await VendorModel.findByIdAndUpdate(
      vendor._id,
      {
        Password: Password,
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Password Updated successfully",
      data: updatepassword,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Vendor Profile
const UpdateVendorProfile = async (req, res, next) => {
  try {
    let { Vendorname, Email, Number } = req.body;
    let id = req.user;

    if (!id) {
      return next(new AppErr("Vendor id is  required ", 400));
    }

    // Email Check
    if (Email) {
      let email = await VendorModel.findOne({
        Email: Email,
        _id: { $ne: id },
      });
      if (email) {
        return next(new AppErr("email already exists", 400));
      }
    }

    // Number Check
    if (Number) {
      let number = await VendorModel.findOne({
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
    if (Vendorname) update.Vendorname = Vendorname;

    // Create super admin
    let vendor = await VendorModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Super Admin Updated Successfully",
      data: vendor,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// create support Vendor
const CreateSupportVendor = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Vendorname, Email, Number, Password, Permission } = req.body;

    // fetch head vendor
    let headvendor = await VendorModel.findById(req.user);
    if (!headvendor) {
      return next(new AppErr("Head Vendor not found", 404));
    }

    req.body.CompanyId = req.company;
    req.body.BussinessName = headvendor.BussinessName;
    req.body.ReportAdmin = req.user;
    req.body.isCompanyVerified = "Approved";

    // Email Check
    let email = await VendorModel.findOne({ Email: Email });
    if (email) {
      return next(new AppErr("email already exists", 400));
    }

    // Number Check
    let number = await VendorModel.findOne({ Number: Number });
    if (number) {
      return next(new AppErr("number already exists", 400));
    }

    // Create vendor
    let vendor = await VendorModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Vendor Created Successfully",
      data: vendor,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update support vendor
const UpdateSupportVendor = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { VendorId } = req.params;
    const { Vendorname, Email, Number, Password, Permission } = req.body;

    // Fetch vendor to update
    let vendor = await VendorModel.findById(VendorId);
    if (!vendor) {
      return next(new AppErr("Staff Vendor not found", 404));
    }

    // Check for email uniqueness if changed
    if (Email && Email !== vendor.Email) {
      const existingEmail = await VendorModel.findOne({ Email });
      if (existingEmail) {
        return next(new AppErr("Email already exists", 400));
      }
      vendor.Email = Email;
    }

    // Check for number uniqueness if changed
    if (Number && Number !== vendor.Number) {
      const existingNumber = await VendorModel.findOne({ Number });
      if (existingNumber) {
        return next(new AppErr("Number already exists", 400));
      }
      vendor.Number = Number;
    }

    // Update other fields
    if (Vendorname) vendor.Vendorname = Vendorname;
    if (Password) vendor.Password = Password;
    if (Permission) vendor.Permission = Permission;

    await vendor.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Staff Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// get all support vendor
const GetAllSupportVendors = async (req, res, next) => {
  try {
    const supportVendors = await VendorModel.find({
      ReportAdmin: req.user,
      Isheadrole: false,
    }).select("-Password");

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Support vendors fetched successfully",
      data: supportVendors,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get support vendor by Id
const GetSupportVendorById = async (req, res, next) => {
  try {
    const { VendorId } = req.params;

    const vendor = await VendorModel.findOne({
      _id: VendorId,
      ReportAdmin: req.user,
      Isheadrole: false,
    }).select("-Password");

    if (!vendor) {
      return next(new AppErr("Support vendor not found", 404));
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Support vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete support vendor
const DeleteSupportVendor = async (req, res, next) => {
  try {
    const { VendorId } = req.params;

    const vendor = await VendorModel.findOneAndDelete({
      _id: VendorId,
      ReportAdmin: req.user,
      Isheadrole: false,
    });

    if (!vendor) {
      return next(new AppErr("Support vendor not found or unauthorized", 404));
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Support vendor deleted successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateVendor,
  LoginVendor,
  SendForverification,
  MyVerificationData,
  Verificationstatus,
  UpdatePassword,
  UpdateVendorProfile,
  CreateSupportVendor,
  UpdateSupportVendor,
  GetAllSupportVendors,
  GetSupportVendorById,
  DeleteSupportVendor,
};
