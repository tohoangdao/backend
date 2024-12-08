import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import { verifyToken } from "../middleware/index.js";
require("dotenv").config();

const Appointment = require("../models/Appointment");
const Store = require("../models/Store");
const Service = require("../models/Service");
const User = require("../models/User");

const appointmentRoute = express.Router();

appointmentRoute.get("/", async (req, res) => {
  try {
    const appointment = await Appointment.find({})
      .populate("user", "firstName lastName phoneNumber")
      .populate("service")
      .populate("store", "name address")
      .sort({ _id: -1 })
      .exec();
    if (appointment)
      return sendSuccess(res, "Get information successfully.", appointment);
    return sendError(res, "Appointment information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// appointmentRoute.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const appointment = await Appointment.findById(id);
//     if (appointment)
//       return sendSuccess(res, "Get appointment successful.", appointment);
//     return sendError(res, "Not information found.");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

appointmentRoute.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ user: userId })
      .populate("service", "name")
      .populate("store", "name address")
      .sort({ _id: -1 })
      .exec();
    return sendSuccess(
      res,
      "Appointments retrieved successfully.",
      appointments
    );
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

appointmentRoute.get("/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const appointments = await Appointment.find({ store: storeId })
      .populate("user", "firstName lastName phoneNumber")
      .populate("service")
      .populate("store", "name address")
      .sort({ _id: -1 })
      .exec();
    return sendSuccess(
      res,
      "Appointments retrieved successfully.",
      appointments
    );
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

appointmentRoute.post("/create", verifyToken, async (req, res) => {
  try {
    const { userId, storeId, serviceId, bookingTime } = req.body;
    const service = await Service.findOne({ _id: serviceId });
    let price;
    if (service.dailyDeal)
      price = (service.price * (100 - service.discount)) / 100;
    else price = service.price;

    const appointment = await Appointment.create({
      user: userId,
      store: storeId,
      service: serviceId,
      bookingTime: bookingTime,
      price: price,
    });
    return sendSuccess(res, "Appointments created successfully.", appointment);
  } catch (error) {
    console.log(error);

    return sendServerError(res);
  }
});

appointmentRoute.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (appointment)
      return sendSuccess(res, "Delete appointment successful.", appointment);
    return sendError(res, "No appointment found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// appointmentRoute.put("/update/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const appointment = await Appointment.findByIdAndUpdate(id, {
//       status: status,
//     });
//     if (appointment)
//       return sendSuccess(res, "Update appointment successful.", appointment);
//     return sendError(res, "Failed to update appointment");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

appointmentRoute.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the appointment by ID
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return sendError(res, "Appointment not found");
    }

    // Update the appointment's status
    appointment.status = status;
    await appointment.save();

    // If status is 'completed', update the user's totalSpend
    if (status === "completed") {
      const userId = appointment.user; // Assuming `user` is a reference field in the Appointment schema
      const price = appointment.price; // Assuming `price` exists in the Appointment schema
      const storeId = appointment.store; // Assuming `storeId` exists in

      // Update the user's totalSpend
      await User.findByIdAndUpdate(userId, {
        $inc: { totalSpend: price },
      });

      await Store.findByIdAndUpdate(storeId, {
        $inc: { revenue: price },
      });
    }

    return sendSuccess(res, "Update appointment successful.", appointment);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
});

export default appointmentRoute;
