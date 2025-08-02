const { validationResult } = require("express-validator");
const AppErr = require("../../Helper/appError");
const TicketModal = require("../../Models/Tickets");

// Create Ticket
const CreateTicket = async (req, res, next) => {
  try {
    const err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { TicketTitle, role, Message } = req.body;

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const Ticketnumber = `TICKET-${randomNum}`;

    const UserId = req.user;

    const ticket = await TicketModal.create({
      Ticketnumber,
      TicketTitle,
      UserId,
      role,
      Message,
    });

    res.status(201).json({
      status: true,
      code: 200,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All My Ticket
const GetMyTickets = async (req, res, next) => {
  try {
    const tickets = await TicketModal.find({ UserId: req.user }).populate(
      "UserId"
    );

    res.status(200).json({
      status: true,
      code: 200,
      message: "Ticket Fetched successfully",
      data: tickets,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Ticket By Super
const GetAllTickets = async (req, res, next) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role) {
      filter.role = role;
    }

    const tickets = await TicketModal.find(filter).populate("UserId");

    res.status(200).json({
      status: true,
      code: 200,
      message: "Ticket Fetched successfully",
      data: tickets,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update status of Ticket
const UpdateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await TicketModal.findByIdAndUpdate(
      ticketId,
      { Status: status },
      { new: true }
    );

    res.status(200).json({
      status: true,
      code: 200,
      message: "Ticket status updated",
      data: ticket,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Message
const PushMessageToTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { Message } = req.body;

    if (!Message) {
      return next(new AppErr("Message is required", 400));
    }

    const ticket = await TicketModal.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          Message: Message,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Message added to ticket",
      data: ticket,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Ticket by Id
const GetTicketById = async (req, res, next) => {
  try {
    let { id } = req.params;
    const tickets = await TicketModal.findById(id);

    res.status(200).json({
      status: true,
      code: 200,
      message: "Ticket Fetched successfully",
      data: tickets,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateTicket,
  GetMyTickets,
  GetAllTickets,
  UpdateTicketStatus,
  PushMessageToTicket,
  GetTicketById,
};
