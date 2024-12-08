import express from "express";
import multer from "multer";
import fs from "fs";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
require("dotenv").config();

const Service = require("../models/Service");
const Store = require("../models/Store");

const serviceRoute = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/service");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

serviceRoute.get("/", async (req, res) => {
  try {
    const service = await Service.find().populate("store", "name address");
    const host = req.get("host"); // gets the hostname and port (if any)
    const protocol = req.protocol; // 'http' or 'https'
    const fullDomain = `${protocol}://${host}`;

    // Update each store's image field to include the full domain
    const serviceWithFullImageUrl = service.map((item) => ({
      ...item.toObject(), // convert Mongoose document to plain object
      image: `${fullDomain}/service/${item.image}`, // prepend domain to the image path
    }));
    if (serviceWithFullImageUrl.length > 0)
      return sendSuccess(
        res,
        "Get service information successfully.",
        serviceWithFullImageUrl
      );
    return sendError(res, "Service information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

serviceRoute.get("/dailyDeal/", async (req, res) => {
  try {
    const service = await Service.find({ dailyDeal: true }).populate(
      "store",
      "name address"
    );
    const host = req.get("host"); // gets the hostname and port (if any)
    const protocol = req.protocol; // 'http' or 'https'
    const fullDomain = `${protocol}://${host}`;

    // Update each store's image field to include the full domain
    const serviceWithFullImageUrl = service.map((item) => ({
      ...item.toObject(), // convert Mongoose document to plain object
      image: `${fullDomain}/service/${item.image}`, // prepend domain to the image path
    }));
    if (serviceWithFullImageUrl.length > 0)
      return sendSuccess(
        res,
        "Get service information successfully.",
        serviceWithFullImageUrl
      );
    return sendError(res, "Service information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

serviceRoute.get("/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findOne({ _id: serviceId }).populate("store", "name address");
    const host = req.get("host"); // gets the hostname and port (if any)
    const protocol = req.protocol; // 'http' or 'https'
    const fullDomain = `${protocol}://${host}`;

    service.image = `${fullDomain}/service/${service.image}`;
    if (service)
      return sendSuccess(res, "Get service information successfully.", service);
    return sendError(res, "Service information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

serviceRoute.get("/store/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const service = await Service.find({ store: storeId });
    const host = req.get("host"); // gets the hostname and port (if any)
    const protocol = req.protocol; // 'http' or 'https'
    const fullDomain = `${protocol}://${host}`;

    // Update each store's image field to include the full domain
    const serviceWithFullImageUrl = service.map((item) => ({
      ...item.toObject(), // convert Mongoose document to plain object
      image: `${fullDomain}/service/${item.image}`, // prepend domain to the image path
    }));
    if (serviceWithFullImageUrl.length > 0)
      return sendSuccess(
        res,
        "Get service information successfully.",
        serviceWithFullImageUrl
      );
    return sendError(res, "Service information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// serviceRoute.delete("/:serviceId", async (req, res) => {
//   try {
//     const { serviceId } = req.params;
//     const service = await Service.findOne({ _id: serviceId });
//     if (!service) return sendError(res, "Service not exists");
//     await Service.findByIdAndRemove(serviceId);
//     return sendSuccess(res, "Delete service successfully");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

serviceRoute.delete("/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) return sendError(res, "Service not exists");

    // Retrieve the image path and delete the image file if it exists
    const imagePath = `src/public/service/${service.image}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete the image file
    }

    // Delete the service from the database
    await Service.findByIdAndDelete(serviceId);

    return sendSuccess(res, "Deleted service and updated store successfully");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

serviceRoute.post(
  "/create/:storeId",
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, description, duration, serviceType } = req.body;
      const { storeId } = req.params;
      let image = req.file.filename;
      const service = await Service.create({
        name: name,
        price: price,
        description: description,
        duration: duration,
        serviceType: serviceType,
        store: storeId,
        image: image,
      });

      if (service)
        return sendSuccess(res, "Create service successfully", service);
      return sendError(res, "Failed to create service");
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
  }
);

// serviceRoute.put("/update/:serviceId", async (req, res) => {
//   try {
//     const { serviceId } = req.params;
//     const { name, price, decription, duration } = req.body;
//     const service = await Service.findByIdAndUpdate(serviceId, {
//       name: name,
//       price: price,
//       decription: decription,
//       duration: duration,
//     });
//     if (service)
//       return sendSuccess(res, "Update service successfully", service);
//     return sendError(res, "Failed to update service");
//   } catch (error) {
//     console.log(error);
//     return sendServerError(res);
//   }
// });

serviceRoute.put(
  "/update/:serviceId",
  upload.single("image"),
  async (req, res) => {
    try {
      const { serviceId } = req.params;
      const {
        name,
        price,
        description,
        duration,
        serviceType,
        dailyDeal,
        discount,
      } = req.body;

      // Find the service to get the old image name
      const service = await Service.findById(serviceId);
      if (!service) return sendError(res, "Service not found");

      let updatedData = {
        name,
        price,
        description,
        duration,
        serviceType,
        dailyDeal,
        discount,
      };

      // Check if a new image file is uploaded
      if (req.file) {
        // Delete the old image file
        const oldImagePath = `src/public/service/${service.image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

        // Update the new image filename in the update data
        updatedData.image = req.file.filename;
      }

      // Update the service with new data
      const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        updatedData,
        { new: true }
      );
      return sendSuccess(res, "Update service successfully", updatedService);
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
  }
);

export default serviceRoute;
