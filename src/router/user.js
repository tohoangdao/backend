import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import { verifyToken } from "../middleware/index.js";

require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userRoute = express.Router();

userRoute.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: "Customer" }).select("-password");
    if (users)
      return sendSuccess(res, "Get users information successfully.", users);
    return sendError(res, "Users information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

userRoute.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (user) return sendSuccess(res, "User deleted successfully.");
    return sendError(res, "User is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

userRoute.put("/profile/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      phoneNumber,
      password,
      gender,
      email,
      address,
    } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user) return sendError(res, "User is not found.");
    await User.findByIdAndUpdate(userId, {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      password: password,
      gender: gender,
      email: email,
      address: address,
    });
    const updatedProfile = await User.findById(userId).select("-password");
    return sendSuccess(res, "User updated successfully", updatedProfile);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

userRoute.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId }).select("-password");
    if (user)
      return sendSuccess(res, "Get user information successfully.", user);
    return sendError(res, "User is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

export default userRoute;
