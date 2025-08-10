const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const ShipingAddressSchemaModel = require("../../Models/User/shipingaddress");

const CreateShippingAddress = async (req, res, next) => {
  try {
    const err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { FullAddress, Country, State, City, Pincode,lat,lon } = req.body;
    const UserId = req.user;

    const newAddress = await ShipingAddressSchemaModel.create({
      UserId,
      FullAddress,
      Country,
      State,
      City,
      Pincode,
      lat,
      lon
    });

    res.status(200).json({
      status: true,
      code: 200,
      message: "Shipping address created successfully",
      data: newAddress,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetMyAddresses = async (req, res, next) => {
  try {
    const addresses = await ShipingAddressSchemaModel.find({
      UserId: req.user,
    });

    res.status(200).json({
      status: true,
      code: 200,
      message: "Shipping addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetAddressById = async (req, res, next) => {
  try {
    const address = await ShipingAddressSchemaModel.findOne({
      _id: req.params.id,
      UserId: req.user,
    });

    if (!address) {
      return next(new AppErr("Address not found", 404));
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Shipping address fetched successfully",
      data: address,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const UpdateAddress = async (req, res, next) => {
  try {
    const updated = await ShipingAddressSchemaModel.findOneAndUpdate(
      { _id: req.params.id, UserId: req.user },
      req.body,
      { new: true }
    );

    if (!updated) {
      return next(new AppErr("Address not found or not authorized", 404));
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Shipping address updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const DeleteAddress = async (req, res, next) => {
  try {
    const deleted = await ShipingAddressSchemaModel.findOneAndDelete({
      _id: req.params.id,
      UserId: req.user,
    });

    if (!deleted) {
      return next(new AppErr("Address not found or not authorized", 404));
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Shipping address deleted successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateShippingAddress,
  GetMyAddresses,
  GetAddressById,
  UpdateAddress,
  DeleteAddress,
};
