const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const MeasurementModel = require("../../Models/Master/measurement");

// Create measurement
const Createmeasurement = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { measurement } = req.body;

    let checkmeasurement = await MeasurementModel.findOne({
      measurement: measurement,
    });
    if (checkmeasurement) {
      returnnext(new AppErr("measurement Already present", 400));
    }

    let newmeasurement = await MeasurementModel.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "measurement Created Successfully",
      data: newmeasurement,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update measurement
const Updatemeasurement = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { measurement } = req.body;

    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    if (measurement) {
      let checkmeasurement = await MeasurementModel.findOne({
        measurement: measurement,
        _id: { $ne: id },
      });
      if (checkmeasurement) {
        returnnext(new AppErr("measurement Already present", 400));
      }
    }

    const updateData = {};
    if (measurement) updateData.measurement = measurement;

    let newmeasurement = await MeasurementModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "measurement Updated Successfully",
      data: newmeasurement,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All measurement
const GetAllmeasurement = async (req, res, next) => {
  try {
    let measurement = await MeasurementModel.find();
    return res.status(200).json({
      status: true,
      code: 200,
      message: "measurement Fetched Successfully",
      data: measurement,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get measurement By Id
const GetmeasurementById = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }

    let measurement = await MeasurementModel.findById(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "measurement Fetched Successfully",
      data: measurement,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Delete measurement
const Deletemeasurement = async (req, res, next) => {
  try {
    let { id } = req.params;
    if (!id) {
      return next(new AppErr("Id not found", 404));
    }
    let measurement = await MeasurementModel.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "measurement Fetched Successfully",
      data: measurement,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  Createmeasurement,
  Updatemeasurement,
  GetAllmeasurement,
  GetmeasurementById,
  Deletemeasurement,
};
