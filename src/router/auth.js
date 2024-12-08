import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authRoute = express.Router();
const saltRounds = 10;

// Register Route

authRoute.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return sendError(res, "Refresh token is required");

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

    // Check if user exists
    const user = await User.findById(decoded.user.userId);
    if (!user) return sendError(res, "User not found");

    // Generate a new access token
    const userData = {
      userId: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const newAccessToken = jwt.sign(
      { user: userData },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Send success response with the new access token
    return sendSuccess(res, "Access token refreshed successfully", {
      accessToken: newAccessToken,
    });

  } catch (error) {
    console.error("Error during refresh token:", error);
    return sendError(res, "Invalid refresh token");
  }
});
authRoute.post("/register", async (req, res) => {
  const { firstName, lastName, phoneNumber, password, gender } = req.body;
  try {
    // Check if phone number already exists
    const isExist = await User.exists({ phoneNumber });
    if (isExist) return sendError(res, "Phone number already exists");

    // Hash the password before saving the user
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    await User.create({
      firstName,
      lastName,
      phoneNumber,
      password: hashPassword,
      gender,
      role: "Customer",
    });

    // Respond with success
    return sendSuccess(res, "Registered successfully");
  } catch (error) {
    console.error("Failed to create account!", error);
    return sendServerError(res);
  }
});

// Login Route
authRoute.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) return sendError(res, "Phone number does not exist");

    // Compare provided password with stored hashed password
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) return sendError(res, "Incorrect password");

    // Create JWT access token and refresh token
    const userData = {
      userId: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const accessToken = jwt.sign(
      { user: userData },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { user: userData },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: process.env.JWT_EXPIRE_REFRESH }
    );

    // Send success response with tokens
    return sendSuccess(res, "Login successful", {
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Error during login:", error);
    return sendServerError(res);
  }
});

export default authRoute;
