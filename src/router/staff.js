import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
require("dotenv").config();

const Staff = require("../models/Staff");
const Store = require("../models/Store");

const staffRoute = express.Router();

staffRoute.get("/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const staff = await Staff.find({ store: storeId });
    if (staff)
      return sendSuccess(res, "Get staff information successfully.", staff);
    return sendError(res, "Staff information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// staffRoute.delete("/:staffId", async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const staff = await Staff.findOne({ _id: staffId });
//     if (!staff) return sendError(res, "Staff not exists");
//     await Staff.findByIdAndRemove(staffId);
//     return sendSuccess(res, "Delete staff successfully");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

staffRoute.delete("/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findById(staffId);

    if (!staff) return sendError(res, "Staff not exists");

    await Staff.findByIdAndDelete(staffId);

    return sendSuccess(res, "Deleted staff successfully");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

staffRoute.post("/create/:storeId", async (req, res) => {
  try {
    const { name, phone, level, experience, salary } = req.body;
    const { storeId } = req.params;
    const staff = await Staff.create({
      name: name,
      phone: phone,
      level: level,
      experience: experience,
      salary: salary,
      store: storeId,
    });

    if (staff) return sendSuccess(res, "Create staff successfully", staff);
    return sendError(res, "Failed to create staff");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// staffRoute.put("/update/:staffId", async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const { name, price, decription, duration } = req.body;
//     const staff = await Staff.findByIdAndUpdate(staffId, {
//       name: name,
//       price: price,
//       decription: decription,
//       duration: duration,
//     });
//     if (staff)
//       return sendSuccess(res, "Update staff successfully", staff);
//     return sendError(res, "Failed to update staff");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

staffRoute.put("/update/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, phone, level, experience, salary } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) return sendError(res, "Staff not found");

    let updatedData = { name, phone, level, experience, salary };

    const updatedStaff = await Staff.findByIdAndUpdate(staffId, updatedData, {
      new: true,
    });
    return sendSuccess(res, "Update staff successfully", updatedStaff);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

export default staffRoute;
