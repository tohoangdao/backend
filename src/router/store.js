import express from "express";
import multer from "multer";
import fs from "fs";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
require("dotenv").config();

const Store = require("../models/Store");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Staff = require("../models/Staff");

const storeRoute = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/store");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
storeRoute.get("/", async (req, res) => {
  try {
    const store = await Store.find();
    const host = req.get('host'); // gets the hostname and port (if any)
    const protocol = req.protocol; // 'http' or 'https'
    const fullDomain = `${protocol}://${host}`;

    // Update each store's image field to include the full domain
    const storeWithFullImageUrl = store.map((item) => ({
      ...item.toObject(), // convert Mongoose document to plain object
      image: `${fullDomain}/store/${item.image}`, // prepend domain to the image path
    }));

    if (storeWithFullImageUrl.length > 0) {
      return sendSuccess(res, "get store information successfully.", storeWithFullImageUrl);
    }
    
    return sendError(res, "store information is not found.");
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
});

storeRoute.get("/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findOne({ _id: storeId });
    const host = req.get('host'); // gets the hostname and port (if any)
    const protocol = req.protocol; // 'http' or 'https'
    const fullDomain = `${protocol}://${host}`;

    store.image = `${fullDomain}/store/${store.image}`

    if (store) {
      return sendSuccess(res, "get store information successfully.", store);
    }
    
    return sendError(res, "store information is not found.");
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
});

// storeRoute.delete("/:storeId", async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const store = await Store.findOne({ _id: storeId });
//     if (!store) return sendError(res, "Store not exists");
//     const storeimagePath = `src/public/store/${store.image}`;
//     if (fs.existsSync(storeimagePath)) {
//       fs.unlinkSync(storeimagePath);  // Delete the image file
//     }
//     await Store.findByIdAndDelete(storeId);
//     return sendSuccess(res, "Delete store successfully");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

storeRoute.delete("/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check if the store exists
    const store = await Store.findOne({ _id: storeId });
    if (!store) return sendError(res, "Store not exists");

    // Delete the store's image if it exists
    const storeImagePath = `src/public/store/${store.image}`;
    if (fs.existsSync(storeImagePath)) {
      fs.unlinkSync(storeImagePath); // Delete the image file
    }

    // Delete related services and their images
    const services = await Service.find({ store: storeId });
    for (const service of services) {
      const serviceImagePath = `src/public/service/${service.image}`;
      if (fs.existsSync(serviceImagePath)) {
        fs.unlinkSync(serviceImagePath); // Delete the service image file
      }
    }
    await Service.deleteMany({ store: storeId });

    // Delete related appointments
    await Appointment.deleteMany({ store: storeId });

    // Delete related staff
    await Staff.deleteMany({ store: storeId });

    // Delete the store itself
    await Store.findByIdAndDelete(storeId);

    return sendSuccess(res, "Store and related data deleted successfully");
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
});

storeRoute.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, address, openTime, closeTime } = req.body;
    let image = req.file.filename;
    const store = await Store.create({
      name: name,
      address: address,
      openTime: openTime,
      closeTime: closeTime,
      image: image,
    });
    if (store) return sendSuccess(res, "Create store successfully", store);
    return sendError(res, "Failed to create store");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// storeRoute.put("/update/:storeId", async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const { name, address, openTime, closeTime } = req.body;
//     const store = await Store.findOne({ _id: storeId });
//     if (!store) return sendError(res, "Store is not found.");
//     await Store.findByIdAndUpdate(storeId, {
//       name: name,
//       address: address,
//       openTime: openTime,
//       closeTime: closeTime,
//     });
//     const updated = await Store.findById(storeId).populate("services");
//     return sendSuccess(res, "Store updated successfully", updated);
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

storeRoute.put("/update/:storeId", upload.single("image"), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, address, openTime, closeTime } = req.body;

    // Find the store to get the old image name
    const store = await Store.findById(storeId);
    if (!store) return sendError(res, "Store is not found.");

    let updatedData = { name, address, openTime, closeTime };

    // Check if a new image file is uploaded
    if (req.file) {
      // Delete the old image file
      const oldImagePath = `src/public/store/${store.image}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      // Add the new image filename to the update data
      updatedData.image = req.file.filename;
    }

    // Update the store with new data
    await Store.findByIdAndUpdate(storeId, updatedData);
    const updated = await Store.findById(storeId);
    
    return sendSuccess(res, "Store updated successfully", updated);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

export default storeRoute;
