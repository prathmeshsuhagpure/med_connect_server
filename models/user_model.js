const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "hospital"],
      default: "patient",
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      default: null,
    },
    registrationNumber: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
