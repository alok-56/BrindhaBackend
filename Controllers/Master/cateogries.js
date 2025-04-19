const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const CategoryModel = require("../../Models/Master/category");

// Create cateogries
const Createcateogries = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Categoryname } = req.body;

    let checkcateogries = await CategoryModel.findOne({
      Categoryname: Categoryname,
    });
    if (checkcateogries) {
      return next(new AppErr("cateogries Already present", 400));
    }

    let newcateogries = await CategoryModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "cateogries Created Successfully",
      data: newcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update cateogries
const Updatecateogries = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { Categoryname } = req.body;

    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    if (Categoryname) {
      let checkcateogries = await CategoryModel.findOne({
        Categoryname: Categoryname,
        _id: { $ne: id },
      });
      if (checkcateogries) {
        return next(new AppErr("cateogries Already present", 400));
      }
    }

    const updateData = {};
    if (Categoryname) updateData.Categoryname = Categoryname;

    let newcateogries = await CategoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "cateogries Updated Successfully",
      data: newcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All cateogries
const GetAllcateogries = async (req, res, next) => {
  try {
    let cateogries = await CategoryModel.find();
    return res.status(200).json({
      status: true,
      code: 200,
      message: "cateogries Fetched Successfully",
      data: cateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get cateogries By Id
const GetcateogriesById = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    let cateogries = await CategoryModel.findById(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "cateogries Fetched Successfully",
      data: cateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete cateogries
const Deletecateogries = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }
    let cateogries = await CategoryModel.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "cateogries Fetched Successfully",
      data: cateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  Createcateogries,
  Updatecateogries,
  GetAllcateogries,
  GetcateogriesById,
  Deletecateogries,
};
