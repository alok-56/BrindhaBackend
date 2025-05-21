const express = require("express");
const { body } = require("express-validator");
const { IsVendor } = require("../Middleware/IsVendor");
const { IsVendorVerified } = require("../Middleware/IsVendorverified");
const { IsSuperAdmin } = require("../Middleware/IsSuperAdmin");
const { IsUser } = require("../Middleware/IsUser");
const {
  CreateTicket,
  GetMyTickets,
  GetAllTickets,
  UpdateTicketStatus,
  PushMessageToTicket,
  GetTicketById,
} = require("../Controllers/Tickets/ticket");

const TicketRouter = express.Router();

//Ticket Create
TicketRouter.post(
  "/create/ticket",
  body("TicketTitle").notEmpty().withMessage("TicketTitle is required"),
  body("role").notEmpty().withMessage("role is required"),
  body("Message").notEmpty().withMessage("Message is required"),
  IsVendor,
  CreateTicket
);

//Get My Ticket
TicketRouter.get("/getmy/ticket", IsVendor, GetMyTickets);

// Get Ticket By Id
TicketRouter.get("/getmy/ticket/:id", GetTicketById);

//Get all Ticket for super
TicketRouter.get("/getall/ticket", IsSuperAdmin, GetAllTickets);

//Update Ticket status
TicketRouter.patch(
  "/update/ticket/:ticketId",
  IsSuperAdmin,
  UpdateTicketStatus
);

// Ticket Chating
TicketRouter.patch(
  "/chat/ticket/:ticketId",
  body("Message").notEmpty().withMessage("Message is required"),
  PushMessageToTicket
);

module.exports = TicketRouter;
