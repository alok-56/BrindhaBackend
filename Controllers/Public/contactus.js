const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const contactmodel = require("../../Models/Public/contactus");


const CreateContactUs = async (req, res, next) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { name, email, phone, subject, message } = req.body;

    const newContact = await contactmodel.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      status: true,
      code: 200,
      message: "Message submitted successfully",
      data: newContact,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetAllContactUs = async (req, res, next) => {
  try {
    const contacts = await contactmodel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Messages fetched successfully",
      data: contacts,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateContactUs,
  GetAllContactUs,
};
