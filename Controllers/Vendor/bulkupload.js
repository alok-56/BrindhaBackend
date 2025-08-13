const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const MeasurementModel = require("../../Models/Master/measurement");
const ProductModel = require("../../Models/Product/product");
const AppErr = require("../../Helper/appError");
const CategoryModel = require("../../Models/Master/category");
const ExcelJS = require("exceljs");
const SubcategoryModel = require("../../Models/Master/subcategory");

const BulkCreateProduct = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppErr("No file uploaded", 400));

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const processedProducts = [];
    

    for (let item of data) {
      const {
        Category,
        Subcategory,
        Measurement,
        Name,
        Description,
        Features,
        Colors,
        Stock,
        Images,
        Yourprice,
        SellingPrice,
        Ecofriendly,
      } = item;

      const category = await CategoryModel.findOne({
        Categoryname: Category,
      });
      if (!category) {
        return res.status(400).json({
          status: false,
          message: "Not a vailed Category! Please check Category Name",
        });
      }

      const subcategoryNameOnly = Subcategory?.split(" (")[0];
      const subcategory = await SubcategoryModel.findOne({
        Subcategoryname: subcategoryNameOnly,
      });

      if (!subcategory) {
        return res.status(400).json({
          status: false,
          message: "Not a vailed Subcategory! Please check Subcategory Name",
        });
      }

      const measurement = await MeasurementModel.findOne({
        measurement: Measurement,
      });
      if (!measurement) {
        return res.status(400).json({
          status: false,
          message: "Not a vailed measurement! Please check measurement Name",
        });
      }

      // ✅ Process fields
      processedProducts.push({
        SubcategoryId: category._id,
        CategoryId: subcategory._id,
        Measturments: measurement._id,
        VendorId: req.user,
        Name: Name?.trim(),
        Description: Description?.trim(),
        Features: Features ? Features.split(",").map((f) => f.trim()) : [],
        colors: Colors.split(",").map((c) => c.trim()),
        Stock: Number(Stock) || 0,
        Images: Images ? Images.split(",").map((i) => i.trim()) : [],
        Yourprice: Number(Yourprice) || 0,
        SellingPrice: Number(SellingPrice) || 0,
        Ecofriendly: Ecofriendly === "yes" ? true : false,
      });
    }

    if (!processedProducts.length) {
      fs.unlinkSync(req.file.path);
      return next(new AppErr("No valid data to insert", 400));
    }

    const products = await ProductModel.insertMany(processedProducts);

    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      status: true,
      message: "Products uploaded successfully",
      data: products,
    });
  } catch (err) {
    return next(new AppErr(err.message, 500));
  }
};

// const downloadTemplate = async (req, res, next) => {
//   try {
//     const categories = await CategoryModel.find()?.select("Categoryname");
//     const subcategories = await SubcategoryModel.find()
//       .populate("CategoryId", "Categoryname")
//       .select("Subcategoryname CategoryId");
//     const measurements = await MeasurementModel.find().select("measurement");

//     const categoryNames = categories.map((c) => c.Categoryname).join(",");
//     const subcategoryNames = subcategories
//       .map((s) => `${s.Subcategoryname} (${s.CategoryId.Categoryname})`)
//       .join(",");
//     const measurementNames = measurements.map((m) => m.measurement).join(",");

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Template");

//     // Define headers
//     worksheet.columns = [
//       { header: "Category", key: "category" }, // A
//       { header: "Subcategory", key: "subcategory" }, // B
//       { header: "Measurement", key: "measurement" }, // C
//       { header: "Name", key: "name" }, // D
//       { header: "Description", key: "description" }, // E
//       { header: "Features", key: "features" }, // F
//       { header: "Colors", key: "colors" }, // G
//       { header: "Stock", key: "stock" }, // H
//       { header: "Images", key: "images" }, // I
//       { header: "Yourprice", key: "yourprice" }, // J
//       { header: "SellingPrice", key: "sellingprice" }, // K
//       { header: "Ecofriendly", key: "ecofriendly" }, // L
//     ];

//     for (let i = 2; i <= 100; i++) {
//       // Category dropdown in Column A
//       worksheet.getCell(`A${i}`).dataValidation = {
//         type: "list",
//         allowBlank: true,
//         formulae: [`"${categoryNames}"`],
//       };

//       // Subcategory (with category) dropdown in Column B
//       worksheet.getCell(`B${i}`).dataValidation = {
//         type: "list",
//         allowBlank: true,
//         formulae: [`"${subcategoryNames}"`],
//       };

//       // Measurement dropdown in Column C
//       worksheet.getCell(`C${i}`).dataValidation = {
//         type: "list",
//         allowBlank: true,
//         formulae: [`"${measurementNames}"`],
//       };

//       // Ecofriendly dropdown in Column L
//       worksheet.getCell(`L${i}`).dataValidation = {
//         type: "list",
//         allowBlank: true,
//         formulae: [`"Yes,No"`],
//       };
//     }

//     // Save to file
//     const uploadsDir = path.join(__dirname, "../../uploads");
//     const filePath = path.join(uploadsDir, "ProductTemplate.xlsx");

//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     await workbook.xlsx.writeFile(filePath);
//     return res.download(filePath);
//   } catch (err) {
//     return next(new AppErr(err.message, 500));
//   }
// };

const downloadTemplate = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find().select("Categoryname");
    const subcategories = await SubcategoryModel.find()
      .populate("CategoryId", "Categoryname")
      .select("Subcategoryname CategoryId");
    const measurements = await MeasurementModel.find().select("measurement");

    const categoryNames = categories
      .filter(c => c?.Categoryname)
      .map(c => c.Categoryname)
      .join(",");

    const subcategoryNames = subcategories
      .map(s => {
        const catName = s.CategoryId?.Categoryname || "No Category";
        return `${s.Subcategoryname} (${catName})`;
      })
      .join(",");

    const measurementNames = measurements
      .filter(m => m?.measurement)
      .map(m => m.measurement)
      .join(",");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    // Define headers
    worksheet.columns = [
      { header: "Category", key: "category" },
      { header: "Subcategory", key: "subcategory" },
      { header: "Measurement", key: "measurement" },
      { header: "Name", key: "name" },
      { header: "Description", key: "description" },
      { header: "Features", key: "features" },
      { header: "Colors", key: "colors" },
      { header: "Stock", key: "stock" },
      { header: "Images", key: "images" },
      { header: "Yourprice", key: "yourprice" },
      { header: "SellingPrice", key: "sellingprice" },
      { header: "Ecofriendly", key: "ecofriendly" },
    ];

    // Add dropdowns
    for (let i = 2; i <= 100; i++) {
      worksheet.getCell(`A${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${categoryNames}"`],
      };
      worksheet.getCell(`B${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${subcategoryNames}"`],
      };
      worksheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${measurementNames}"`],
      };
      worksheet.getCell(`L${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"Yes,No"`],
      };
    }

    // ✅ Send file directly to client
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ProductTemplate.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return next(new AppErr(err.message, 500));
  }
};


const bulkUploadMasters = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppErr("No file uploaded", 400));
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const categorySet = new Set();
    const subcategoryData = [];
    const measurementSet = new Set();

    for (const row of data) {
      const { Category, Subcategory, Measurement } = row;

      if (Category) categorySet.add(Category.trim());
      if (Measurement) measurementSet.add(Measurement.trim());

      if (Subcategory && Category) {
        subcategoryData.push({
          Subcategoryname: Subcategory.trim(),
          Categoryname: Category.trim(),
        });
      }
    }

    // Insert Categories
    for (let categoryName of categorySet) {
      await CategoryModel.updateOne(
        { Categoryname: categoryName },
        { $setOnInsert: { Categoryname: categoryName } },
        { upsert: true }
      );
    }

    // Insert Subcategories
    for (let item of subcategoryData) {
      const category = await CategoryModel.findOne({
        Categoryname: item.Categoryname,
      });
      if (category) {
        await SubcategoryModel.updateOne(
          { Subcategoryname: item.Subcategoryname, CategoryId: category._id },
          {
            $setOnInsert: {
              Subcategoryname: item.Subcategoryname,
              CategoryId: category._id,
            },
          },
          { upsert: true }
        );
      }
    }

    // Insert Measurements
    for (let m of measurementSet) {
      await MeasurementModel.updateOne(
        { measurement: m },
        { $setOnInsert: { measurement: m } },
        { upsert: true }
      );
    }

    fs.unlinkSync(req.file.path);
    res
      .status(200)
      .json({ status: true, message: "Masters uploaded successfully" });
  } catch (err) {
    return next(new AppErr(err.message, 500));
  }
};

// const downloadMasterTemplate = async (req, res, next) => {
//   try {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("MasterTemplate");

//     worksheet.columns = [
//       { header: "Category", key: "category", width: 25 },
//       { header: "Subcategory", key: "subcategory", width: 30 },
//       { header: "Measurement", key: "measurement", width: 20 },
//     ];

//     for (let i = 2; i <= 100; i++) {
//       worksheet.getCell(`A${i}`).dataValidation = {
//         type: "textLength",
//         operator: "greaterThan",
//         formulae: [0],
//         showErrorMessage: true,
//         errorTitle: "Required",
//         error: "Category cannot be empty",
//       };
//     }

//     const filePath = path.join(__dirname, "../../uploads/MasterTemplate.xlsx");
//     if (!fs.existsSync(path.dirname(filePath))) {
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     }

//     await workbook.xlsx.writeFile(filePath);
//     return res.download(filePath);
//   } catch (err) {
//     return next(new AppErr(err.message, 500));
//   }
// };

const downloadMasterTemplate = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MasterTemplate");

    worksheet.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Subcategory", key: "subcategory", width: 30 },
      { header: "Measurement", key: "measurement", width: 20 },
    ];

    for (let i = 2; i <= 100; i++) {
      worksheet.getCell(`A${i}`).dataValidation = {
        type: "textLength",
        operator: "greaterThan",
        formulae: [0],
        showErrorMessage: true,
        errorTitle: "Required",
        error: "Category cannot be empty",
      };
    }

    // Set correct headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=MasterTemplate.xlsx"
    );

    // Stream directly to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return next(new AppErr(err.message, 500));
  }
};

module.exports = {
  BulkCreateProduct,
  downloadTemplate,
  bulkUploadMasters,
  downloadMasterTemplate,
};
