const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stores",
      required: true,
    },
  },
  { timestamps: true }
);

const Staff = mongoose.model("staffs", staffSchema);

module.exports = Staff;
