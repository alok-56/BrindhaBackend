const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/excel/"); // make sure this path exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const excelUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) return cb(null, true);
    cb(new Error("Only Excel files are allowed"));
  },
});

module.exports = excelUpload;
