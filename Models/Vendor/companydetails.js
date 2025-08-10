const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    BussinessName: {
      type: String,
    },
    BussinessEmail: {
      type: String,
    },
    BussinessNumber: {
      type: Number,
    },
    BussinessWebsite: {
      type: String,
    },
    Bussinesstype: {
      type: String,
      enum: ["Individual", "Company"],
    },
    GstNumber: {
      type: String,
    },
    PanNumber: {
      type: String,
    },
    Bankdetails: {
      AccountholderName: String,
      BankName: String,
      Accountnumber: String,
      Ifsc: String,
    },
    Address: {
      State: String,
      City: String,
      Country: String,
      Place: String,
      Pincode: Number,
      lat: String,
      lon: String,
    },
    Documents: {
      AddressProof: String,
      AadharCard: String,
      Pincard: String,
      BankPassbook: String,
    },
    isVerfied: {
      type: Boolean,
      required: true,
      default: false,
    },
    isrejected: {
      type: Boolean,
      required: true,
      default: false,
    },
    rejectremark: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CompanyModel = mongoose.model("Company", CompanySchema);
module.exports = CompanyModel;
