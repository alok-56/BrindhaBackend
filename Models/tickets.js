const mongoose = require("mongoose");

const TicketSchema = mongoose.Schema(
  {
    Ticketnumber: {
      type: String,
      required: true,
    },
    TicketTitle: {
      type: String,
      required: true,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Vendor"],
    },
    Status: {
      type: String,
      enum: ["New", "Active", "End"],
      default: "New",
    },
    Message: [
      {
        msg: String,
        date: String,
        document: String,
        user: String,
        role: String,
      },
    ],
  },
  { timestamps: true }
);

const TicketModal = mongoose.model("Ticket", TicketSchema);
module.exports = TicketModal;
