const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stores",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "services",
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    price:{
      type: Number,
    },
    status:{
      type: String,
      enum: ["completed", "booking", "cancelled"],
      default: "booking",
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("appointments", appointmentSchema);

module.exports = Appointment;
