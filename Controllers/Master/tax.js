const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const TaxModel = require("../../Models/Master/Tax");

// Create Tax
const CreateTax = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Taxtype, Percentage } = req.body;

    let checktax = await TaxModel.findOne({ Taxtype: Taxtype });
    if (checktax) {
      returnnext(new AppErr("Tax Already present", 400));
    }

    let newtax = await TaxModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Tax Created Successfully",
      data: newtax,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Tax
const UpdateTax = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { Taxtype, Percentage } = req.body;

    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    if (Taxtype) {
      let checktax = await TaxModel.findOne({
        Taxtype: Taxtype,
        _id: { $ne: id },
      });
      if (checktax) {
        return next(new AppErr("Tax Already present", 400));
      }
    }

    const updateData = {};
    if (Taxtype) updateData.Taxtype = Taxtype;
    if (Percentage) updateData.Percentage = Percentage;

    let newtax = await TaxModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Tax Updated Successfully",
      data: newtax,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All Tax
const GetAllTax = async (req, res, next) => {
  try {
    let tax = await TaxModel.find();
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Tax Fetched Successfully",
      data: tax,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Tax By Id
const GetTaxById = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    let tax = await TaxModel.findById(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Tax Fetched Successfully",
      data: tax,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete Tax
const DeleteTax = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }
    let tax = await TaxModel.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Tax Fetched Successfully",
      data: tax,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateTax,
  UpdateTax,
  GetAllTax,
  GetTaxById,
  DeleteTax,
};
