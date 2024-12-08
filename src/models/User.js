const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: {
    unique: true,
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: String,
  email: String,
  gender: {
    type: String,
    enum: ["Male", "Female"],
  },
  role: {
    type: String,
    required: true,
  },
  totalSpend: {
    type: Number,
    default: 0,
  },

});

const User = mongoose.model("users", userSchema);

module.exports = User;
