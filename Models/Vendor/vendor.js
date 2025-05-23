const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
  {
    CompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    BussinessName: {
      type: String,
      required: false,
    },
    Vendorname: {
      type: String,
      required: true,
    },
    ReportAdmin: {
      type: String,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Number: {
      type: Number,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Isheadrole: {
      type: Boolean,
      required: true,
      default: false,
    },
    isCompanyVerified: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Requestsend", "rejected", "Resend", "Approved"],
    },
    Permission: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);

const VendorModel = mongoose.model("vendor", VendorSchema);
module.exports = VendorModel;
