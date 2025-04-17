const express = require("express");
const upload = require("../Middleware/fileUpload");
const {
  Uploadsingle,
  Uploadmultiple,
  deleteImageFromCloudinary,
} = require("../Controllers/FileUpload");
const FileRouter = express.Router();

FileRouter.post("/single", upload.single("Image"), Uploadsingle);

FileRouter.post(
  "/multiple",
  upload.fields([{ name: "Image", maxCount: 30 }]),

  Uploadmultiple
);

FileRouter.delete("/delete", deleteImageFromCloudinary);

module.exports = FileRouter;
