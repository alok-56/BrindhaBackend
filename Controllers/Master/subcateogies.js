const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const SubcategoryModel = require("../../Models/Master/subcategory");
const CategoryModel = require("../../Models/Master/category");

// Create subcateogries
const Createsubcateogries = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { CategoryId, Subcategoryname } = req.body;

    let cateogiescheck = await CategoryModel.findById(CategoryId);
    if (!cateogiescheck) {
      return next(new AppErr("cateogries Not Found", 404));
    }

    let checksubcateogries = await SubcategoryModel.findOne({
      Subcategoryname: Subcategoryname,
    });
    if (checksubcateogries) {
      return next(new AppErr("subcateogries Already present", 400));
    }

    let newsubcateogries = await SubcategoryModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "subcateogries Created Successfully",
      data: newsubcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update subcateogries
const Updatesubcateogries = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { CategoryId, Subcategoryname } = req.body;

    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    if (Subcategoryname) {
      let checksubcateogries = await SubcategoryModel.findOne({
        Subcategoryname: Subcategoryname,
        _id: { $ne: id },
      });
      if (checksubcateogries) {
        returnnext(new AppErr("subcateogries Already present", 400));
      }
    }

    if (CategoryId) {
      let cateogiescheck = await CategoryModel.findById(CategoryId);
      if (!cateogiescheck) {
        return next(new AppErr("cateogries Not Found", 404));
      }
    }

    const updateData = {};
    if (Subcategoryname) updateData.Subcategoryname = Subcategoryname;
    if (CategoryId) updateData.CategoryId = CategoryId;

    let newsubcateogries = await SubcategoryModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

  

    return res.status(200).json({
      status: true,
      code: 200,
      message: "subcateogries Updated Successfully",
      data: newsubcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All subcateogries
const GetAllsubcateogries = async (req, res, next) => {
  try {
    let subcateogries = await SubcategoryModel.find().populate("CategoryId")
    return res.status(200).json({
      status: true,
      code: 200,
      message: "subcateogries Fetched Successfully",
      data: subcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get subcateogries By Id
const GetsubcateogriesById = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    let subcateogries = await SubcategoryModel.findById(id).populate("CategoryId")
    return res.status(200).json({
      status: true,
      code: 200,
      message: "subcateogries Fetched Successfully",
      data: subcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete subcateogries
const Deletesubcateogries = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }
    let subcateogries = await SubcategoryModel.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "subcateogries Fetched Successfully",
      data: subcateogries,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  Createsubcateogries,
  Updatesubcateogries,
  GetAllsubcateogries,
  GetsubcateogriesById,
  Deletesubcateogries,
};
