const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  duration: {
    type: Number,
    required: true,
    // Time in minutes
  },
  discount: {
    type: Number,
    default: 10,
  },
  dailyDeal: {
    type: Boolean,
    default: false,
  },
  serviceType: {
    type: String,
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stores",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Service = mongoose.model("services", serviceSchema);

module.exports = Service;
